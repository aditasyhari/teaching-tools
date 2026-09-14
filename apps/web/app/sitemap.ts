import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tools.walikelas.id';
  const now = new Date();

  const publicRoutes = [
    '',
    '/join',
    '/projector',
    '/projector/demo',
    '/tools',
    '/tools/timer',
    '/tools/random-picker',
    '/tools/group-maker',
    '/tools/scoreboard',
    '/tools/notes',
    '/tools/live-quiz',
    '/tools/live-poll',
    '/tools/question-box',
    '/tools/raise-hand',
    '/tools/brainstorm-board',
    '/tools/exit-ticket',
  ];

  return publicRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route.startsWith('/tools') ? 0.8 : 0.6,
  }));
}

