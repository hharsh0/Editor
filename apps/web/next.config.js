/** @type {import('next').NextConfig} */
const nextConfig = {
  redirects: async () => {
    return [];
  },
  productionBrowserSourceMaps: true,
};

module.exports = nextConfig;
