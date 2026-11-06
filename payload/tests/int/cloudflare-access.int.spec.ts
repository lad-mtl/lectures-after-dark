import { describe, expect, it, vi } from 'vitest'

import { getCloudflareAccessIdentity, type CloudflareAccessConfig } from '@/auth/cloudflare-access'
import { createUsers } from '@/collections/Users'

const config: CloudflareAccessConfig = {
  audience: 'test-audience',
  emailDomain: 'lecturesafterdark.ca',
  teamDomain: 'lecturesafterdark.cloudflareaccess.com',
}

describe('Cloudflare Access identity', () => {
  it('fails closed when neither production Access nor local development auth is enabled', () => {
    expect(() =>
      createUsers({
        cloudflareAccess: config,
        cloudflareAccessEnabled: false,
        localDevelopmentEnabled: false,
      }),
    ).toThrow('Cloudflare Access must be enabled outside local development')
  })

  it('enables API keys and limits user updates to the signed-in user', () => {
    const users = createUsers({
      cloudflareAccess: config,
      cloudflareAccessEnabled: true,
      localDevelopmentEnabled: false,
    })
    const update = users.access?.update as (args: unknown) => unknown

    expect(users.auth).toMatchObject({ disableLocalStrategy: true, useAPIKey: true })
    expect(update({ req: { user: { id: 7 } } })).toEqual({ id: { equals: 7 } })
    expect(update({ req: { user: null } })).toBe(false)
  })

  it('returns null when the Access assertion is missing', async () => {
    const verifyToken = vi.fn()

    await expect(
      getCloudflareAccessIdentity(new Headers(), config, verifyToken),
    ).resolves.toBeNull()
    expect(verifyToken).not.toHaveBeenCalled()
  })

  it('normalizes an allowed Access identity', async () => {
    const headers = new Headers({ 'cf-access-jwt-assertion': 'signed-token' })
    const verifyToken = vi.fn().mockResolvedValue({
      email: ' Editor@LecturesAfterDark.ca ',
      name: 'LAD Editor',
      sub: 'identity-123',
    })

    await expect(getCloudflareAccessIdentity(headers, config, verifyToken)).resolves.toEqual({
      email: 'editor@lecturesafterdark.ca',
      name: 'LAD Editor',
      subject: 'identity-123',
    })
    expect(verifyToken).toHaveBeenCalledWith('signed-token', config)
  })

  it('reads the Access cookie when the assertion header is absent', async () => {
    const headers = new Headers({ cookie: 'theme=dark; CF_Authorization=cookie-token; other=1' })
    const verifyToken = vi.fn().mockResolvedValue({
      email: 'editor@lecturesafterdark.ca',
      sub: 'identity-123',
    })

    await expect(getCloudflareAccessIdentity(headers, config, verifyToken)).resolves.toEqual({
      email: 'editor@lecturesafterdark.ca',
      subject: 'identity-123',
    })
    expect(verifyToken).toHaveBeenCalledWith('cookie-token', config)
  })

  it.each([
    ['a cross-site fetch', { 'sec-fetch-site': 'cross-site' }],
    ['a same-site fetch', { 'sec-fetch-site': 'same-site' }],
    ['a foreign Origin', { origin: 'https://attacker.example' }],
  ])('ignores the Access cookie on %s', async (_label, extraHeaders) => {
    const headers = new Headers({
      cookie: 'CF_Authorization=cookie-token',
      host: 'cms.lecturesafterdark.ca',
      ...extraHeaders,
    })
    const verifyToken = vi.fn()

    await expect(getCloudflareAccessIdentity(headers, config, verifyToken)).resolves.toBeNull()
    expect(verifyToken).not.toHaveBeenCalled()
  })

  it('accepts the Access cookie from a same-origin admin request', async () => {
    const headers = new Headers({
      cookie: 'CF_Authorization=cookie-token',
      host: 'cms.lecturesafterdark.ca',
      origin: 'https://cms.lecturesafterdark.ca',
      'sec-fetch-site': 'same-origin',
    })
    const verifyToken = vi.fn().mockResolvedValue({
      email: 'editor@lecturesafterdark.ca',
      sub: 'identity-123',
    })

    await expect(getCloudflareAccessIdentity(headers, config, verifyToken)).resolves.not.toBeNull()
    expect(verifyToken).toHaveBeenCalledWith('cookie-token', config)
  })

  it('prefers the assertion header over the Access cookie', async () => {
    const headers = new Headers({
      'cf-access-jwt-assertion': 'header-token',
      cookie: 'CF_Authorization=cookie-token',
    })
    const verifyToken = vi.fn().mockResolvedValue({
      email: 'editor@lecturesafterdark.ca',
      sub: 'identity-123',
    })

    await getCloudflareAccessIdentity(headers, config, verifyToken)
    expect(verifyToken).toHaveBeenCalledWith('header-token', config)
  })

  it('rejects identities outside the allowed email domain', async () => {
    const headers = new Headers({ 'cf-access-jwt-assertion': 'signed-token' })
    const verifyToken = vi.fn().mockResolvedValue({
      email: 'editor@example.com',
      sub: 'identity-123',
    })

    await expect(getCloudflareAccessIdentity(headers, config, verifyToken)).resolves.toBeNull()
  })

  it('rejects claims without a stable subject', async () => {
    const headers = new Headers({ 'cf-access-jwt-assertion': 'signed-token' })
    const verifyToken = vi.fn().mockResolvedValue({
      email: 'editor@lecturesafterdark.ca',
    })

    await expect(getCloudflareAccessIdentity(headers, config, verifyToken)).resolves.toBeNull()
  })
})
