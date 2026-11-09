import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access/content'

export const Topics: CollectionConfig = {
  slug: 'topics',
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  admin: { useAsTitle: 'title', group: 'Content', defaultColumns: ['title', 'sourceUrl', 'updatedAt'] },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'sourceUrl', type: 'text', required: true, unique: true, index: true, label: 'Event URL' },
    { name: 'category', type: 'select', options: [
      { label: 'Mind & Behaviour', value: 'mind-behaviour' },
      { label: 'Health & Body', value: 'health-body' },
      { label: 'Science & Technology', value: 'science-technology' },
      { label: 'History & Culture', value: 'history-culture' },
      { label: 'Society & Power', value: 'society-power' },
      { label: 'Work & Leadership', value: 'work-leadership' },
    ] },
    { name: 'description', type: 'textarea' },
  ],
}
