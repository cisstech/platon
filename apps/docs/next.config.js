const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
})

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  //output: 'export',
  basePath: '/docs/main',
  assetPrefix: '/docs/main/',
  poweredByHeader: true,
  images: {
    unoptimized: true,
  },
 // distDir: '../../dist/apps/docs'
}

module.exports = withNextra(nextConfig)