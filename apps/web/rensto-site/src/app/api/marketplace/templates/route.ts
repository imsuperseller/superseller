import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'popular';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const filterTag = searchParams.get('tag');

    const db = getFirestoreAdmin();
    let query: any = db.collection(COLLECTIONS.TEMPLATES);

    // Apply filters
    if (category && category !== 'all') {
      query = query.where('category', '==', category);
    }

    // Readiness filter - hide drafts unless specified
    if (!searchParams.has('includeDrafts')) {
      query = query.where('readinessStatus', '==', 'Active');
    }

    // Firestore doesn't support easy full-text search without an external service like Algolia,
    // so we'll do a simple category/collection fetch and filter in-memory for small datasets,
    // or just rely on category for now.

    const snapshot = await query.get();
    let templates = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      // Ensure specific fields exist for frontend
      downloadPrice: doc.data().price,
      rating: doc.data().rating || 0,
      downloads: doc.data().downloads || 0
    }));

    // Filter out internal and client-specific templates from public view
    const EXCLUDED_TAGS = ['internal', 'tax4us', 'meatpoint', 'dima', 'client-specific', 'archive', 'testing'];
    if (!searchParams.has('includeInternal')) {
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

    // In-memory search fallback
    if (search) {
      const searchLower = search.toLowerCase();
      templates = templates.filter((t: any) =>
        t.name.toLowerCase().includes(searchLower) ||
        t.description.toLowerCase().includes(searchLower)
      );
    }

    // In-memory sorting
    templates.sort((a: any, b: any) => {
      if (sort === 'price-low') return a.price - b.price;
      if (sort === 'price-high') return b.price - a.price;
      if (sort === 'newest') return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
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
        hasMore: templates.length > startIndex + limit
      }
    });

  } catch (error) {
    console.error('Templates API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}
