import type { CollectionConfig } from 'payload'

import { anyone, authenticated } from '../access/content'

export const InstagramPosts: CollectionConfig = {
  slug: 'instagram-posts',
  labels: {
    singular: 'Instagram Post',
    plural: 'Instagram Posts',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'instagramId',
    defaultColumns: ['instagramId', 'mediaType', 'timestamp', 'updatedAt'],
    group: 'Content',
  },
  defaultSort: '-timestamp',
  fields: [
    {
      name: 'instagramId',
      type: 'text',
      label: 'Instagram ID',
      unique: true,
      index: true,
    },
    {
      name: 'caption',
      type: 'textarea',
    },
    {
      name: 'imageUrl',
      type: 'text',
      label: 'Image URL',
      required: true,
    },
    {
      name: 'mediaType',
      type: 'text',
    },
    {
      name: 'permalink',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'timestamp',
      type: 'date',
      index: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
    },
  ],
}
