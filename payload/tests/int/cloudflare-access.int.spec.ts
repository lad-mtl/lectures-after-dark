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
