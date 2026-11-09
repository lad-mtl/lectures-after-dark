import type { CollectionConfig } from 'payload'

import { anyone, authenticated } from '../access/content'

export const TeamMembers: CollectionConfig = {
  slug: 'team-members',
  labels: {
    singular: 'Team Member',
    plural: 'Team Members',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'title', 'order', 'updatedAt'],
    group: 'Content',
  },
  defaultSort: 'order',
  fields: [
    { name: 'imageCredit', type: 'text' },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'image',
      type: 'text',
      label: 'Image URL',
    },
    {
      name: 'linkUrl',
      type: 'text',
      label: 'Link URL',
    },
    {
      name: 'linkText',
      type: 'text',
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      index: true,
    },
  ],
}
