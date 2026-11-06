import { mcpPlugin } from '@payloadcms/plugin-mcp'
import type { Field } from 'payload'

const allOperations = { create: true, delete: true, find: true, update: true }
const findAndUpdate = { find: true, update: true }

// New keys start with every permission enabled. Editors can still untick any of them per key.
function enableCheckboxesByDefault(fields: Field[]): Field[] {
  return fields.map((field) => {
    if (field.type === 'checkbox') {
      return { ...field, defaultValue: true }
    }

    if ('fields' in field && Array.isArray(field.fields)) {
      return { ...field, fields: enableCheckboxesByDefault(field.fields) } as Field
    }

    return field
  })
}

// MCP clients call POST /api/mcp with `Authorization: Bearer <key>`. Editors create keys in
// the admin under MCP > API Keys. A key acts as the editor who created it, so every call goes
// through the same collection access rules as the admin.
export const payloadMcp = mcpPlugin({
  userCollection: 'users',
  overrideApiKeyCollection: (collection) => ({
    ...collection,
    fields: enableCheckboxesByDefault(collection.fields),
  }),
  collections: {
    speakers: {
      description:
        'Speakers who give talks at Lectures After Dark events, with bio, topic and links.',
      enabled: allOperations,
    },
    venues: {
      description: 'Bars and venues that host events, with neighborhood, description and map link.',
      enabled: allOperations,
    },
    'team-members': {
      description: 'Lectures After Dark team members shown on the About page.',
      enabled: allOperations,
    },
    events: {
      description: 'Events stored in the CMS. The public site reads live events from Eventbrite.',
      enabled: allOperations,
    },
    'instagram-posts': {
      description:
        'Instagram posts stored in the CMS. The public site reads live posts from Instagram.',
      enabled: allOperations,
    },
    media: {
      description:
        'Uploaded images. Files cannot be uploaded through MCP, but existing media can be found, edited or deleted.',
      enabled: { delete: true, find: true, update: true },
    },
  },
  globals: {
    faq: {
      description: 'FAQ questions and answers shown on the site.',
      enabled: findAndUpdate,
    },
    'speaker-page': {
      description: 'Call-to-action text and button on the Speakers page.',
      enabled: findAndUpdate,
    },
    'venue-page': {
      description: 'Call-to-action text and button on the Venues page.',
      enabled: findAndUpdate,
    },
  },
})
