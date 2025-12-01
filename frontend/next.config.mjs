const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.inkling.jomygeorge.net',
        port: '',
        pathname: '/api/**', 
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/api/**',
      },
    ],
  },
};

export default nextConfig;