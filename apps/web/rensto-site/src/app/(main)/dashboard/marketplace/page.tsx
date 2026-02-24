'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  productType: string;
  status: string;
  createdAt: string;
}

interface Stats {
  totalProducts: number;
  activeProducts: number;
  totalPosts: number;
  postsToday: number;
  postsThisWeek: number;
  postsThisMonth: number;
  credits: number;
  subscription: string;
  businessName?: string;
}

export default function MarketplaceDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, statsRes] = await Promise.all([
        fetch('/api/marketplace/customer/products'),
        fetch('/api/marketplace/customer/stats'),
      ]);

      const [productsData, statsData] = await Promise.all([
        productsRes.json(),
        statsRes.json(),
      ]);

      if (productsData.success) {
        setProducts(productsData.products || []);
      }

      if (statsData.success) {
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error('Failed to fetch marketplace data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading marketplace...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">FB Marketplace Automation</h1>
        <p className="text-gray-600 mt-2">
          Manage your automated Facebook Marketplace listings
        </p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="text-sm text-gray-500">Active Products</div>
            <div className="text-3xl font-bold mt-2">{stats.activeProducts}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="text-sm text-gray-500">Posts Today</div>
            <div className="text-3xl font-bold mt-2">{stats.postsToday}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="text-sm text-gray-500">Posts This Month</div>
            <div className="text-3xl font-bold mt-2">{stats.postsThisMonth}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="text-sm text-gray-500">Credits</div>
            <div className="text-3xl font-bold mt-2">{stats.credits}</div>
            <div className="text-xs text-gray-400 mt-1">{stats.subscription} Plan</div>
          </div>
        </div>
      )}

      {/* Products List */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Products</h2>
          <Link
            href="/dashboard/marketplace/products/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Product
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-400 text-lg mb-4">No products yet</div>
            <Link
              href="/dashboard/marketplace/products/new"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Your First Product
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/dashboard/marketplace/products/${product.id}`}
                className="block px-6 py-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">{product.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {product.productType} • {product.status}
                    </p>
                  </div>
                  <div className="text-sm text-gray-400">
                    Created {new Date(product.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <Link
          href="/dashboard/marketplace/posts"
          className="block p-6 bg-white border border-gray-200 rounded-lg hover:border-blue-400 transition"
        >
          <h3 className="font-semibold mb-2">View Posts</h3>
          <p className="text-sm text-gray-600">
            See all your Facebook Marketplace listings
          </p>
        </Link>
        <Link
          href="/dashboard/marketplace/sessions"
          className="block p-6 bg-white border border-gray-200 rounded-lg hover:border-blue-400 transition"
        >
          <h3 className="font-semibold mb-2">Manage Sessions</h3>
          <p className="text-sm text-gray-600">
            Upload GoLogin cookies and manage FB sessions
          </p>
        </Link>
        <Link
          href="/dashboard/marketplace/billing"
          className="block p-6 bg-white border border-gray-200 rounded-lg hover:border-blue-400 transition"
        >
          <h3 className="font-semibold mb-2">Billing & Credits</h3>
          <p className="text-sm text-gray-600">
            Manage subscription and top up credits
          </p>
        </Link>
      </div>
    </div>
  );
}
