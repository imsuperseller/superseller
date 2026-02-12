import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'popular';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const filterTag = searchParams.get('tag');
    const includeDrafts = searchParams.has('includeDrafts');
    const includeInternal = searchParams.has('includeInternal');
    let templates: any[];

    try {
      const where: any = {};
      if (!includeDrafts) where.readinessStatus = 'Active';
      if (category && category !== 'all') where.category = category;

      const pgTemplates = await prisma.template.findMany({ where });

      templates = pgTemplates.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        category: t.category,
        price: t.price || 97,
        downloadPrice: t.price || 97,
        installPrice: t.installPrice,
        customPrice: t.customPrice,
        rating: t.rating || 0,
        downloads: t.downloadCount || 0,
        readinessStatus: t.readinessStatus,
        complexity: t.complexity,
        setupTime: t.setupTime,
        targetMarket: t.targetMarket,
        tags: (t.tags as any) || [],
        features: (t.features as any) || [],
        integrations: (t.integrations as any) || [],
        metrics: t.metrics,
        showInMarketplace: t.showInMarketplace,
        createdAt: t.createdAt,
      }));

      if (templates.length === 0) throw new Error('No templates in Postgres, try Firestore');
    } catch (pgError) {
      // Fallback: Firestore
      console.info('[Migration] marketplace/templates: Postgres miss, falling back to Firestore');
      const db = getFirestoreAdmin();
      let query: any = db.collection(COLLECTIONS.TEMPLATES);
      if (category && category !== 'all') query = query.where('category', '==', category);
      if (!includeDrafts) query = query.where('readinessStatus', '==', 'Active');

      const snapshot = await query.get();
      templates = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        downloadPrice: doc.data().price || doc.data().downloadPrice || 97,
        price: doc.data().price || doc.data().downloadPrice || 97,
        rating: doc.data().rating || 0,
        downloads: doc.data().downloads || 0,
      }));
    }

    // Filter out internal/client-specific templates from public view
    const EXCLUDED_TAGS = ['internal', 'tax4us', 'meatpoint', 'dima', 'client-specific', 'archive', 'testing'];
    if (!includeInternal) {
      templates = templates.filter((t: any) => {
        const tags = t.tags || t.features || [];
        return !tags.some((tag: string) => EXCLUDED_TAGS.includes(tag.toLowerCase()));
      });
    }

    // Explicit tag filter
    if (filterTag) {
      const tagLower = filterTag.toLowerCase();
      templates = templates.filter((t: any) => {
        const tags = t.tags || t.features || [];
        return tags.some((tag: string) => tag.toLowerCase() === tagLower);
      });
    }

    // In-memory search
    if (search) {
      const searchLower = search.toLowerCase();
      templates = templates.filter((t: any) =>
        (t.name || '').toLowerCase().includes(searchLower) ||
        (t.description || '').toLowerCase().includes(searchLower)
      );
    }

    // In-memory sorting
    templates.sort((a: any, b: any) => {
      if (sort === 'price-low') return a.price - b.price;
      if (sort === 'price-high') return b.price - a.price;
      if (sort === 'newest') {
        const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : (a.createdAt?.seconds || 0) * 1000;
        const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : (b.createdAt?.seconds || 0) * 1000;
        return bTime - aTime;
      }
      return (b.downloads || 0) - (a.downloads || 0); // Default 'popular'
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const paginatedTemplates = templates.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      templates: paginatedTemplates,
      pagination: {
        page,
        limit,
        total: templates.length,
        hasMore: templates.length > startIndex + limit,
      },
    });

  } catch (error) {
    console.error('Templates API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}
