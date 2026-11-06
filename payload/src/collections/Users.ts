import type { CollectionConfig } from 'payload'

import {
  createCloudflareAccessStrategy,
  createLocalDevelopmentStrategy,
  type CloudflareAccessConfig,
} from '../auth/cloudflare-access'

interface CreateUsersOptions {
  cloudflareAccess: CloudflareAccessConfig
  cloudflareAccessEnabled: boolean
  localDevelopmentEnabled: boolean
}

const isAuthenticated: NonNullable<CollectionConfig['access']>['admin'] = ({ req }) =>
  Boolean(req.user)

export function createUsers({
  cloudflareAccess,
  cloudflareAccessEnabled,
  localDevelopmentEnabled,
}: CreateUsersOptions): CollectionConfig {
  if (!cloudflareAccessEnabled && !localDevelopmentEnabled) {
    throw new Error('Cloudflare Access must be enabled outside local development')
  }

  return {
    slug: 'users',
    access: {
      admin: isAuthenticated,
      create: () => false,
      delete: () => false,
      read: isAuthenticated,
      update: () => false,
    },
    admin: {
      useAsTitle: 'email',
    },
    auth: {
      disableLocalStrategy: true,
      strategies: [
        cloudflareAccessEnabled
          ? createCloudflareAccessStrategy(cloudflareAccess)
          : createLocalDevelopmentStrategy(cloudflareAccess.emailDomain),
      ],
    },
    fields: [
      {
        name: 'email',
        type: 'email',
        required: true,
        unique: true,
        index: true,
        access: {
          update: () => false,
        },
        admin: {
          readOnly: true,
        },
      },
      {
        name: 'name',
        type: 'text',
        access: {
          update: () => false,
        },
        admin: {
          readOnly: true,
        },
      },
      {
        name: 'cloudflareAccessSubject',
        type: 'text',
        required: true,
        unique: true,
        index: true,
        access: {
          update: () => false,
        },
        admin: {
          hidden: true,
        },
      },
    ],
  }
}
