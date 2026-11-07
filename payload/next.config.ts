import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  experimental: {
    // Payload initializes a local D1 proxy while Next collects route data.
    // Serial collection avoids concurrent workerd processes locking the same SQLite state.
    cpus: 1,
  },
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  // Packages with Cloudflare Workers (workerd) specific code
  // Read more: https://opennext.js.org/cloudflare/howtos/workerd
  serverExternalPackages: ['jose', 'pg-cloudflare'],

  // Your Next.js config here
  webpack: (webpackConfig, { webpack }) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    // Two parts of @payloadcms/plugin-mcp don't run on Workers. See src/mcp/handler.ts and
    // src/mcp/schema.ts for what each replacement fixes.
    webpackConfig.resolve.alias = {
      ...webpackConfig.resolve.alias,
      'mcp-handler$': path.resolve(dirname, 'src/mcp/handler.ts'),
    }
    webpackConfig.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /schemaConversion[\\/]convertCollectionSchemaToZod\.js$/,
        path.resolve(dirname, 'src/mcp/schema.ts'),
      ),
    )

    return webpackConfig
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
