/**
 * Barcha API va tashqi URLlar env orqali boshqariladi.
 * .env yoki .env.local da VITE_* o'zgaruvchilarni belgilang.
 */

const rawBackend =
  // import.meta.env.VITE_BACKEND_URL ?? import.meta.env.VITE_AUTH_URL ?? 'https://nexinsight.kr'
  import.meta.env.VITE_BACKEND_URL ?? import.meta.env.VITE_AUTH_URL ?? 'https://kefa-dev.com'

export const BACKEND_BASE = rawBackend.replace(/\/$/, '')

export const LAYOUT_API_URL =
  import.meta.env.VITE_LAYOUT_API_URL ?? `${BACKEND_BASE}/kefa/v1/pdf-template`

export const SAMPLING_DEFINE_URL =
  import.meta.env.VITE_SAMPLING_DEFINE_URL ?? `${BACKEND_BASE}/kefa/lab/v1/sampling-define`

export const PDF_CMAP_URL =
  import.meta.env.VITE_PDF_CMAP_URL ?? 'https://unpkg.com/pdfjs-dist@5.4.624/cmaps/'
