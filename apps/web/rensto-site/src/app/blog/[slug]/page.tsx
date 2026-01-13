import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface Params {
    slug: string;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
    const { slug } = await params;
    const db = getFirestoreAdmin();
    const snap = await db.collection(COLLECTIONS.CONTENT_ITEMS)
        .where('slug', '==', slug)
        .limit(1)
        .get();

    if (snap.empty) return { title: 'Post Not Found' };
    const post = snap.docs[0].data();

    return {
        title: post.seoTitle || post.title,
        description: post.seoDescription || post.excerpt,
        openGraph: {
            title: post.seoTitle || post.title,
            description: post.seoDescription || post.excerpt,
            images: post.imageUrl ? [{ url: post.imageUrl }] : [],
        }
    };
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
    const { slug } = await params;
    const db = getFirestoreAdmin();
    const snap = await db.collection(COLLECTIONS.CONTENT_ITEMS)
        .where('slug', '==', slug)
        .limit(1)
        .get();

    if (snap.empty) notFound();
    const post = snap.docs[0].data();

    return (
        <article className="min-h-screen bg-[#0a061e] py-20 px-4">
            <div className="max-w-3xl mx-auto">
                <header className="mb-12">
                    <div className="flex gap-2 mb-6">
                        {post.categories && post.categories.map((cat: string) => (
                            <span key={cat} className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs uppercase font-bold">
                                {cat}
                            </span>
                        ))}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                        {post.title}
                    </h1>
                    <div className="flex items-center gap-4 text-gray-500">
                        <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Rensto AI Strategist</span>
                    </div>
                </header>

                {post.imageUrl && (
                    <div className="rounded-3xl overflow-hidden mb-12 border border-white/10 shadow-2xl">
                        <img src={post.imageUrl} alt={post.title} className="w-full aspect-video object-cover" />
                    </div>
                )}

                <div
                    className="prose prose-invert prose-cyan max-w-none text-gray-300 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: post.content?.replace(/\n/g, '<br/>') }}
                />

                <footer className="mt-20 pt-10 border-t border-white/10 text-center">
                    <p className="text-gray-400 mb-6 font-medium">Enjoyed this article on {post.focusKeyword}?</p>
                    <a
                        href="/contact"
                        className="inline-flex items-center px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold hover:brightness-110 transition-all shadow-lg shadow-cyan-500/20"
                    >
                        Automate your business with Rensto
                    </a>
                </footer>
            </div>
        </article>
    );
}
