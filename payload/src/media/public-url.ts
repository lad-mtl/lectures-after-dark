interface MediaFileURLInput {
  baseURL: string
  filename: string
  prefix?: string
}

function encodeObjectKeyPart(value: string) {
  return value
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/')
}

export function buildMediaFileURL({ baseURL, filename, prefix }: MediaFileURLInput) {
  const normalizedBaseURL = baseURL.trim().replace(/\/+$/, '')
  const key = [prefix, filename]
    .filter((value): value is string => Boolean(value))
    .map(encodeObjectKeyPart)
    .filter(Boolean)
    .join('/')

  if (!normalizedBaseURL) {
    throw new Error('MEDIA_BASE_URL must be configured')
  }

  if (!key) {
    throw new Error('A media filename must be provided')
  }

  return `${normalizedBaseURL}/${key}`
}
