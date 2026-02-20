import { getAccessToken, ensureValidToken } from './auth'

const BASE_URL = import.meta.env.VITE_LAYOUT_API_URL ?? 'https://kefa-dev.com/kefa/v1/pdf-template'
const LAYOUT_ID = 1

/** Joriy template id – GET dan keyin saqlanadi, PUT/DELETE da ishlatiladi */
let currentTemplateId: string | null = null

export function getCurrentTemplateId(): string | null {
  return currentTemplateId
}

export interface LayoutRecord {
  id: number
  elements: unknown[]
  pageWidth: number
  pageHeight: number
}

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = getAccessToken()
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

const TEMPLATE_JSON_KEY = 'templateJson'
const OUR_TYPE = 'sampling2'
const OUR_NAME = 'pdf-template'

type TemplateItem = { id?: string; imgId?: string; name?: string; type?: string; pdf?: string }

function getResponseList(json: unknown): TemplateItem[] {
  const obj = json as Record<string, unknown>
  const inner = obj?.dataSource as Record<string, unknown> | undefined
  const inner2 = inner?.dataSource as Record<string, unknown> | undefined
  const list = inner2?.responseList ?? inner?.responseList
  return Array.isArray(list) ? (list as TemplateItem[]) : []
}

function findOurTemplate(list: TemplateItem[]): TemplateItem | undefined {
  return list.find((t) => t?.type === OUR_TYPE && (t?.name === OUR_NAME || !t?.name))
}

function getTemplateIdFromResponse(json: unknown): string | null {
  const obj = json as Record<string, unknown>
  const direct = obj?.id ?? (obj?.dataSource as Record<string, unknown>)?.id ?? (obj?.data as Record<string, unknown>)?.id
  if (typeof direct === 'string' && direct) return direct
  const imgId = (obj?.imgId ?? (obj?.dataSource as Record<string, unknown>)?.imgId ?? (obj?.data as Record<string, unknown>)?.imgId) as unknown
  if (typeof imgId === 'string' && imgId) return imgId
  const list = getResponseList(json)
  const our = findOurTemplate(list)
  if (our?.id) return String(our.id)
  const first = list[0] as TemplateItem | undefined
  const firstId = first?.id ?? first?.imgId
  return typeof firstId === 'string' && firstId ? firstId : null
}

function parseLayoutFromPdfString(pdfStr: string): LayoutRecord | null {
  try {
    const parsed = JSON.parse(pdfStr) as { layout?: Array<{ id?: number; elements?: unknown[]; pageWidth?: number; pageHeight?: number }> }
    const layoutArr = parsed?.layout
    if (!Array.isArray(layoutArr) || layoutArr.length === 0) return null
    const item = layoutArr[0]
    if (!item?.elements || !Array.isArray(item.elements)) return null
    return {
      id: LAYOUT_ID,
      elements: item.elements,
      pageWidth: Number(item.pageWidth) || 210,
      pageHeight: Number(item.pageHeight) || 297,
    }
  } catch {
    return null
  }
}

function parseLayoutResponse(json: unknown): LayoutRecord {
  const obj = json as Record<string, unknown>
  const pdfStr = (obj?.pdf ?? (obj?.dataSource as Record<string, unknown>)?.pdf ?? (obj?.data as Record<string, unknown>)?.pdf) as string | undefined
  if (typeof pdfStr === 'string') {
    const fromPdf = parseLayoutFromPdfString(pdfStr)
    if (fromPdf) return fromPdf
  }
  const inner = (obj?.dataSource ?? obj?.data) as Record<string, unknown> | unknown[] | undefined
  const single = Array.isArray(inner) ? inner[0] : inner
  const target = (single ?? obj) as Record<string, unknown>

  if (target?.elements && Array.isArray(target.elements)) {
    return {
      id: LAYOUT_ID,
      elements: target.elements,
      pageWidth: Number(target.pageWidth) || 210,
      pageHeight: Number(target.pageHeight) || 297,
    }
  }
  const jsonStr = (target?.[TEMPLATE_JSON_KEY] ?? target?.layoutJson ?? target?.data ?? obj?.pdf ?? obj?.[TEMPLATE_JSON_KEY]) as string | undefined
  if (typeof jsonStr === 'string') {
    const fromPdf = parseLayoutFromPdfString(jsonStr)
    if (fromPdf) return fromPdf
    try {
      const parsed = JSON.parse(jsonStr) as LayoutRecord
      if (parsed?.elements && Array.isArray(parsed.elements))
        return { id: LAYOUT_ID, elements: parsed.elements, pageWidth: parsed.pageWidth ?? 210, pageHeight: parsed.pageHeight ?? 297 }
    } catch {
      /* ignore */
    }
  }
  return getEmptyLayout()
}

