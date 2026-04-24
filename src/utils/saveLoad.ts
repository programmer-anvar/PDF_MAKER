import type { EditorElement } from '../types/editor'
import type { EditorPage } from '../store/editorStore'
import { useEditorStore } from '../store/editorStore'
import { fetchLayout, saveLayout } from '../api/server'
import type { TemplateType } from '../api/server'

export interface SavedLayout {
  version?: number
  elements: EditorElement[]
  pageWidth: number
  pageHeight: number
}

export interface SavedLayoutMulti {
  version?: number
  layout: Array<{ id: string; elements: EditorElement[]; pageWidth: number; pageHeight: number }>
}

function applyLayoutToStore(data: Awaited<ReturnType<typeof fetchLayout>>) {
  const store = useEditorStore.getState()
  if (data && 'layout' in data && Array.isArray(data.layout) && data.layout.length > 0) {
    const seenIds = new Set<string>()
    const pages: EditorPage[] = data.layout.map((p, i) => {
      let id = String(p.id ?? i + 1)
      while (seenIds.has(id)) {
        id = `${id}-${i}`
      }
      seenIds.add(id)
      return {
        id,
        elements: (p.elements ?? []) as EditorElement[],
        pageWidth: Number(p.pageWidth) || 210,
        pageHeight: Number(p.pageHeight) || 297,
      }
    })
    store.loadLayoutPages(pages)
  } else {
    const record = data as { elements?: EditorElement[]; pageWidth?: number; pageHeight?: number }
    const elements = (record.elements ?? []) as EditorElement[]
    store.loadLayoutFromServer(elements, record.pageWidth, record.pageHeight)
  }
}

export async function loadFromServer(type?: TemplateType): Promise<boolean> {
  try {
    const activeType = type ?? useEditorStore.getState().templateType
    const data = await fetchLayout(activeType)
    applyLayoutToStore(data)
    return true
  } catch {
    return false
  }
}

export async function saveToServer(): Promise<{ ok: boolean; error?: string }> {
  try {
    const state = useEditorStore.getState()
    const layout = state.pages.map((p) => ({
      id: p.id,
      elements: p.elements,
      pageWidth: p.pageWidth,
      pageHeight: p.pageHeight,
    }))
    await saveLayout({ layout }, state.templateType)
    return { ok: true }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Saqlash xatosi'
    return { ok: false, error: message }
  }
}

export function exportLayoutJson(): string {
  const state = useEditorStore.getState()
  const data: SavedLayoutMulti = {
    version: 1,
    layout: state.pages.map((p) => ({ id: p.id, elements: p.elements, pageWidth: p.pageWidth, pageHeight: p.pageHeight })),
  }
  return JSON.stringify(data, null, 2)
}

export function importLayoutJson(json: string): boolean {
  try {
    const parsed = JSON.parse(json)
    const store = useEditorStore.getState()
    if (Array.isArray(parsed?.layout)) {
      const pages: EditorPage[] = parsed.layout.map((p: { id?: string; elements?: EditorElement[]; pageWidth?: number; pageHeight?: number }, i: number) => ({
        id: p.id ?? String(i + 1),
        elements: (p.elements ?? []) as EditorElement[],
        pageWidth: Number(p.pageWidth) || 210,
        pageHeight: Number(p.pageHeight) || 297,
      }))
      store.loadLayoutPages(pages)
    } else {
      const data = parsed as SavedLayout
      const elements = (data.elements ?? []) as EditorElement[]
      store.loadLayoutFromServer(elements, data.pageWidth, data.pageHeight)
    }
    return true
  } catch {
    return false
  }
}
