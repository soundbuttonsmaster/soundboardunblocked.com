import path from 'node:path';
import { fileURLToPath } from 'node:url';
import webpack from 'next/dist/compiled/webpack/webpack.js';

/** @type {import('next').NextConfig} */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const noopPolyfillPath = path.join(__dirname, 'noop-polyfill.js');

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false, // Enable image optimization
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  compress: true,
  poweredByHeader: false,
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  // Target modern browsers only (ES2022+)
  // This removes unnecessary polyfills for Array.prototype.at, Object.hasOwn, etc.
  swcMinify: true,
  // Explicitly configure SWC to target modern browsers and skip unnecessary transforms
  // This prevents polyfills for: Array.prototype.at, flat, flatMap, Object.fromEntries, 
  // Object.hasOwn, String.prototype.trimStart/trimEnd, class transforms, spread transforms
  experimental: {
    optimizePackageImports: ["@/components", "@/lib", "lucide-react"],
    optimizeCss: true,
    swcTraceProfiling: false,
  },
  // Optimize fonts
  optimizeFonts: true,
  // Disable polyfills for modern features - browsers support them natively
  // This saves ~14 KiB by removing unnecessary polyfills
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.alias = {
        ...config.resolve.alias,
        'next/dist/build/polyfills/polyfill-module': noopPolyfillPath,
      };
      // Disable polyfills for features that modern browsers support natively
      config.resolve.fallback = {
        ...config.resolve.fallback,
        // Don't polyfill these - modern browsers have native support
        fs: false,
        net: false,
        tls: false,
      };
      const { NormalModuleReplacementPlugin } = webpack.webpack;
      config.plugins = config.plugins || [];
      config.plugins.push(
        new NormalModuleReplacementPlugin(
          /next[\\/]+dist[\\/]+build[\\/]+polyfills[\\/]+polyfill-module/,
          noopPolyfillPath
        )
      );
    }
    return config;
  },
  // Optimize route prefetching for better navigation performance
  experimental: {
    optimizePackageImports: ["@/components", "@/lib", "lucide-react"],
    optimizeCss: true,
    swcTraceProfiling: false,
  },
  // Optimize fonts
  optimizeFonts: true,
  // Enable SWC minification
  swcMinify: true,
  turbopack: {},
  async redirects() {
    return [
      // ads.txt is now served directly from public/ads.txt
      // If you need to use the external service, uncomment below:
      // {
      //   source: '/ads.txt',
      //   destination: 'https://srv.adstxtmanager.com/19390/soundboardunblocked.com',
      //   permanent: true,
      // },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:all*(mp3|wav|ogg|m4a)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:all*(woff|woff2|eot|ttf|otf)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600',
          },
        ],
      },
    ]
  },
}

export default nextConfig
