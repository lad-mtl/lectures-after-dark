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
