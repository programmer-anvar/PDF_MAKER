const API_BASE = '/api'
const LAYOUT_ID = 1

export interface LayoutRecord {
  id: number
  elements: unknown[]
  pageWidth: number
  pageHeight: number
}

export async function fetchLayout(): Promise<LayoutRecord> {
  const res = await fetch(`${API_BASE}/layout/${LAYOUT_ID}`)
  if (!res.ok) {
    if (res.status === 404) return getEmptyLayout()
    throw new Error(`Server: ${res.status}`)
  }
  return res.json()
}

export async function saveLayout(data: Omit<LayoutRecord, 'id'>): Promise<LayoutRecord> {
  const res = await fetch(`${API_BASE}/layout/${LAYOUT_ID}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: LAYOUT_ID, ...data }),
  })
  if (!res.ok) throw new Error(`Saqlash: ${res.status}`)
  return res.json()
}

function getEmptyLayout(): LayoutRecord {
  return {
    id: LAYOUT_ID,
    elements: [],
    pageWidth: 210,
    pageHeight: 297,
  }
}
