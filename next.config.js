const nextConfig = {
  env: {
    // un comment when you run in deploy
    // API_URL: "https://cuba-nextjs.vercel.app/api",
    //  comment when you run in local below down
    API_URL: "https://cuba-next-five.vercel.app/api",
  },
  images: {
    domains: [
      'kxwnkkuokxsfaivtiibm.supabase.co',
      'supabase.co'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  redirects: async () => {
    return [
      {
        source: "/",
        destination: "/authentication/login",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
