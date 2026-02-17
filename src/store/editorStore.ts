import { create } from 'zustand'
import type { EditorElement, ElementType, TableData } from '../types/editor'
import { A4_WIDTH, A4_HEIGHT, GRID_SNAP } from '../types/editor'

function generateId(): string {
  return 'el-' + Math.random().toString(36).slice(2, 11)
}

function snap(v: number): number {
  return Math.round(v / GRID_SNAP) * GRID_SNAP
}

/** Ikki to'rtburchak ustma-ust (intersect) qiladimi – yonma-yon/yopishiq bo‘lishi mumkin, faqat ustiga chiqmasin */
function overlaps(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number }
): boolean {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h
}

const defaultTableData: TableData = {
  rows: 3,
  cols: 3,
  data: [
    ['', '', ''],
    ['', '', ''],
    ['', '', ''],
  ],
  border: true,
  cellPadding: 4,
}

const MAX_HISTORY = 50

interface EditorStore {
  elements: EditorElement[]
  selectedId: string | null
  pageWidth: number
  pageHeight: number
  isDraggingFromSidebar: boolean
  canvasScale: number
  history: EditorElement[][]
  historyIndex: number

  addElement: (type: ElementType, x?: number, y?: number, initialContent?: string) => void
  addFrame: () => void
  updateElement: (id: string, patch: Partial<EditorElement>) => void
  updateElementPosition: (id: string, x: number, y: number, w: number, h: number) => void
  deleteElement: (id: string) => void
  duplicateElement: (id: string) => void
  setSelected: (id: string | null) => void
  setContainer: (elementId: string | null) => void
  setDraggingFromSidebar: (v: boolean) => void
  setCanvasScale: (scale: number) => void
  getSelected: () => EditorElement | null
  setElements: (elements: EditorElement[]) => void
  loadLayoutFromServer: (elements: EditorElement[]) => void
  bringForward: (id: string) => void
  sendBackward: (id: string) => void
  undo: () => void
  redo: () => void
  pushHistory: () => void
}

const defaultElementSize: Record<ElementType, { w: number; h: number }> = {
  text: { w: 200, h: 32 },
  image: { w: 150, h: 100 },
  rect: { w: 120, h: 80 },
  line: { w: 200, h: 4 },
  table: { w: 280, h: 120 },
}

function cloneElements(el: EditorElement[]): EditorElement[] {
  return el.map((e) => ({ ...e, style: e.style ? { ...e.style } : undefined, table: e.table ? { ...e.table, data: e.table.data?.map((r) => [...r]) } : undefined }))
}

const emptyElements: EditorElement[] = []

