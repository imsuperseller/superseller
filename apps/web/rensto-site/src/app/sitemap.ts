import { MetadataRoute } from 'next';
import nicheEngineData from '@/data/niche_engine.json';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://rensto.com';
  const lastModified = new Date();

  // Core static routes
  const staticRoutes = [
    { url: '', priority: 1, changeFrequency: 'daily' },
    { url: '/whatsapp', priority: 1, changeFrequency: 'daily' },
    { url: '/subscriptions', priority: 0.9, changeFrequency: 'weekly' },
    { url: '/custom', priority: 0.9, changeFrequency: 'weekly' },
    { url: '/niches', priority: 0.8, changeFrequency: 'weekly' },
    { url: '/process', priority: 0.7, changeFrequency: 'monthly' },
    { url: '/contact', priority: 0.7, changeFrequency: 'monthly' },
    { url: '/offers', priority: 0.7, changeFrequency: 'monthly' },
    { url: '/docs', priority: 0.6, changeFrequency: 'monthly' },
    { url: '/docs/getting-started', priority: 0.6, changeFrequency: 'monthly' },
    { url: '/legal/privacy', priority: 0.3, changeFrequency: 'yearly' },
    { url: '/legal/terms', priority: 0.3, changeFrequency: 'yearly' },
  ].map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified,
    changeFrequency: route.changeFrequency as any,
    priority: route.priority,
  }));

  // Dynamic industry niche routes
  const nicheRoutes = nicheEngineData.map((niche) => ({
    url: `${baseUrl}/niches/${niche.slug}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...nicheRoutes];
}
