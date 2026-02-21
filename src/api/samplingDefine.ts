/**
 * Sampling define API – sidebar uchun dbName va showName olish.
 * GET /kefa/lab/v1/sampling-define/fetch-fields yoki POST .../search.
 * kefa-dev da ishlashi o'zgarmasligi uchun dataKey = dbName saqlanadi.
 */
import { getAccessToken, ensureValidToken } from './auth'

const BASE = import.meta.env.VITE_BACKEND_URL ?? import.meta.env.VITE_AUTH_URL ?? 'comhttps://kefa-dev.'
const baseClean = BASE.replace(/\/$/, '')
const SAMPLING_DEFINE_BASE = `https://kefa-dev.com/kefa/lab/v1/sampling-define`

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

export interface SamplingDefineItem {
  dataKey: string
  title: string
  label: string
}

/** responseList elementida dbName / showName bo‘lishi mumkin */
function parseResponseList(list: unknown[]): SamplingDefineItem[] {
  return list
    .map((item) => {
      const row = item as Record<string, unknown>
      const dbName = row?.dbName ?? row?.fieldName
      if (dbName == null || typeof dbName !== 'string') return null
      const showName = row?.showName ?? row?.label
      return {
        dataKey: dbName,
        title: '데이터',
        label: typeof showName === 'string' && showName ? showName : dbName,
      }
    })
    .filter((x): x is SamplingDefineItem => x != null)
    .sort((a, b) => a.dataKey.localeCompare(b.dataKey))
}

/**
 * Sidebar uchun sampling-define ro‘yxatini olish.
 * Avval POST .../search, keyin GET .../fetch-fields fallback.
 * Xato yoki bo‘sh qaytsa null (caller static ishlatadi).
 */
export async function fetchSamplingDefineKeys(): Promise<SamplingDefineItem[] | null> {
  try {
    // 1) POST .../search – kefa-dev config service bilan bir xil
    const searchRes = await request(`${SAMPLING_DEFINE_BASE}/search`, {
      method: 'POST',
      body: JSON.stringify({ page: 1, size: 20 }),
    })
    if (searchRes.ok) {
      const json = (await searchRes.json()) as {
        success?: boolean
        dataSource?: { responseList?: unknown[] }
      }
      const list = json?.dataSource?.responseList
      if (Array.isArray(list) && list.length > 0) {
        const items = parseResponseList(list)
        if (items.length > 0) return items
      }
    }

    // 2) GET .../fetch-fields – to‘g‘ridan-to‘g‘ri massiv (SelectSamplingDefine kabi)
    const fetchRes = await request(`${SAMPLING_DEFINE_BASE}/fetch-fields`)
    if (fetchRes.ok) {
      const json = (await fetchRes.json()) as { success?: boolean; dataSource?: unknown[] }
      const list = json?.dataSource
      if (Array.isArray(list) && list.length > 0) {
        const items = parseResponseList(list)
        if (items.length > 0) return items
      }
    }

    return null
  } catch {
    return null
  }
}
