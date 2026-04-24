import { LAYOUT_API_URL } from '../config/env'
import { getAccessToken, ensureValidToken, refreshAccessToken, handleLogout } from './auth'

const BASE_URL = LAYOUT_API_URL
const LAYOUT_ID = 1

export type TemplateType = 'sampling2' | 'thc' | 'mobileScale' | 'operation' | 'envMeasurement' | 'wasteWater' | 'safetyInspection'

// Har bir template turi uchun alohida ID
const currentTemplateIds: Record<string, string | null> = {}

function getTemplateId(type: TemplateType): string | null {
  return currentTemplateIds[type] ?? null
}

function setTemplateId(type: TemplateType, id: string | null): void {
  currentTemplateIds[type] = id
}

export function getCurrentTemplateId(type: TemplateType = 'sampling2'): string | null {
  return getTemplateId(type)
}

export interface LayoutRecord {
  id: number
  elements: unknown[]
  pageWidth: number
  pageHeight: number
}

export type LayoutPayload =
  | Omit<LayoutRecord, 'id'>
  | { layout: Array<{ id?: string; elements: unknown[]; pageWidth: number; pageHeight: number }> }

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = getAccessToken()
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

const TEMPLATE_JSON_KEY = 'templateJson'
const OUR_NAME = 'pdf-template'

type TemplateItem = { id?: string; imgId?: string; name?: string; type?: string; pdf?: string }

function getResponseList(json: unknown): TemplateItem[] {
  const obj = json as Record<string, unknown>
  const inner = obj?.dataSource as Record<string, unknown> | undefined
  const inner2 = inner?.dataSource as Record<string, unknown> | undefined
  const list = inner2?.responseList ?? inner?.responseList
  return Array.isArray(list) ? (list as TemplateItem[]) : []
}

function findOurTemplate(list: TemplateItem[], type: TemplateType): TemplateItem | undefined {
  const norm = (s: unknown) => (typeof s === 'string' ? s.trim().toLowerCase() : '')
  return list.find(
    (t) => norm(t?.type) === norm(type) && (norm(t?.name) === OUR_NAME.toLowerCase() || norm(t?.name) === ''),
  )
}

function getTemplateIdFromResponse(json: unknown, type: TemplateType): string | null {
  const obj = json as Record<string, unknown>
  const direct =
    obj?.id ??
    (obj?.dataSource as Record<string, unknown>)?.id ??
    (obj?.data as Record<string, unknown>)?.id
  if (typeof direct === 'string' && direct) return direct
  const imgId = (
    obj?.imgId ??
    (obj?.dataSource as Record<string, unknown>)?.imgId ??
    (obj?.data as Record<string, unknown>)?.imgId
  ) as unknown
  if (typeof imgId === 'string' && imgId) return imgId
  const list = getResponseList(json)
  const our = findOurTemplate(list, type)
  if (our?.id) return String(our.id)
  return null
}

function parseLayoutFromPdfString(pdfStr: string): LayoutRecord | { layout: LayoutRecord[] } | null {
  try {
    const parsed = JSON.parse(pdfStr) as {
      layout?: Array<{ id?: number | string; elements?: unknown[]; pageWidth?: number; pageHeight?: number }>
    }
    const layoutArr = parsed?.layout
    if (!Array.isArray(layoutArr) || layoutArr.length === 0) return null
    const pages: LayoutRecord[] = layoutArr
      .filter((item) => item?.elements && Array.isArray(item.elements))
      .map((item) => ({
        id: LAYOUT_ID,
        elements: item.elements!,
        pageWidth: Number(item.pageWidth) || 210,
        pageHeight: Number(item.pageHeight) || 297,
      }))
    if (pages.length === 0) return null
    if (pages.length === 1) return pages[0]
    return { layout: pages }
  } catch {
    return null
  }
}

function parseLayoutResponse(json: unknown): LayoutRecord | { layout: LayoutRecord[] } {
  const obj = json as Record<string, unknown>
  const pdfStr = (
    obj?.pdf ??
    (obj?.dataSource as Record<string, unknown>)?.pdf ??
    (obj?.data as Record<string, unknown>)?.pdf
  ) as string | undefined
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
  const jsonStr = (
    target?.[TEMPLATE_JSON_KEY] ??
    target?.layoutJson ??
    target?.data ??
    obj?.pdf ??
    obj?.[TEMPLATE_JSON_KEY]
  ) as string | undefined
  if (typeof jsonStr === 'string') {
    const fromPdf = parseLayoutFromPdfString(jsonStr)
    if (fromPdf) return fromPdf
    try {
      const parsed = JSON.parse(jsonStr) as LayoutRecord
      if (parsed?.elements && Array.isArray(parsed.elements))
        return { id: LAYOUT_ID, elements: parsed.elements, pageWidth: parsed.pageWidth ?? 210, pageHeight: parsed.pageHeight ?? 297 }
    } catch {
      console.warn('Failed to parse layout from jsonStr')
    }
  }
  return getEmptyLayout()
}

