import type { CollectionConfig } from 'payload'

import { anyone, authenticated } from '../access/content'

export const Speakers: CollectionConfig = {
  slug: 'speakers',
  labels: {
    singular: 'Speaker',
    plural: 'Speakers',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'topic', 'order', 'updatedAt'],
    group: 'Content',
  },
  defaultSort: 'order',
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'topic',
      type: 'text',
    },
    {
      name: 'bio',
      type: 'textarea',
    },
    {
      name: 'image',
      type: 'text',
      label: 'Image URL',
    },
    {
      name: 'twitter',
      type: 'text',
      label: 'Twitter URL',
    },
    {
      name: 'linkedin',
      type: 'text',
      label: 'LinkedIn URL',
    },
    {
      name: 'website',
      type: 'text',
      label: 'Website URL',
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      index: true,
    },
  ],
}
