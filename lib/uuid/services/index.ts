import { init } from '@paralleldrive/cuid2'

// Short ID (5 chars) for human-readable references
const createShortId = init({ length: 5 })

// Long ID (24 chars) for anything needing stronger uniqueness
const createLongId = init({ length: 24 })

// ---- Chat Thread ----
export function generateThreadId() {
  return `chat_${createShortId()}` // chat_ra3f3
}

// ---- Media Assets ----
const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/avif',
]

export function generateMediaId(mimeType: string) {
  const isImage = IMAGE_MIME_TYPES.includes(mimeType)
  const prefix = isImage ? 'img' : 'file'
  return `${prefix}_${createLongId()}` // img_tz4a98xxat96iws9zmbrgj3a or file_...
}

// ---- Generic helpers (add more models here) ----
export function generateId(prefix: string, short = false) {
  const id = short ? createShortId() : createLongId()
  return `${prefix}_${id}`
}