async function requestWithAuthRetry(url: string, init?: RequestInit): Promise<Response> {
  await ensureValidToken()
  let res = await fetch(url, { ...init, headers: getHeaders() })
  if (res.status === 401) {
    const { refreshAccessToken } = await import('./auth')
    await refreshAccessToken()
    res = await fetch(url, { ...init, headers: getHeaders() })
  }
  return res
}

/** GET /kefa/v1/pdf-template – dataSource.dataSource.responseList dan type=sampling2 ni tanlab layout qaytaradi */
export async function fetchLayout(): Promise<LayoutRecord> {
  const res = await requestWithAuthRetry(BASE_URL)
  if (!res.ok) {
    if (res.status === 404) return getEmptyLayout()
    throw new Error(`Server: ${res.status}`)
  }
  const json = await res.json()
  const list = getResponseList(json)
  const our = findOurTemplate(list)
  if (our?.pdf) {
    currentTemplateId = our.id ? String(our.id) : getTemplateIdFromResponse(json)
    const layout = parseLayoutFromPdfString(our.pdf)
    if (layout) return layout
  }
  currentTemplateId = getTemplateIdFromResponse(json)
  return parseLayoutResponse(json)
}

function buildSaveBody(id: string | null, data: Omit<LayoutRecord, 'id'>): string {
  const layout = { id: String(LAYOUT_ID), ...data }
  const pdfPayload = { layout: [layout] }
  return JSON.stringify({
    imgId: id ?? '',
    name: 'pdf-template',
    type: 'sampling2',
    pdf: JSON.stringify(pdfPayload),
  })
}

const TEMPLATE_ALREADY_EXISTS = 'TEMPLATE_ALREADY_EXISTS'

/** POST /kefa/v1/pdf-template – yangi template yaratish (id bo‘lmaganda) */
async function createLayout(data: Omit<LayoutRecord, 'id'>): Promise<LayoutRecord> {
  const body = buildSaveBody(null, data)
  const res = await requestWithAuthRetry(BASE_URL, {
    method: 'POST',
    body,
  })
  const json = (await res.json()) as { success?: boolean; code?: number; error?: string; dataSource?: unknown }
  if (json?.success === false) {
    const code1010 = json?.code === 1010
    const msg = (json?.error ?? '').toLowerCase()
    if (code1010 || msg.includes('already exists') || msg.includes('template already exists'))
      throw new Error(TEMPLATE_ALREADY_EXISTS)
    throw new Error(json?.error ?? 'Yaratish xatosi')
  }
  if (!res.ok) throw new Error(`Yaratish: ${res.status}`)
  currentTemplateId = getTemplateIdFromResponse(json)
  return parseLayoutResponse(json)
}

/** PUT /kefa/v1/pdf-template/:id – body: imgId, name, type, pdf (db.json format stringified) */
export async function saveLayout(data: Omit<LayoutRecord, 'id'>): Promise<LayoutRecord> {
  let id = currentTemplateId
  if (!id) {
    await fetchLayout()
    id = currentTemplateId
  }
  if (!id) {
    try {
      return await createLayout(data)
    } catch (e) {
      if (e instanceof Error && e.message === TEMPLATE_ALREADY_EXISTS) {
        await fetchLayout()
        id = currentTemplateId
        if (id) {
          const body = buildSaveBody(id, data)
          const res = await requestWithAuthRetry(`${BASE_URL}/${id}`, { method: 'PUT', body })
          if (!res.ok) throw new Error(`Saqlash: ${res.status}`)
          const json = await res.json()
          currentTemplateId = getTemplateIdFromResponse(json) ?? id
          return parseLayoutResponse(json)
        }
      }
      throw e
    }
  }
  const body = buildSaveBody(id, data)
  const res = await requestWithAuthRetry(`${BASE_URL}/${id}`, {
    method: 'PUT',
    body,
  })
  if (!res.ok) throw new Error(`Saqlash: ${res.status}`)
  const json = await res.json()
  currentTemplateId = getTemplateIdFromResponse(json) ?? id
  return parseLayoutResponse(json)
}

/** DELETE /kefa/v1/pdf-template/:id */
export async function deleteLayout(templateId: string): Promise<void> {
  const res = await requestWithAuthRetry(`${BASE_URL}/${templateId}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`O‘chirish: ${res.status}`)
  if (currentTemplateId === templateId) currentTemplateId = null
}

function getEmptyLayout(): LayoutRecord {
  return {
    id: LAYOUT_ID,
    elements: [],
    pageWidth: 210,
    pageHeight: 297,
  }
}