export const useEditorStore = create<EditorStore>((set, get) => ({
  elements: emptyElements,
  selectedId: null,
  pageWidth: A4_WIDTH,
  pageHeight: A4_HEIGHT,
  isDraggingFromSidebar: false,
  canvasScale: 0.65,
  history: [emptyElements],
  historyIndex: 0,

  pushHistory() {
    const { elements, history, historyIndex } = get()
    const next = history.slice(0, historyIndex + 1)
    next.push(cloneElements(elements))
    if (next.length > MAX_HISTORY) next.shift()
    set({ history: next, historyIndex: next.length - 1 })
  },

  addElement(type, x?, y?, initialContent?) {
    get().pushHistory() // saqlaymiz: keyin undo bo‘lsa shu holatga qaytadi
    const { pageWidth, pageHeight, elements } = get()
    const { w, h } = defaultElementSize[type]
    const [nx, ny] =
      x !== undefined && y !== undefined
        ? (() => {
            let px = snap(Math.max(0, Math.min(x, pageWidth - w)))
            let py = snap(Math.max(0, Math.min(y, pageHeight - h)))
            const box = { x: px, y: py, w, h }
            if (!elements.some((e) => overlaps(box, e))) return [px, py]
            for (let d = GRID_SNAP; d <= 200; d += GRID_SNAP) {
              for (const [dx, dy] of [[d, 0], [0, d], [d, d], [-d, 0], [0, -d], [-d, -d], [d, -d], [-d, d]]) {
                const tx = snap(Math.max(0, Math.min(px + dx, pageWidth - w)))
                const ty = snap(Math.max(0, Math.min(py + dy, pageHeight - h)))
                const b = { x: tx, y: ty, w, h }
                if (!elements.some((e) => overlaps(b, e))) return [tx, ty]
              }
            }
            return [px, py]
          })()
        : (() => {
            const container = elements.find((e) => e.isContainer && e.type === 'rect')
            if (container) {
              const cx = container.x
              const cy = container.y
              const cw = container.w
              const ch = container.h
              const margin = GRID_SNAP
              for (let py = cy + margin; py + h <= cy + ch - margin; py += GRID_SNAP) {
                for (let px = cx + margin; px + w <= cx + cw - margin; px += GRID_SNAP) {
                  const box = { x: px, y: py, w, h }
                  if (!elements.some((e) => overlaps(box, e))) return [px, py]
                }
              }
            }
            for (let py = GRID_SNAP; py + h <= pageHeight; py += GRID_SNAP) {
              for (let px = GRID_SNAP; px + w <= pageWidth; px += GRID_SNAP) {
                const box = { x: px, y: py, w, h }
                if (!elements.some((e) => overlaps(box, e))) return [px, py]
              }
            }
            return [80, 80]
          })()
    const id = generateId()
    const base: EditorElement = {
      id,
      type,
      x: nx,
      y: ny,
      w,
      h,
      rotate: 0,
      style: {
        fontSize: 14,
        fontWeight: 'normal',
        color: '#000000',
        backgroundColor: type === 'rect' ? '#f0f0f0' : undefined,
        border: type === 'rect' ? '1px solid #999' : undefined,
        borderTop: '1px solid #ccc',
        borderRight: '1px solid #ccc',
        textAlign: 'left',
      },
    }
    const textContent = type === 'text' && initialContent != null ? initialContent : undefined
    const el: EditorElement =
      type === 'text'
        ? { ...base, content: textContent ?? 'Matn' }
        : type === 'image'
          ? { ...base, src: '' }
          : type === 'table'
            ? { ...base, table: { ...defaultTableData } }
            : base
    set((s) => ({ elements: [...s.elements, el], selectedId: id }))
  },

  addFrame() {
    get().pushHistory()
    const { pageWidth, pageHeight, elements } = get()
    const w = 400
    const h = 300
    let nx = 80
    let ny = 80
    for (let py = GRID_SNAP; py + h <= pageHeight; py += GRID_SNAP) {
      for (let px = GRID_SNAP; px + w <= pageWidth; px += GRID_SNAP) {
        const box = { x: px, y: py, w, h }
        if (!elements.some((e) => overlaps(box, e))) {
          nx = px
          ny = py
          break
        }
      }
    }
    const id = generateId()
    const frame: EditorElement = {
      id,
      type: 'rect',
      x: nx,
      y: ny,
      w,
      h,
      rotate: 0,
      isContainer: true,
      style: {
        backgroundColor: 'transparent',
        border: '2px dashed #64748b',
        borderTop: '2px dashed #64748b',
        borderRight: '2px dashed #64748b',
        textAlign: 'left',
      },
    }
    set((s) => ({ elements: [...s.elements, frame], selectedId: id }))
  },

  updateElement(id, patch) {
    get().pushHistory()
    set((s) => ({
      elements: s.elements.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }))
  },

  updateElementPosition(id, x, y, w, h) {
    const { pageWidth, pageHeight, elements } = get()
    let nx = snap(Math.max(0, Math.min(x, pageWidth - 20)))
    let ny = snap(Math.max(0, Math.min(y, pageHeight - 12)))
    let nw = Math.max(20, Math.min(w, pageWidth - nx))
    let nh = Math.max(12, Math.min(h, pageHeight - ny))
    const container = elements.find((e) => e.isContainer && e.type === 'rect')
    if (container && container.id !== id) {
      const cx = container.x
      const cy = container.y
      const cw = container.w
      const ch = container.h
      nx = snap(Math.max(cx, Math.min(nx, cx + cw - nw)))
      ny = snap(Math.max(cy, Math.min(ny, cy + ch - nh)))
      nw = Math.min(nw, cx + cw - nx)
      nh = Math.min(nh, cy + ch - ny)
    } else {
      nw = Math.min(nw, pageWidth - nx)
      nh = Math.min(nh, pageHeight - ny)
    }
    set((s) => ({
      elements: s.elements.map((e) =>
        e.id === id ? { ...e, x: nx, y: ny, w: nw, h: nh } : e
      ),
    }))
  },

  deleteElement(id) {
    get().pushHistory()
    set((s) => ({
      elements: s.elements.filter((e) => e.id !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
    }))
  },

  duplicateElement(id) {
    const { elements } = get()
    const src = elements.find((e) => e.id === id)
    if (!src) return
    get().pushHistory()
    const copy: EditorElement = {
      ...cloneElements([src])[0],
      id: generateId(),
      x: src.x + 20,
      y: src.y + 20,
    }
    set((s) => ({ elements: [...s.elements, copy], selectedId: copy.id }))
  },

  setSelected(id) {
    set({ selectedId: id })
  },

  setContainer(elementId) {
    set((s) => ({
      elements: s.elements.map((e) => ({ ...e, isContainer: e.id === elementId })),
    }))
  },

  setDraggingFromSidebar(v) {
    set({ isDraggingFromSidebar: v })
  },

  setCanvasScale(scale: number) {
    set({ canvasScale: Math.max(0.35, Math.min(1, scale)) })
  },

  getSelected() {
    const { elements, selectedId } = get()
    return selectedId ? elements.find((e) => e.id === selectedId) ?? null : null
  },

  setElements(elements: EditorElement[]) {
    set({ elements: [...elements], selectedId: null })
  },

  loadLayoutFromServer(elements: EditorElement[]) {
    const next = cloneElements(elements)
    set({ elements: next, selectedId: null, history: [next], historyIndex: 0 })
  },

  bringForward(id) {
    const { elements } = get()
    const i = elements.findIndex((e) => e.id === id)
    if (i < 0 || i >= elements.length - 1) return
    const next = [...elements]
    ;[next[i], next[i + 1]] = [next[i + 1], next[i]]
    set({ elements: next })
  },

  sendBackward(id) {
    const { elements } = get()
    const i = elements.findIndex((e) => e.id === id)
    if (i <= 0) return
    const next = [...elements]
    ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
    set({ elements: next })
  },

  undo() {
    const { history, historyIndex } = get()
    if (historyIndex <= 0) return
    const newIndex = historyIndex - 1
    set({ elements: cloneElements(history[newIndex]), historyIndex: newIndex, selectedId: null })
  },

  redo() {
    const { history, historyIndex } = get()
    if (historyIndex >= history.length - 1) return
    const newIndex = historyIndex + 1
    set({ elements: cloneElements(history[newIndex]), historyIndex: newIndex, selectedId: null })
  },
}))
