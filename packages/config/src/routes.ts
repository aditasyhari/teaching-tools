export const API_PREFIX = '/api/v1';

export const API_ROUTES = {
  HEALTH: '/health',
  AUTH: {
    GOOGLE: '/auth/google',
    GOOGLE_CALLBACK: '/auth/google/callback',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
    DEV_LOGIN: '/auth/dev-login',
  },
  USERS: {
    PROFILE: '/users/profile',
  },
  CLASSROOMS: '/classrooms',
  NOTES: '/notes',
  SESSIONS: '/sessions',
  QUIZZES: '/quizzes',
  POLLS: '/polls',
} as const;

export const WEB_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  CONSOLE: '/console',
  PROJECTOR: (code: string) => `/projector/${code}`,
  JOIN: (code?: string) => (code ? `/join/${code}` : '/join'),
  POLLS: '/teacher/polls',
} as const;
