import type { GlobalConfig } from 'payload'

import { anyone, authenticated } from '../access/content'

export const FAQ: GlobalConfig = {
  slug: 'faq',
  label: 'FAQ',
  access: {
    read: anyone,
    update: authenticated,
  },
  admin: {
    group: 'Pages',
  },
  fields: [
    {
      name: 'items',
      type: 'array',
      labels: {
        singular: 'FAQ Item',
        plural: 'FAQ Items',
      },
      fields: [
        {
          name: 'question',
          type: 'text',
          required: true,
        },
        {
          name: 'answer',
          type: 'textarea',
        },
      ],
    },
  ],
}
