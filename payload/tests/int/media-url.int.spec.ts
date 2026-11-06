import { describe, expect, it } from 'vitest'

import { buildMediaFileURL } from '@/media/public-url'

describe('public media URLs', () => {
  it('builds a URL on the configured media hostname', () => {
    expect(
      buildMediaFileURL({
        baseURL: 'https://media.lecturesafterdark.ca/',
        filename: 'speaker.jpg',
      }),
    ).toBe('https://media.lecturesafterdark.ca/speaker.jpg')
  })

  it('preserves object prefixes and URL-encodes key segments', () => {
    expect(
      buildMediaFileURL({
        baseURL: 'https://media.lecturesafterdark.ca',
        filename: 'André #1.jpg',
        prefix: '/speakers/2026/',
      }),
    ).toBe('https://media.lecturesafterdark.ca/speakers/2026/Andr%C3%A9%20%231.jpg')
  })

  it('rejects a missing base URL or filename', () => {
    expect(() => buildMediaFileURL({ baseURL: '', filename: 'speaker.jpg' })).toThrow(
      'MEDIA_BASE_URL must be configured',
    )
    expect(() =>
      buildMediaFileURL({ baseURL: 'https://media.lecturesafterdark.ca', filename: '' }),
    ).toThrow('A media filename must be provided')
  })
})
