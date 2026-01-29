import { MetadataRoute } from 'next';
import nicheEngineData from '@/data/niche_engine.json';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://rensto.com';
  const lastModified = new Date();

  // Core static routes
  const staticRoutes = [
    { url: '', priority: 1, changeFrequency: 'daily' },
    { url: '/whatsapp', priority: 1, changeFrequency: 'daily' },
    { url: '/solutions', priority: 1, changeFrequency: 'daily' },
    { url: '/marketplace', priority: 0.9, changeFrequency: 'weekly' },
    { url: '/dashboard', priority: 0.9, changeFrequency: 'weekly' },
    { url: '/admin', priority: 0.8, changeFrequency: 'weekly' },
    { url: '/process', priority: 0.7, changeFrequency: 'monthly' },
    { url: '/contact', priority: 0.7, changeFrequency: 'monthly' },
    { url: '/legal/privacy', priority: 0.3, changeFrequency: 'yearly' },
    { url: '/legal/terms', priority: 0.3, changeFrequency: 'yearly' },
  ].map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified,
    changeFrequency: route.changeFrequency as any,
    priority: route.priority,
  }));

  return [...staticRoutes];
}
