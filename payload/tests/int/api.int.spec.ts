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

  it('fetches users', async () => {
    const users = await payload.find({
      collection: 'users',
    })
    expect(users).toBeDefined()
  })
})
