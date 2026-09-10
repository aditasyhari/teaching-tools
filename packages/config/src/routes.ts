export const API_PREFIX = '/api/v1';

export const API_ROUTES = {
  HEALTH: '/health',
  AUTH: {
    GOOGLE: '/auth/google',
    GOOGLE_CALLBACK: '/auth/google/callback',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
  },
  CLASSROOMS: '/classrooms',
  SESSIONS: '/sessions',
} as const;

export const WEB_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  CONSOLE: '/console',
  PROJECTOR: (code: string) => `/projector/${code}`,
  JOIN: (code?: string) => (code ? `/join/${code}` : '/join'),
} as const;
