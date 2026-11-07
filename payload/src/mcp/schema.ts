import { z, type ZodTypeAny } from 'zod'

type JsonSchema = {
  $ref?: string
  additionalProperties?: boolean | JsonSchema
  anyOf?: JsonSchema[]
  description?: string
  enum?: unknown[]
  items?: JsonSchema | JsonSchema[]
  oneOf?: JsonSchema[]
  properties?: Record<string, JsonSchema>
  required?: string[]
  type?: string | string[]
}

const PAYLOAD_MANAGED_FIELDS = new Set(['id', 'createdAt', 'updatedAt'])

function describe(schema: ZodTypeAny, node: JsonSchema) {
  return node.description ? schema.describe(node.description) : schema
}

function union(options: ZodTypeAny[]): ZodTypeAny {
  if (options.length === 0) {
    return z.any()
  }

  if (options.length === 1) {
    return options[0]
  }

  return z.union(options as [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]])
}

function objectToZod(node: JsonSchema, omitManagedFields = false) {
  const required = new Set(node.required ?? [])
  const shape: Record<string, ZodTypeAny> = {}

  for (const [key, property] of Object.entries(node.properties ?? {})) {
    if (omitManagedFields && PAYLOAD_MANAGED_FIELDS.has(key)) {
      continue
    }

    const field = toZod(property)
    shape[key] = required.has(key) ? field : field.optional()
  }

  const object = z.object(shape)
  return node.additionalProperties === false ? object : object.passthrough()
}

function typeToZod(type: string, node: JsonSchema): ZodTypeAny {
  switch (type) {
    case 'string': {
      const values = node.enum?.filter((value): value is string => typeof value === 'string')
      return values && values.length > 0 ? z.enum(values as [string, ...string[]]) : z.string()
    }
    case 'number':
    case 'integer':
      return z.number()
    case 'boolean':
      return z.boolean()
    case 'null':
      return z.null()
    case 'array':
      return z.array(node.items && !Array.isArray(node.items) ? toZod(node.items) : z.any())
    case 'object':
      return objectToZod(node)
    default:
      return z.any()
  }
}

function toZod(node: JsonSchema): ZodTypeAny {
  if (!node || typeof node !== 'object') {
    return z.any()
  }

  // Relationship fields are `oneOf: [id, { $ref: entity }]`. Create and update only take IDs,
  // so `$ref` options are dropped and the rest become a union.
  const options = node.oneOf ?? node.anyOf
  if (options) {
    return describe(union(options.filter((option) => !option?.$ref).map(toZod)), node)
  }

  if (node.$ref || node.type === undefined) {
    return describe(z.any(), node)
  }

  const types = Array.isArray(node.type) ? node.type : [node.type]
  const nonNull = types.filter((type) => type !== 'null')
  const schema = union(nonNull.map((type) => typeToZod(type, node)))

  return describe(types.includes('null') ? schema.nullable() : schema, node)
}

// Replaces @payloadcms/plugin-mcp's convertCollectionSchemaToZod, which turns the JSON Schema into
// Zod source code and runs it with `new Function`. Workers block code generation, so the plugin's
// fallback returned a record schema without `.partial()`, and registering the update tools threw.
// This builds the same Zod object directly. next.config.ts swaps it in at build time.
export const convertCollectionSchemaToZod = (schema: JsonSchema) => objectToZod(schema, true)
