import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: false },
  productionBrowserSourceMaps: false, // Desactivar sourcemaps para reducir tamaño
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' },
      { protocol: 'https', hostname: '*.r2.dev', pathname: '/**' },
    ],
  },
  experimental: {
    // Esto es CLAVE: ayuda a que solo se importe lo que usas
    optimizePackageImports: [
      'lucide-react', 
      '@radix-ui/react-icons', 
      'recharts', 
      '@tabler/icons-react',
      'date-fns',
      'framer-motion',
      '@aws-sdk/client-s3'
    ],
  },
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.optimization.moduleIds = 'deterministic';
      // Evitamos duplicados pesados
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 20000,
      };
    }
    return config;
  },
}

export default withSerwist(nextConfig);
