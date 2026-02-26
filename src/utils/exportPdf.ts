import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { A4_WIDTH, A4_HEIGHT, PX_PER_MM } from '../types/editor'
import { useEditorStore } from '../store/editorStore'

const A4_MM = { w: 210, h: 297 }

function getString(data: Record<string, unknown>, key: string): string {
  const v = data[key]
  return v !== undefined && v !== null ? String(v) : ''
}

type PageEl = { id: string; type: string; x: number; y: number; gaseousKey?: string; gaseousRowHeight?: number; table?: { bodyDataKey?: string; columnKeys?: string[]; firstRow?: string[]; cols: number } }

function expandGaseousRowsInClone(pageClone: HTMLElement, pageElements: PageEl[], data: Record<string, unknown>): void {
  const list = data.gaseousList
  if (!Array.isArray(list) || list.length === 0) return
  for (const el of pageElements) {
    if (!el.gaseousKey) continue
    const rowHeightMm = el.gaseousRowHeight ?? 6
    const node = pageClone.querySelector(`[data-element-id="${el.id}"] [data-gaseous-key]`) as HTMLElement | null
    if (!node) continue
    const wrapperWithId = node.closest('[data-element-id]')
    const wrapper = wrapperWithId?.parentElement
    if (!wrapper) continue
    const baseYpx = el.y * PX_PER_MM
    const rowHeightPx = rowHeightMm * PX_PER_MM
    node.textContent = getString(list[0] as Record<string, unknown>, el.gaseousKey)
    for (let i = 1; i < list.length; i++) {
      const cloneWrapper = wrapper.cloneNode(true) as HTMLElement
      cloneWrapper.style.top = `${baseYpx + i * rowHeightPx}px`
      const cloneNode = cloneWrapper.querySelector('[data-gaseous-key]') as HTMLElement | null
      if (cloneNode) cloneNode.textContent = getString(list[i] as Record<string, unknown>, el.gaseousKey)
      wrapper.parentElement?.appendChild(cloneWrapper)
    }
  }
}

function fillTableBodiesInClone(pageClone: HTMLElement, pageElements: PageEl[], data: Record<string, unknown>): void {
  for (const el of pageElements) {
    if (el.type !== 'table' || !el.table?.bodyDataKey || !el.table.columnKeys?.length) continue
    const list = data[el.table.bodyDataKey]
    if (!Array.isArray(list)) continue
    const wrapper = pageClone.querySelector(`[data-element-id="${el.id}"]`)
    const tbody = wrapper?.querySelector('tbody')
    if (!tbody) continue
    const cols = el.table.cols ?? el.table.columnKeys.length
    const keys = el.table.columnKeys.slice(0, cols)
    const borderStyle = '1px solid #333'
    tbody.innerHTML = ''
    if (el.table.firstRow?.length) {
      const tr = document.createElement('tr')
      el.table.firstRow.slice(0, cols).forEach((cell) => {
        const td = document.createElement('td')
        td.style.border = borderStyle
        td.textContent = cell
        tr.appendChild(td)
      })
      tbody.appendChild(tr)
    }
    for (let ri = 0; ri < list.length; ri++) {
      const item = list[ri] as Record<string, unknown>
      const tr = document.createElement('tr')
      for (let c = 0; c < keys.length; c++) {
        const td = document.createElement('td')
        td.style.border = borderStyle
        td.textContent = keys[c] ? getString(item, keys[c]) : ''
        tr.appendChild(td)
      }
      tbody.appendChild(tr)
    }
  }
}

/**
 * A4 page element'ni html2canvas bilan rasmga aylantiradi va jsPDF orqali PDF yuklab oladi (WYSIWYG).
 * selector string[] bo'lsa barcha sahifalar bitta PDF ga qo'shiladi.
 * data berilsa (sampling): layout bir xil, lekin data-data-key li elementlarda key o'rniga data[key] value ko'rsatiladi.
 */
export async function exportPageToPdf(
  selector: string | string[] = '#a4-page',
  filename = 'document.pdf',
  data?: Record<string, unknown>
): Promise<void> {
  const selectors = Array.isArray(selector) ? selector : [selector]
  const elements: HTMLElement[] = []
  for (const sel of selectors) {
    const el = document.querySelector(sel) as HTMLElement
    if (el) elements.push(el)
  }
  if (elements.length === 0) {
    console.error('A4 page element topilmadi:', selector)
    return
  }

  const wrapper = elements[0].parentElement as HTMLElement | null
  const savedScale = useEditorStore.getState().canvasScale
  const savedTransform = wrapper?.style.transform ?? ''
  const pages = useEditorStore.getState().pages

  if (wrapper) {
    wrapper.style.transform = 'scale(1)'
    await new Promise((r) => requestAnimationFrame(r))
  }

  const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
  const clones: HTMLElement[] = []

  try {
    for (let i = 0; i < elements.length; i++) {
      let el = elements[i]
      let clone: HTMLElement | null = null
      if (data && Object.keys(data).length > 0) {
        clone = el.cloneNode(true) as HTMLElement
        clone.querySelectorAll('[data-data-key]').forEach((node) => {
          const key = (node as HTMLElement).getAttribute('data-data-key')
          if (key) (node as HTMLElement).textContent = getString(data, key)
        })
        if (pages[i]?.elements) {
          expandGaseousRowsInClone(clone, pages[i].elements, data)
          fillTableBodiesInClone(clone, pages[i].elements, data)
        }
        clone.style.position = 'absolute'
        clone.style.left = '-9999px'
        clone.style.top = '0'
        el.parentElement?.appendChild(clone)
        el = clone
        clones.push(clone)
      }

      const canvas = await html2canvas(el, {
        width: A4_WIDTH,
        height: A4_HEIGHT,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      })

      const imgData = canvas.toDataURL('image/png', 1)
      if (i > 0) pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, 0, A4_MM.w, A4_MM.h)
    }
    pdf.save(filename)
  } finally {
    if (wrapper) {
      wrapper.style.transform = savedTransform || `scale(${savedScale})`
    }
    clones.forEach((c) => c.parentElement?.removeChild(c))
  }
}
