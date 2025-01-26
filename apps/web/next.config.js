/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  redirects: async () => {
    return [];
  },
  productionBrowserSourceMaps: true,
};

module.exports = nextConfig;
