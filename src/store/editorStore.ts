import { create } from 'zustand'
import type { EditorElement, ElementType, TableData } from '../types/editor'
import { A4_WIDTH_MM, A4_HEIGHT_MM, GRID_SNAP_MM, PX_PER_MM } from '../types/editor'

function generateId(): string {
  return 'el-' + Math.random().toString(36).slice(2, 11)
}

function snap(v: number): number {
  return Math.round(v / GRID_SNAP_MM) * GRID_SNAP_MM
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

  addElement: (type: ElementType, x?: number, y?: number, initialContent?: string, size?: { w?: number; h?: number }) => void
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
  loadLayoutFromServer: (elements: EditorElement[], pageWidth?: number, pageHeight?: number) => void
  bringForward: (id: string) => void
  sendBackward: (id: string) => void
  undo: () => void
  redo: () => void
  pushHistory: () => void
}

/** Element default o'lchamlari, mm */
const defaultElementSize: Record<ElementType, { w: number; h: number }> = {
  text: { w: 53, h: 8 },
  image: { w: 40, h: 26 },
  rect: { w: 32, h: 21 },
  line: { w: 53, h: 1 },
  table: { w: 74, h: 32 },
}

function cloneElements(el: EditorElement[]): EditorElement[] {
  return el.map((e) => ({ ...e, style: e.style ? { ...e.style } : undefined, table: e.table ? { ...e.table, data: e.table.data?.map((r) => [...r]) } : undefined }))
}

const emptyElements: EditorElement[] = []

export const useEditorStore = create<EditorStore>((set, get) => ({
  elements: emptyElements,
  selectedId: null,
  pageWidth: A4_WIDTH_MM,
  pageHeight: A4_HEIGHT_MM,
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

  addElement(type, x?, y?, initialContent?, size?) {
    get().pushHistory() // saqlaymiz: keyin undo bo‘lsa shu holatga qaytadi
    const { pageWidth, pageHeight, elements } = get()
    let { w, h } = defaultElementSize[type]
    if (size?.w != null) w = Math.max(2, size.w)
    if (size?.h != null) h = Math.max(2, size.h)
    if (type === 'text' && initialContent != null && size?.w == null) {
      const minW = Math.min(185, Math.max(53, initialContent.length * 3.7))
      w = Math.max(w, minW)
      if (size?.h == null) h = Math.max(h, 8)
    }
    const [nx, ny] =
      x !== undefined && y !== undefined
        ? (() => {
            let px = snap(Math.max(0, Math.min(x, pageWidth - w)))
            let py = snap(Math.max(0, Math.min(y, pageHeight - h)))
            const box = { x: px, y: py, w, h }
            if (!elements.some((e) => overlaps(box, e))) return [px, py]
            for (let d = GRID_SNAP_MM; d <= 50; d += GRID_SNAP_MM) {
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
              const margin = GRID_SNAP_MM
              for (let py = cy + margin; py + h <= cy + ch - margin; py += GRID_SNAP_MM) {
                for (let px = cx + margin; px + w <= cx + cw - margin; px += GRID_SNAP_MM) {
                  const box = { x: px, y: py, w, h }
                  if (!elements.some((e) => overlaps(box, e))) return [px, py]
                }
              }
            }
            for (let py = GRID_SNAP_MM; py + h <= pageHeight; py += GRID_SNAP_MM) {
              for (let px = GRID_SNAP_MM; px + w <= pageWidth; px += GRID_SNAP_MM) {
                const box = { x: px, y: py, w, h }
                if (!elements.some((e) => overlaps(box, e))) return [px, py]
              }
            }
            return [21, 21]
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
    const w = 106
    const h = 79
    let nx = 21
    let ny = 21
    for (let py = GRID_SNAP_MM; py + h <= pageHeight; py += GRID_SNAP_MM) {
      for (let px = GRID_SNAP_MM; px + w <= pageWidth; px += GRID_SNAP_MM) {
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
      elements: s.elements.map((e) => {
        if (e.id !== id) return e
        let p = { ...patch }
        if (p.w != null && p.w < 2) p.w = 2
        if (p.h != null && p.h < 2) p.h = 2
        return { ...e, ...p }
      }),
    }))
  },

  updateElementPosition(id, x, y, w, h) {
    const { pageWidth, pageHeight, elements } = get()
    const el = elements.find((e) => e.id === id)
    const minW = 2
    const minH = 2
    let nx = snap(Math.max(0, Math.min(x, pageWidth - minW)))
    let ny = snap(Math.max(0, Math.min(y, pageHeight - minH)))
    let nw = Math.max(minW, Math.min(w, pageWidth - nx))
    let nh = Math.max(minH, Math.min(h, pageHeight - ny))
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

  loadLayoutFromServer(elements: EditorElement[], pageWidth?: number, pageHeight?: number) {
    const isOldPx = pageWidth === 794 && pageHeight === 1123
    const next = cloneElements(
      isOldPx
        ? elements.map((e) => ({
            ...e,
            x: e.x / PX_PER_MM,
            y: e.y / PX_PER_MM,
            w: e.w / PX_PER_MM,
            h: e.h / PX_PER_MM,
          }))
        : elements
    )
    set({
      elements: next,
      selectedId: null,
      history: [next],
      historyIndex: 0,
      pageWidth: pageWidth != null ? (isOldPx ? A4_WIDTH_MM : pageWidth) : get().pageWidth,
      pageHeight: pageHeight != null ? (isOldPx ? A4_HEIGHT_MM : pageHeight) : get().pageHeight,
    })
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
