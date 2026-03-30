import withSerwistInit from "@serwist/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: false },
  productionBrowserSourceMaps: false,
  output: 'standalone',
  cacheComponents: true,
  
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' },
      { protocol: 'https', hostname: '*.r2.dev', pathname: '/**' },
    ],
  },
  
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
    optimizePackageImports: [
      'lucide-react', 
      '@radix-ui/react-icons', 
      'recharts', 
      '@tabler/icons-react',
      'date-fns',
      'framer-motion',
      'zod'
    ],
  },
  turbopack: {},
  
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.optimization.moduleIds = 'deterministic';
      
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 10000,
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            name: 'framework',
            test: /[\\/]node_modules[\\/](@aws-sdk|lucide-react|recharts|@radix-ui)[\\/]/,
            priority: 40,
            enforce: true,
          },
        },
      };

      config.externalDir = true;
    }
    return config;
  },
}

const isDev = process.env.NODE_ENV === "development";
const disablePwa = process.env.DISABLE_PWA === "true";

// Suppress Turbopack warning as we are in build process
process.env.SERWIST_SUPPRESS_TURBOPACK_WARNING = "1";

export default (isDev || disablePwa)
  ? nextConfig
  : withSerwistInit({
      swSrc: "app/sw.ts",
      swDest: "public/sw.js",
    })(nextConfig);
