import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tools.walikelas.id';

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/tools/', '/join/', '/projector/'],
      disallow: ['/teacher/', '/admin/', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

