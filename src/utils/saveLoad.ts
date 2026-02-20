import type { EditorElement } from '../types/editor'
import { useEditorStore } from '../store/editorStore'
import { fetchLayout, saveLayout } from '../api/server'

export interface SavedLayout {
  version?: number
  elements: EditorElement[]
  pageWidth: number
  pageHeight: number
}

export async function loadFromServer(): Promise<boolean> {
  try {
    const data = await fetchLayout()
    const elements = (data.elements ?? []) as EditorElement[]
    useEditorStore.getState().loadLayoutFromServer(elements, data.pageWidth, data.pageHeight)
    return true
  } catch {
    return false
  }
}

export async function saveToServer(): Promise<{ ok: boolean; error?: string }> {
  try {
    const state = useEditorStore.getState()
    await saveLayout({
      elements: state.elements,
      pageWidth: state.pageWidth,
      pageHeight: state.pageHeight,
    })
    return { ok: true }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Saqlash xatosi'
    return { ok: false, error: message }
  }
}

export function exportLayoutJson(): string {
  const state = useEditorStore.getState()
  const data: SavedLayout = {
    version: 1,
    elements: state.elements,
    pageWidth: state.pageWidth,
    pageHeight: state.pageHeight,
  }
  return JSON.stringify(data, null, 2)
}

export function importLayoutJson(json: string): boolean {
  try {
    const data = JSON.parse(json) as SavedLayout
    const elements = (data.elements ?? []) as EditorElement[]
    const store = useEditorStore.getState()
    store.loadLayoutFromServer(elements, data.pageWidth, data.pageHeight)
    return true
  } catch {
    return false
  }
}
