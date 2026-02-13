import Link from 'next/link';
import { Metadata } from 'next';
import prisma from '@/lib/prisma';

export const metadata: Metadata = {
    title: 'Rensto | Blog',
    description: 'Insights on SMB automation, AI agents, and autonomous business engines.',
};

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
    const posts = await prisma.contentPost.findMany({
        where: { status: 'published' },
        orderBy: { publishedAt: 'desc' },
    });

    return (
        <div className="min-h-screen bg-[#0a061e] py-20 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-12">Rensto Insights</h1>

                <div className="grid gap-8">
                    {posts.length > 0 ? posts.map((post: any) => (
                        <Link
                            key={post.id}
                            href={`/blog/${post.slug || post.id}`}
                            className="group block p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/50 transition-all"
                        >
                            <div className="flex flex-col md:flex-row gap-6">
                                {(post as any).imageUrl && (
                                    <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden flex-shrink-0">
                                        <img src={(post as any).imageUrl} alt={post.title || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                    </div>
                                )}
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                                        {post.title}
                                    </h2>
                                    <p className="text-gray-400 line-clamp-2 mb-4">
                                        {(post as any).excerpt || post.content?.slice(0, 150)}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ''}</span>
                                        {((post as any).metadata?.categories || (post as any).categories || []).map((cat: string) => (
                                            <span key={cat} className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-xs uppercase font-bold">
                                                {cat}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )) : (
                        <div className="text-center py-20">
                            <p className="text-gray-500">No articles published yet. Check back soon!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