async function requestWithAuthRetry(url: string, init?: RequestInit): Promise<Response> {
  await ensureValidToken()
  let res = await fetch(url, { ...init, headers: getHeaders() })
  if (res.status === 401) {
    try {
      await refreshAccessToken()
      res = await fetch(url, { ...init, headers: getHeaders() })
    } catch {
      handleLogout()
      const body = await res.clone().json().catch(() => ({})) as { message?: string }
      throw new Error(body?.message ?? 'Your token is expired')
    }
    if (res.status === 401) {
      handleLogout()
      const body = await res.clone().json().catch(() => ({})) as { message?: string }
      throw new Error(body?.message ?? 'Your token is expired')
    }
  }
  return res
}

export async function fetchLayout(type: TemplateType = 'sampling2'): Promise<LayoutRecord | { layout: LayoutRecord[] }> {
  const res = await requestWithAuthRetry(BASE_URL)
  if (!res.ok) {
    if (res.status === 404) return getEmptyLayout()
    throw new Error(`Server: ${res.status}`)
  }
  const json = await res.json()
  const list = getResponseList(json)
  const our = findOurTemplate(list, type)
  if (our?.pdf) {
    setTemplateId(type, our.id ? String(our.id) : null)
    const layout = parseLayoutFromPdfString(our.pdf)
    if (layout) return layout
  }
  // Agar topilmasa — bo'sh layout qaytaramiz (boshqa type ni o'chirmaymiz)
  setTemplateId(type, null)
  return getEmptyLayout()
}

function buildSaveBody(id: string | null, layoutArray: unknown[], type: TemplateType): string {
  return JSON.stringify({
    imgId: id ?? '',
    name: OUR_NAME,
    type,
    pdf: JSON.stringify({ layout: layoutArray }),
  })
}

function toLayoutArray(data: LayoutPayload) {
  return 'layout' in data && Array.isArray(data.layout)
    ? data.layout.map((p) => ({
        id: p.id ?? String(LAYOUT_ID),
        elements: p.elements,
        pageWidth: p.pageWidth,
        pageHeight: p.pageHeight,
      }))
    : [{ id: String(LAYOUT_ID), ...data }]
}

const TEMPLATE_ALREADY_EXISTS = 'TEMPLATE_ALREADY_EXISTS'

async function createLayout(layoutArray: unknown[], type: TemplateType): Promise<LayoutRecord | { layout: LayoutRecord[] }> {
  const body = buildSaveBody(null, layoutArray, type)
  const res = await requestWithAuthRetry(BASE_URL, { method: 'POST', body })
  const json = (await res.json()) as { success?: boolean; code?: number; error?: string }
  if (json?.success === false) {
    const msg = (json?.error ?? '').toLowerCase()
    if (json?.code === 1010 || msg.includes('already exists') || msg.includes('template already exists'))
      throw new Error(TEMPLATE_ALREADY_EXISTS)
    throw new Error(json?.error ?? 'Yaratish xatosi')
  }
  if (!res.ok) throw new Error(`Yaratish: ${res.status}`)
  setTemplateId(type, getTemplateIdFromResponse(json, type))
  return parseLayoutResponse(json)
}

export async function saveLayout(
  data: LayoutPayload,
  type: TemplateType = 'sampling2',
): Promise<LayoutRecord | { layout: LayoutRecord[] }> {
  const layoutArray = toLayoutArray(data)

  let id = getTemplateId(type)
  if (!id) {
    await fetchLayout(type)
    id = getTemplateId(type)
  }

  // ID topilmasa — yangi template yaratamiz
  if (!id) {
    try {
      return await createLayout(layoutArray, type)
    } catch (e) {
      if (e instanceof Error && e.message === TEMPLATE_ALREADY_EXISTS) {
        // Server "already exists" desa, qayta fetch qilib ID ni olamiz
        await fetchLayout(type)
        id = getTemplateId(type)
        if (id) {
          const body = buildSaveBody(id, layoutArray, type)
          const res = await requestWithAuthRetry(`${BASE_URL}/${id}`, { method: 'PUT', body })
          if (!res.ok) throw new Error(`Saqlash: ${res.status}`)
          const json = await res.json()
          setTemplateId(type, getTemplateIdFromResponse(json, type) ?? id)
          return parseLayoutResponse(json)
        }
      }
      throw e
    }
  }

  // ID mavjud — yangilaymiz
  const body = buildSaveBody(id, layoutArray, type)
  const res = await requestWithAuthRetry(`${BASE_URL}/${id}`, { method: 'PUT', body })
  if (!res.ok) throw new Error(`Saqlash: ${res.status}`)
  const json = await res.json()
  setTemplateId(type, getTemplateIdFromResponse(json, type) ?? id)
  return parseLayoutResponse(json)
}

export async function deleteLayout(templateId: string, type: TemplateType = 'sampling2'): Promise<void> {
  const res = await requestWithAuthRetry(`${BASE_URL}/${templateId}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`O'chirish: ${res.status}`)
  if (getTemplateId(type) === templateId) setTemplateId(type, null)
}

function getEmptyLayout(): LayoutRecord {
  return { id: LAYOUT_ID, elements: [], pageWidth: 210, pageHeight: 297 }
}
