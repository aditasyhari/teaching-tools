/**
 * PM2 Process Management Configuration
 * WaliKelas Teaching Tools V1 Production Deployment
 *
 * Web: Port 3006
 * API: Port 4006
 */

module.exports = {
  apps: [
    {
      name: 'walikelas-api',
      cwd: './apps/api',
      script: 'dist/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        API_PORT: 4006,
      },
    },
    {
      name: 'walikelas-web',
      cwd: './apps/web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3006',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3006,
      },
    },
  ],
};

