import type { PayloadRequest } from 'payload'

export const anyone = () => true

export const authenticated = ({ req }: { req: PayloadRequest }) => Boolean(req.user)
