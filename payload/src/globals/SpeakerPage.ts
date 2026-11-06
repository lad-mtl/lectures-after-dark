import type { GlobalConfig } from 'payload'

import { anyone, authenticated } from '../access/content'

export const SpeakerPage: GlobalConfig = {
  slug: 'speaker-page',
  label: 'Speaker Page',
  access: {
    read: anyone,
    update: authenticated,
  },
  admin: {
    group: 'Pages',
  },
  fields: [
    {
      name: 'ctaTitle',
      type: 'text',
      label: 'CTA Title',
    },
    {
      name: 'ctaDescription',
      type: 'textarea',
      label: 'CTA Description',
    },
    {
      name: 'ctaButtonText',
      type: 'text',
      label: 'CTA Button Text',
    },
    {
      name: 'ctaButtonLink',
      type: 'text',
      label: 'CTA Button Link',
    },
  ],
}
