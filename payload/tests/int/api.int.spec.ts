import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload

describe('API', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('provisions a passwordless local development user', async () => {
    const { user } = await payload.auth({
      headers: new Headers({ host: 'localhost:3000' }),
    })

    expect(user).toMatchObject({
      cloudflareAccessSubject: 'local-development',
      collection: 'users',
      email: 'developer@lecturesafterdark.ca',
    })
  })

  it('binds a new MCP key to its creator and enables every permission by default', async () => {
    const { user } = await payload.auth({ headers: new Headers({ host: 'localhost:3000' }) })

    if (user?.collection !== 'users') {
      throw new Error('Expected the local development user')
    }

    const key = await payload.create({
      collection: 'payload-mcp-api-keys',
      data: { label: 'test key', user: user.id },
      overrideAccess: false,
      user,
    })

    try {
      expect(typeof key.user === 'object' ? key.user.id : key.user).toBe(user.id)
      expect(key.speakers).toEqual({ create: true, delete: true, find: true, update: true })
      expect(key.media).toEqual({ delete: true, find: true, update: true })
      expect(key.faq).toEqual({ find: true, update: true })
    } finally {
      await payload.delete({ collection: 'payload-mcp-api-keys', id: key.id, overrideAccess: true })
    }
  })

  it('registers every migrated Strapi content model', () => {
    expect(payload.config.collections.map(({ slug }) => slug)).toEqual(
      expect.arrayContaining(['speakers', 'venues', 'team-members', 'events', 'instagram-posts']),
    )
    expect(payload.config.globals.map(({ slug }) => slug)).toEqual(
      expect.arrayContaining(['faq', 'speaker-page', 'venue-page']),
    )
  })

  it('allows public reads of migrated content', async () => {
    const venues = await payload.find({
      collection: 'venues',
      overrideAccess: false,
    })
    const faq = await payload.findGlobal({
      slug: 'faq',
      overrideAccess: false,
    })

    expect(venues).toBeDefined()
    expect(faq).toBeDefined()
  })

  it('rejects unauthenticated content writes', async () => {
    await expect(
      payload.create({
        collection: 'venues',
        data: {
          name: 'Unauthorized Venue',
          neighborhood: 'Test',
        },
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })

  it('fetches users', async () => {
    const users = await payload.find({
      collection: 'users',
    })
    expect(users).toBeDefined()
  })
})
