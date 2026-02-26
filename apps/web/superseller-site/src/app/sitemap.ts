import { MetadataRoute } from 'next';
import { CREW_MEMBERS } from '@/data/crew';
import { NICHES } from '@/data/niches';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://superseller.agency';
  const lastModified = new Date();

  // Core static routes
  const staticRoutes = [
    { url: '', priority: 1, changeFrequency: 'daily' },
    { url: '/crew', priority: 0.9, changeFrequency: 'weekly' },
    { url: '/pricing', priority: 0.9, changeFrequency: 'weekly' },
    { url: '/contact', priority: 0.7, changeFrequency: 'monthly' },
    { url: '/legal/privacy', priority: 0.3, changeFrequency: 'yearly' },
    { url: '/legal/terms', priority: 0.3, changeFrequency: 'yearly' },
  ].map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified,
    changeFrequency: route.changeFrequency as MetadataRoute.Sitemap[0]['changeFrequency'],
    priority: route.priority,
  }));

  // Crew member detail pages
  const crewRoutes = CREW_MEMBERS.map((member) => ({
    url: `${baseUrl}/crew/${member.slug}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Niche pages
  const nicheRoutes = NICHES.map((niche) => ({
    url: `${baseUrl}/${niche.slug}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...crewRoutes, ...nicheRoutes];
}
