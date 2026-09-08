import type { CollectionConfig } from 'payload'

import { anyone, authenticated } from '../access/content'

export const Venues: CollectionConfig = {
  slug: 'venues',
  labels: {
    singular: 'Venue',
    plural: 'Venues',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'neighborhood', 'order', 'updatedAt'],
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
      name: 'neighborhood',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'imageUrl',
      type: 'text',
      label: 'Image URL',
    },
    {
      name: 'mapsLink',
      type: 'text',
      label: 'Maps URL',
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      index: true,
    },
  ],
}
