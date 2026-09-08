import type { CollectionConfig } from 'payload'

import { anyone, authenticated } from '../access/content'

export const Events: CollectionConfig = {
  slug: 'events',
  labels: {
    singular: 'Event',
    plural: 'Events',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'startsAt', 'locationLabel', 'updatedAt'],
    group: 'Content',
  },
  defaultSort: 'startsAt',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'startsAt',
      type: 'date',
      required: true,
      index: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'locationLabel',
      type: 'text',
    },
    {
      name: 'priceLabel',
      type: 'text',
    },
    {
      name: 'imageUrl',
      type: 'text',
      label: 'Image URL',
    },
    {
      name: 'eventbriteUrl',
      type: 'text',
      label: 'Eventbrite URL',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
    },
  ],
}
