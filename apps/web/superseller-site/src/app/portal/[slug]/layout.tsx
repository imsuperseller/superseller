import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';

interface TenantBranding {
    name: string;
    slug: string;
    logoUrl?: string;
    primaryColor?: string;
    accentColor?: string;
    features?: Record<string, boolean>;
}

async function getTenant(slug: string): Promise<TenantBranding | null> {
    const tenant = await prisma.tenant.findUnique({
        where: { slug },
        select: { name: true, slug: true, settings: true, status: true },
    });

    if (!tenant || tenant.status !== 'active') return null;

    const settings = (tenant.settings as Record<string, any>) || {};
    return {
        name: tenant.name,
        slug: tenant.slug,
        logoUrl: settings.branding?.logoUrl,
        primaryColor: settings.branding?.primaryColor || '#f47920',
        accentColor: settings.branding?.accentColor || '#4ecdc4',
        features: settings.features || {},
    };
}

export default async function TenantPortalLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const tenant = await getTenant(slug);

    if (!tenant) {
        notFound();
    }

    return (
        <div
            className="min-h-screen bg-[var(--superseller-bg-primary)]"
            style={{
                '--tenant-primary': tenant.primaryColor,
                '--tenant-accent': tenant.accentColor,
            } as React.CSSProperties}
        >
            {/* Tenant header bar */}
            <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                        {tenant.logoUrl ? (
                            <img src={tenant.logoUrl} alt={tenant.name} className="h-8 w-auto" />
                        ) : (
                            <span className="text-lg font-semibold text-white">{tenant.name}</span>
                        )}
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60">
                            Powered by SuperSeller AI
                        </span>
                    </div>
                    <nav className="flex items-center gap-4">
                        <a href={`/`} className="text-sm text-white/70 hover:text-white transition-colors">
                            Dashboard
                        </a>
                        <a href={`/leads`} className="text-sm text-white/70 hover:text-white transition-colors">
                            Leads
                        </a>
                        <a href={`/videos`} className="text-sm text-white/70 hover:text-white transition-colors">
                            Videos
                        </a>
                        <a href={`/settings`} className="text-sm text-white/70 hover:text-white transition-colors">
                            Settings
                        </a>
                    </nav>
                </div>
            </header>

            {/* Pass tenant context to children */}
            <main className="mx-auto max-w-7xl px-4 py-8">
                {children}
            </main>

            {/* Footer with SuperSeller branding */}
            <footer className="border-t border-white/10 py-4 text-center text-xs text-white/40">
                <a href="https://superseller.agency" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors">
                    Powered by SuperSeller AI
                </a>
            </footer>
        </div>
    );
}
