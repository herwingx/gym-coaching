import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: false },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' },
      { protocol: 'https', hostname: '*.r2.dev', pathname: '/**' },
    ],
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react', 
      '@radix-ui/react-icons', 
      'recharts', 
      '@tabler/icons-react',
      'date-fns',
      'framer-motion'
    ],
  },
  // Añadimos esto para silenciar el error de Turbopack vs Webpack
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.optimization.moduleIds = 'deterministic';
    }
    return config;
  },
}

export default withSerwist(nextConfig);
