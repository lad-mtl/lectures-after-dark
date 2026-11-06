import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose'
import type { AuthStrategy, Payload } from 'payload'

import type { User } from '../payload-types'

const ACCESS_JWT_HEADER = 'cf-access-jwt-assertion'
const jwksByTeamDomain = new Map<string, ReturnType<typeof createRemoteJWKSet>>()

export interface CloudflareAccessConfig {
  audience: string
  emailDomain: string
  teamDomain: string
}

export interface CloudflareAccessIdentity {
  email: string
  name?: string
  subject: string
}

type VerifyAccessToken = (token: string, config: CloudflareAccessConfig) => Promise<JWTPayload>

function normalizeHostname(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '')
}

function getJwks(teamDomain: string) {
  const normalizedTeamDomain = normalizeHostname(teamDomain)
  const existing = jwksByTeamDomain.get(normalizedTeamDomain)

  if (existing) {
    return existing
  }

  const jwks = createRemoteJWKSet(new URL(`https://${normalizedTeamDomain}/cdn-cgi/access/certs`))
  jwksByTeamDomain.set(normalizedTeamDomain, jwks)
  return jwks
}

export async function verifyCloudflareAccessToken(
  token: string,
  config: CloudflareAccessConfig,
): Promise<JWTPayload> {
  const teamDomain = normalizeHostname(config.teamDomain)
  const { payload } = await jwtVerify(token, getJwks(teamDomain), {
    algorithms: ['RS256'],
    audience: config.audience,
    issuer: `https://${teamDomain}`,
  })

  return payload
}

export async function getCloudflareAccessIdentity(
  headers: Headers,
  config: CloudflareAccessConfig,
  verifyToken: VerifyAccessToken = verifyCloudflareAccessToken,
): Promise<CloudflareAccessIdentity | null> {
  const token = headers.get(ACCESS_JWT_HEADER)

  if (!token) {
    return null
  }

  const claims = await verifyToken(token, config)
  const email = typeof claims.email === 'string' ? claims.email.trim().toLowerCase() : ''
  const subject = typeof claims.sub === 'string' ? claims.sub.trim() : ''
  const emailDomain = config.emailDomain.trim().toLowerCase().replace(/^@/, '')

  if (!email || !subject || !email.endsWith(`@${emailDomain}`)) {
    return null
  }

  const name = typeof claims.name === 'string' ? claims.name.trim() : ''

  return {
    email,
    ...(name ? { name } : {}),
    subject,
  }
}

async function findUser(payload: Payload, identity: CloudflareAccessIdentity) {
  const result = await payload.find({
    collection: 'users',
    limit: 1,
    overrideAccess: true,
    where: {
      or: [
        { cloudflareAccessSubject: { equals: identity.subject } },
        { email: { equals: identity.email } },
      ],
    },
  })

  return result.docs[0] ?? null
}

async function provisionUser(payload: Payload, identity: CloudflareAccessIdentity) {
  const existing = await findUser(payload, identity)

  if (existing) {
    if (
      existing.cloudflareAccessSubject !== identity.subject ||
      existing.email !== identity.email ||
      (identity.name && existing.name !== identity.name)
    ) {
      const updated = await payload.update({
        collection: 'users',
        id: existing.id,
        data: {
          cloudflareAccessSubject: identity.subject,
          email: identity.email,
          ...(identity.name ? { name: identity.name } : {}),
        },
        overrideAccess: true,
      })

      return 'docs' in updated ? ((updated as { docs: User[] }).docs[0] ?? existing) : updated
    }

    return existing
  }

  try {
    return await payload.create({
      collection: 'users',
      data: {
        cloudflareAccessSubject: identity.subject,
        email: identity.email,
        ...(identity.name ? { name: identity.name } : {}),
      },
      overrideAccess: true,
    })
  } catch (error) {
    // Multiple Admin requests can race while provisioning a first-time user.
    const concurrentlyCreated = await findUser(payload, identity)

    if (
      concurrentlyCreated?.cloudflareAccessSubject === identity.subject &&
      concurrentlyCreated.email === identity.email
    ) {
      return concurrentlyCreated
    }

    throw error
  }
}

export function createCloudflareAccessStrategy(config: CloudflareAccessConfig): AuthStrategy {
  return {
    name: 'cloudflare-access',
    authenticate: async ({ headers, payload }) => {
      try {
        const identity = await getCloudflareAccessIdentity(headers, config)

        if (!identity) {
          return { user: null }
        }

        const user = await provisionUser(payload, identity)
        return { user: { collection: 'users', ...user } }
      } catch (error) {
        payload.logger.warn({ err: error, msg: 'Cloudflare Access authentication failed' })
        return { user: null }
      }
    },
  }
}

export function createLocalDevelopmentStrategy(emailDomain: string): AuthStrategy {
  const email = `developer@${emailDomain.trim().toLowerCase().replace(/^@/, '')}`

  return {
    name: 'local-development',
    authenticate: async ({ headers, payload }) => {
      const hostname = (headers.get('host') ?? '').split(':')[0]

      if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        return { user: null }
      }

      const user = await provisionUser(payload, {
        email,
        name: 'Local Developer',
        subject: 'local-development',
      })

      return { user: { collection: 'users', ...user } }
    },
  }
}
