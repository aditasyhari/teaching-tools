/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@walikelas/ui',
    '@walikelas/types',
    '@walikelas/config',
    '@walikelas/validation',
    '@walikelas/api-client',
  ],
};

export default nextConfig;

