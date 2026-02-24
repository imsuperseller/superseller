import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/app/', '/admin/', '/video/'],
    },
    sitemap: 'https://rensto.com/sitemap.xml',
  };
}
