/**
 * Sampling API – backenddan bitta sampling olish va valueList dan
 * PDF uchun Record<string, string> (dbName → value) yig‘ish.
 * kefa-dev-front dagi /lab/v1/sampling bilan bir xil.
 */
import { getAccessToken, ensureValidToken } from './auth'

const BASE = import.meta.env.VITE_BACKEND_URL ?? import.meta.env.VITE_AUTH_URL ?? 'https://kefa-dev.com'
const SAMPLING_BASE = `${BASE.replace(/\/$/, '')}/lab/v1/sampling`

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = getAccessToken()
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

async function request(url: string, init?: RequestInit): Promise<Response> {
  await ensureValidToken()
  let res = await fetch(url, { ...init, headers: getHeaders() })
  if (res.status === 401) {
    const { refreshAccessToken } = await import('./auth')
    await refreshAccessToken()
    res = await fetch(url, { ...init, headers: getHeaders() })
  }
  return res
}

interface ValueListItem {
  dbName?: string
  fieldName?: string
  value?: unknown
}

function valueListToRecord(valueList: ValueListItem[] | undefined): Record<string, string> {
  const out: Record<string, string> = {}
  if (!Array.isArray(valueList)) return out
  valueList.forEach((item) => {
    const key = item.dbName ?? item.fieldName
    if (key != null) {
      const val = item.value
      out[key] = val !== undefined && val !== null ? String(val) : ''
    }
  })
  return out
}

/**
 * Ro‘yxatdan bitta sampling olish (search), keyin getById bilan valueList olish.
 * Muvaffaqiyatda PDF da ishlatish uchun Record<string, string> qaytaradi.
 */
export async function fetchSamplingDataAsRecord(): Promise<Record<string, string> | null> {
  try {
    const searchRes = await request(`${SAMPLING_BASE}/search`, {
      method: 'POST',
      body: JSON.stringify({ page: 1, size: 1 }),
    })
    if (!searchRes.ok) return null
    const searchJson = (await searchRes.json()) as {
      success?: boolean
      dataSource?: { responseList?: unknown[]; content?: unknown[] }
    }
    const list =
      (searchJson?.dataSource as { responseList?: unknown[] })?.responseList ??
      (searchJson?.dataSource as { content?: unknown[] })?.content ??
      []
    const first = Array.isArray(list) ? list[0] : undefined
    const firstRecord = first as { objId?: string; id?: string; valueList?: ValueListItem[] } | undefined
    const objId = firstRecord?.objId ?? firstRecord?.id
    if (firstRecord?.valueList) {
      return valueListToRecord(firstRecord.valueList)
    }
    if (objId) {
      const getRes = await request(`${SAMPLING_BASE}/${objId}`)
      if (!getRes.ok) return null
      const getJson = (await getRes.json()) as { success?: boolean; dataSource?: { valueList?: ValueListItem[] } }
      const ds = getJson?.dataSource
      if (ds?.valueList) return valueListToRecord(ds.valueList)
    }
    return null
  } catch {
    return null
  }
}
