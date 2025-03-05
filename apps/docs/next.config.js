const { BUNDLED_LANGUAGES, getHighlighter } = require('shiki');

const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
  // Add custom languages to syntax highlighting
  mdxOptions: {
    rehypePrettyCodeOptions: {
      getHighlighter: options =>
        getHighlighter({
          ...options,
          langs: [
            ...BUNDLED_LANGUAGES,
            {
              id: 'ple',
              scopeName: 'source.ple',
              path: require.resolve('./ple.tmLanguage.json'),
              aliases: ['pl-js', 'pl-py'],

            },
          ]
        })
    }
  }

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
