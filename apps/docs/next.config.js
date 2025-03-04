const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
})

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = process.env.GITHUB_PAGES
  ? {
      output: 'export',
      basePath: '/platon/docs',
      assetPrefix: '/platon/docs/',
      poweredByHeader: true,
      images: {
        unoptimized: true,
      },
      distDir: '../../dist/apps/home/docs',
    }
  : process.env.NODE_ENV === 'production'
  ? {
      output: 'export',
      basePath: '/docs',
      assetPrefix: '/docs/',
      poweredByHeader: true,
      images: {
        unoptimized: true,
      },
      distDir: '../../dist/apps/docs',
    }
  : {
      basePath: '/docs',
      assetPrefix: '/docs/',
      poweredByHeader: true,
      images: {
        unoptimized: true,
      },
    }

module.exports = withNextra(nextConfig)
