'use client';

import { useEffect, useState } from 'react';

interface Post {
  id: string;
  status: string;
  product: {
    name: string;
    productType: string;
  };
  facebookUrl?: string;
  listingTitle?: string;
  price?: number;
  location?: string;
  phoneNumber?: string;
  createdAt: string;
  postedAt?: string;
}

export default function MarketplacePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async () => {
    try {
      const params = new URLSearchParams({
        limit: '50',
        ...(filter !== 'all' && { status: filter }),
      });

      const res = await fetch(`/api/marketplace/customer/posts?${params}`);
      const data = await res.json();

      if (data.success) {
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      queued: 'bg-yellow-100 text-yellow-800',
      posted: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      deleted: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Marketplace Posts</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('queued')}
            className={`px-4 py-2 rounded-lg ${filter === 'queued' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            Queued
          </button>
          <button
            onClick={() => setFilter('posted')}
            className={`px-4 py-2 rounded-lg ${filter === 'posted' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            Posted
          </button>
          <button
            onClick={() => setFilter('failed')}
            className={`px-4 py-2 rounded-lg ${filter === 'failed' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            Failed
          </button>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <div className="text-gray-400 text-lg">No posts found</div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium">{post.product.name}</div>
                    <div className="text-sm text-gray-500">{post.product.productType}</div>
                  </td>
                  <td className="px-6 py-4">
                    {post.facebookUrl ? (
                      <a
                        href={post.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {post.listingTitle || 'View on Facebook'}
                      </a>
                    ) : (
                      <span className="text-gray-400">{post.listingTitle || 'Not posted yet'}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{post.location || '-'}</td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {post.price ? `$${post.price.toFixed(0)}` : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(post.status)}`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
