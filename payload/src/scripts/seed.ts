import 'dotenv/config'

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  getPayload,
  type CollectionSlug,
  type RequiredDataFromCollectionSlug,
  type Where,
} from 'payload'

import config from '../payload.config'
import type { Faq, SpeakerPage, VenuePage } from '../payload-types'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '../../..')
const contentRoot = path.join(repoRoot, 'content')

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
}

function readDirectory<T>(directory: string): T[] {
  if (!fs.existsSync(directory)) {
    return []
  }

  return fs
    .readdirSync(directory)
    .filter((file) => file.endsWith('.json'))
    .sort()
    .map((file) => readJson<T>(path.join(directory, file)))
}

async function upsertCollection<
  TSlug extends CollectionSlug,
  TIdentityField extends keyof RequiredDataFromCollectionSlug<TSlug> & string,
>(
  payload: Awaited<ReturnType<typeof getPayload>>,
  slug: TSlug,
  records: RequiredDataFromCollectionSlug<TSlug>[],
  identityField: TIdentityField,
) {
  if (records.length === 0) {
    return { created: 0, updated: 0, skipped: true }
  }

  let created = 0
  let updated = 0

  for (const record of records) {
    const identity = record[identityField]

    if (typeof identity !== 'string' || !identity.trim()) {
      throw new Error(`${slug} seed record is missing ${identityField}`)
    }

    const existing = await payload.find({
      collection: slug,
      limit: 1,
      overrideAccess: true,
      where: {
        [identityField]: { equals: identity },
      } as Where,
    })
    const document = existing.docs[0]

    if (document) {
      const updateDocument = payload.update.bind(payload) as unknown as (options: {
        collection: TSlug
        data: RequiredDataFromCollectionSlug<TSlug>
        id: number | string
        overrideAccess: true
      }) => Promise<unknown>

      await updateDocument({
        collection: slug,
        id: document.id,
        data: record,
        overrideAccess: true,
      })
      updated += 1
    } else {
      await payload.create({
        collection: slug,
        data: record,
        overrideAccess: true,
      })
      created += 1
    }
  }

  return { created, updated, skipped: false }
}

async function main() {
  const payload = await getPayload({ config })

  const speakers = await upsertCollection(
    payload,
    'speakers',
    readDirectory<RequiredDataFromCollectionSlug<'speakers'>>(path.join(contentRoot, 'speakers')),
    'name',
  )
  const venues = await upsertCollection(
    payload,
    'venues',
    readDirectory<RequiredDataFromCollectionSlug<'venues'>>(path.join(contentRoot, 'venues')),
    'name',
  )
  const teamMembers = await upsertCollection(
    payload,
    'team-members',
    readDirectory<RequiredDataFromCollectionSlug<'team-members'>>(
      path.join(contentRoot, 'team-members'),
    ),
    'name',
  )

  const faq = readJson<Pick<Faq, 'items'>>(path.join(contentRoot, 'faq', 'faq.json'))
  const speakerPage = readJson<
    Pick<SpeakerPage, 'ctaTitle' | 'ctaDescription' | 'ctaButtonText' | 'ctaButtonLink'>
  >(path.join(contentRoot, 'speaker-page', 'speaker-page.json'))
  const venuePage = readJson<
    Pick<VenuePage, 'ctaTitle' | 'ctaDescription' | 'ctaButtonText' | 'ctaButtonLink'>
  >(path.join(contentRoot, 'venue-page', 'venue-page.json'))

  await payload.updateGlobal({
    slug: 'faq',
    data: faq,
    overrideAccess: true,
  })
  await payload.updateGlobal({
    slug: 'speaker-page',
    data: speakerPage,
    overrideAccess: true,
  })
  await payload.updateGlobal({
    slug: 'venue-page',
    data: venuePage,
    overrideAccess: true,
  })

  payload.logger.info({
    msg: 'Payload content seed complete',
    speakers,
    teamMembers,
    venues,
    globals: ['faq', 'speaker-page', 'venue-page'],
  })
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error)
    process.exit(1)
  })
