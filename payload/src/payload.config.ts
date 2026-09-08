import fs from 'fs'
import path from 'path'
import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig, type PayloadLogger } from 'payload'
import { fileURLToPath } from 'url'
import { CloudflareContext, getCloudflareContext } from '@opennextjs/cloudflare'
import { GetPlatformProxyOptions } from 'wrangler'
import { r2Storage } from '@payloadcms/storage-r2'

import { Events } from './collections/Events'
import { InstagramPosts } from './collections/InstagramPosts'
import { Media } from './collections/Media'
import { Speakers } from './collections/Speakers'
import { TeamMembers } from './collections/TeamMembers'
import { createUsers } from './collections/Users'
import { Venues } from './collections/Venues'
import { FAQ } from './globals/FAQ'
import { SpeakerPage } from './globals/SpeakerPage'
import { VenuePage } from './globals/VenuePage'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const localWranglerConfig = path.resolve(dirname, '../wrangler.local.jsonc')
const realpath = (value: string) => {
  try {
    return fs.existsSync(value) ? fs.realpathSync(value) : undefined
  } catch {
    return undefined
  }
}

const resolvedArgv = process.argv.map(realpath).filter((value): value is string => Boolean(value))
const isPayloadCLI = resolvedArgv.some((value) => value.endsWith(path.join('payload', 'bin.js')))
const isPayloadScript = process.env.PAYLOAD_SCRIPT === 'true'
const isNextCLI = resolvedArgv.some((value) =>
  value.endsWith(path.join('next', 'dist', 'bin', 'next')),
)
const isBuild = process.env.PAYLOAD_BUILD === 'true'
const isProduction = process.env.NODE_ENV === 'production'

const createLog =
  (level: string, fn: typeof console.log) => (objOrMsg: object | string, msg?: string) => {
    if (typeof objOrMsg === 'string') {
      fn(JSON.stringify({ level, msg: objOrMsg }))
    } else {
      fn(JSON.stringify({ level, ...objOrMsg, msg: msg ?? (objOrMsg as { msg?: string }).msg }))
    }
  }

const cloudflareLogger = {
  level: process.env.PAYLOAD_LOG_LEVEL || 'info',
  trace: createLog('trace', console.debug),
  debug: createLog('debug', console.debug),
  info: createLog('info', console.log),
  warn: createLog('warn', console.warn),
  error: createLog('error', console.error),
  fatal: createLog('fatal', console.error),
  silent: () => {},
} as unknown as PayloadLogger

const cloudflare =
  (isPayloadCLI || isPayloadScript) && isProduction
    ? await getCloudflareContextFromWrangler({ remoteBindings: true })
    : isBuild || isPayloadCLI || isPayloadScript || isNextCLI || !isProduction
      ? await getCloudflareContextFromWrangler({
          configPath: localWranglerConfig,
          persist: isBuild || isNextCLI ? false : true,
          remoteBindings: false,
        })
      : await getCloudflareContext({ async: true })

const Users = createUsers({
  cloudflareAccess: {
    audience: cloudflare.env.CF_ACCESS_AUD,
    emailDomain: cloudflare.env.CF_ACCESS_EMAIL_DOMAIN,
    teamDomain: cloudflare.env.CF_ACCESS_TEAM_DOMAIN,
  },
  cloudflareAccessEnabled: cloudflare.env.CF_ACCESS_ENABLED === 'true',
  localDevelopmentEnabled: !isProduction || isBuild || isNextCLI,
})

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Speakers, Venues, TeamMembers, Events, InstagramPosts],
  globals: [FAQ, SpeakerPage, VenuePage],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteD1Adapter({
    binding: cloudflare.env.D1,
    push: !isProduction && !isPayloadScript,
  }),
  logger: isProduction ? cloudflareLogger : undefined,
  plugins: [
    r2Storage({
      bucket: cloudflare.env.R2,
      collections: { media: true },
    }),
  ],
})

// Adapted from https://github.com/opennextjs/opennextjs-cloudflare/blob/d00b3a13e42e65aad76fba41774815726422cc39/packages/cloudflare/src/api/cloudflare-context.ts#L328C36-L328C46
function getCloudflareContextFromWrangler(
  options: Pick<GetPlatformProxyOptions, 'configPath' | 'persist' | 'remoteBindings'>,
): Promise<CloudflareContext> {
  return import(/* webpackIgnore: true */ `${'__wrangler'.replaceAll('_', '')}`).then(
    ({ getPlatformProxy }) =>
      getPlatformProxy({
        environment: process.env.CLOUDFLARE_ENV,
        ...options,
      } satisfies GetPlatformProxyOptions),
  )
}
