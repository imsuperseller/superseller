import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/marketplace/customer/products/[productId]
 * Get a specific product
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await verifySession();
    if (!session.isValid || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const product = await prisma.marketplaceProduct.findFirst({
      where: {
        id: params.productId,
        customer: { userId: session.userId },
      },
      include: {
        customer: {
          select: {
            id: true,
            businessName: true,
            status: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        customerId: product.customerId,
        productType: product.productType,
        name: product.name,
        status: product.status,
        config: product.config,
        pricing: product.pricing,
        schedule: product.schedule,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        customer: product.customer,
      },
    });
  } catch (error) {
    console.error('GET /api/marketplace/customer/products/[productId] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/marketplace/customer/products/[productId]
 * Update a product
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await verifySession();
    if (!session.isValid || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, config, pricing, schedule, status } = body;

    // Verify ownership
    const existing = await prisma.marketplaceProduct.findFirst({
      where: {
        id: params.productId,
        customer: { userId: session.userId },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Update product
    const product = await prisma.marketplaceProduct.update({
      where: { id: params.productId },
      data: {
        ...(name && { name }),
        ...(config && { config }),
        ...(pricing && { pricing }),
        ...(schedule && { schedule }),
        ...(status && { status }),
      },
    });

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        customerId: product.customerId,
        productType: product.productType,
        name: product.name,
        status: product.status,
        config: product.config,
        pricing: product.pricing,
        schedule: product.schedule,
        updatedAt: product.updatedAt,
      },
    });
  } catch (error) {
    console.error('PATCH /api/marketplace/customer/products/[productId] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/marketplace/customer/products/[productId]
 * Delete a product
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await verifySession();
    if (!session.isValid || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const existing = await prisma.marketplaceProduct.findFirst({
      where: {
        id: params.productId,
        customer: { userId: session.userId },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Soft delete (set status to DELETED)
    await prisma.marketplaceProduct.update({
      where: { id: params.productId },
      data: { status: 'DELETED' },
    });

    return NextResponse.json({
      success: true,
      message: 'Product deleted',
    });
  } catch (error) {
    console.error('DELETE /api/marketplace/customer/products/[productId] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
