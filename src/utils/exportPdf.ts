import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { A4_WIDTH, A4_HEIGHT, PX_PER_MM } from '../types/editor'
import { useEditorStore } from '../store/editorStore'

const A4_MM = { w: 210, h: 297 }

function getString(data: Record<string, unknown>, key: string): string {
  const v = data[key]
  return v !== undefined && v !== null ? String(v) : ''
}

type PageEl = { id: string; type: string; x: number; y: number; gaseousKey?: string; gaseousKeyBottom?: string; gaseousRowHeight?: number; gaseousRowCount?: number; gaseousBlock2AtRow?: number; gaseousBlock2Only?: boolean; table?: { bodyDataKey?: string; columnKeys?: string[]; firstRow?: string[]; cols: number } }

function expandGaseousRowsInClone(pageClone: HTMLElement, pageElements: PageEl[], data: Record<string, unknown>): void {
  const list = (data.gaseousList as unknown[] | undefined) ?? []
  const arr = Array.isArray(list) ? list : []
  let baseYmm: number | null = null
  let rowsPerColumn = 6
  for (const el of pageElements) {
    if (el.gaseousBlock2Only) continue
    if (el.gaseousKey || (el.gaseousRowCount != null && el.gaseousRowCount > 0)) {
      baseYmm = el.y
      if (el.gaseousBlock2AtRow != null && el.gaseousBlock2AtRow > 0) rowsPerColumn = el.gaseousBlock2AtRow
      break
    }
  }
  for (const el of pageElements) {
    const hasKey = !!el.gaseousKey
    const hasRowCount = el.gaseousRowCount != null && el.gaseousRowCount > 0
    if (!hasKey && !hasRowCount) continue
    const rowHeightMm = el.gaseousRowHeight ?? 6
    const rowHeightPx = rowHeightMm * PX_PER_MM
    const gasKeys = (el.gaseousKey ?? '').trim().split(',').map((k) => k.trim()).filter(Boolean)
    const bottomKey = (el.gaseousKeyBottom ?? '').trim() || undefined

    const getGaseousText = (item: Record<string, unknown> | undefined): string => {
      if (!hasKey || !item) return ''
      if (bottomKey) {
        const topKey = gasKeys[0]
        if (!topKey) return getString(item, bottomKey)
        return getString(item, topKey) + '\n' + getString(item, bottomKey)
      }
      if (gasKeys.length === 0) return ''
      if (gasKeys.length === 1) return getString(item, gasKeys[0])
      return gasKeys.map((k) => getString(item, k)).join('\n')
    }

    if (el.gaseousBlock2Only && baseYmm != null) {
      const startIdx = rowsPerColumn
      const count = Math.max(0, Math.min(rowsPerColumn, arr.length - startIdx))
      if (count <= 0) continue
      const wrapperWithId = pageClone.querySelector(`[data-element-id="${el.id}"]`) as HTMLElement | null
      if (!wrapperWithId) continue
      const wrapper = wrapperWithId.parentElement
      if (!wrapper) continue
      const node = wrapperWithId.querySelector('[data-gaseous-key]') as HTMLElement | null
      const baseYpx = baseYmm * PX_PER_MM
      wrapper.style.top = `${baseYpx}px`
      if (hasKey && node) {
        node.textContent = getGaseousText(arr[startIdx] as Record<string, unknown> | undefined)
      }
      for (let idx = 1; idx < count; idx++) {
        const i = startIdx + idx
        const cloneWrapper = wrapper.cloneNode(true) as HTMLElement
        cloneWrapper.style.top = `${baseYpx + idx * rowHeightPx}px`
        const cloneInner = cloneWrapper.querySelector(`[data-element-id="${el.id}"]`) as HTMLElement | null
        if (cloneInner) {
          const cloneNode = cloneInner.querySelector('[data-gaseous-key]') as HTMLElement | null
          if (cloneNode) {
            cloneNode.textContent = getGaseousText(arr[i] as Record<string, unknown> | undefined)
            cloneNode.style.borderTop = 'none'
          } else {
            cloneInner.textContent = ''
            cloneInner.style.borderTop = 'none'
          }
        }
        wrapper.parentElement?.appendChild(cloneWrapper)
      }
      continue
    }

    const maxRows = hasRowCount ? el.gaseousRowCount! : (el.gaseousRowCount ?? 0)
    const rowCount =
      arr.length > 0
        ? (maxRows > 0 ? Math.min(arr.length, maxRows) : arr.length)
        : 0
    const cappedCount = Math.min(rowCount, rowsPerColumn)
    if (cappedCount <= 0) continue
    const wrapperWithId = pageClone.querySelector(`[data-element-id="${el.id}"]`) as HTMLElement | null
    if (!wrapperWithId) continue
    const wrapper = wrapperWithId.parentElement
    if (!wrapper) continue
    const node = wrapperWithId.querySelector('[data-gaseous-key]') as HTMLElement | null
    const baseYpx = (baseYmm != null ? baseYmm : el.y) * PX_PER_MM
    if (hasKey && node) {
      node.textContent = getGaseousText(arr[0] as Record<string, unknown> | undefined)
    }
    for (let i = 1; i < cappedCount; i++) {
      const cloneWrapper = wrapper.cloneNode(true) as HTMLElement
      cloneWrapper.style.top = `${baseYpx + i * rowHeightPx}px`
      const cloneInner = cloneWrapper.querySelector(`[data-element-id="${el.id}"]`) as HTMLElement | null
      if (cloneInner) {
        const cloneNode = cloneInner.querySelector('[data-gaseous-key]') as HTMLElement | null
        if (cloneNode) {
          cloneNode.textContent = getGaseousText(arr[i] as Record<string, unknown> | undefined)
          cloneNode.style.borderTop = 'none'
        } else {
          cloneInner.textContent = ''
          cloneInner.style.borderTop = 'none'
        }
      }
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
          const elNode = node as HTMLElement
          if (elNode.hasAttribute('data-gaseous-key')) return
          const key = elNode.getAttribute('data-data-key')
          if (key) elNode.textContent = getString(data, key)
        })
        clone.querySelectorAll('[data-template-content]').forEach((node) => {
          const elNode = node as HTMLElement
          const displayContent = elNode.getAttribute('data-display-content') ?? ''
          if (displayContent.trim() !== '') {
            elNode.textContent = displayContent
          } else {
            const template = elNode.getAttribute('data-template-content') ?? ''
            elNode.textContent = template.replace(/\$\{(\w+)\}/g, (_, key) => getString(data, key))
          }
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
