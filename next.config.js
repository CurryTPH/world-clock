/** @type {import('next').NextConfig} */

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  // Enable webpack compression for better performance
  webpack: (config, { dev, isServer }) => {
    // Optimization only in production build
    if (!dev && !isServer) {
      // Add Terser for better minification
      const TerserPlugin = require('terser-webpack-plugin');
      config.optimization.minimizer = config.optimization.minimizer || [];
      config.optimization.minimizer.push(
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true, // Remove console.log
            },
            output: {
              comments: false, // Remove comments
            },
          },
        })
      );
      
      // Add compression for files
      const CompressionPlugin = require('compression-webpack-plugin');
      config.plugins.push(
        new CompressionPlugin({
          test: /\.(js|css|html|svg)$/,
          threshold: 10240, // Only compress files > 10kb
        })
      );
    }
    
    return config;
  },
  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@heroicons/react', 'date-fns', 'react-select'],
    outputFileTracingRoot: process.cwd(),
  },
};

// Export the configuration with the bundle analyzer
module.exports = withBundleAnalyzer(nextConfig);