import { getAccessToken, ensureValidToken, refreshAccessToken } from './auth'
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
        label: showName,
      }
    })
    .filter((x): x is SamplingDefineItem => x != null)
    .sort((a, b) => a.dataKey.localeCompare(b.dataKey))
}

export async function fetchSamplingDefineKeys(): Promise<SamplingDefineItem[] | null> {
  try {
    const searchRes = await request(`${SAMPLING_DEFINE_BASE}/search`, {
      method: 'POST',
      body: JSON.stringify({ page: 1}),
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
