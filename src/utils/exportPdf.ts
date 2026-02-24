import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { A4_WIDTH, A4_HEIGHT } from '../types/editor'
import { useEditorStore } from '../store/editorStore'

const A4_MM = { w: 210, h: 297 }

/**
 * A4 page element'ni html2canvas bilan rasmga aylantiradi va jsPDF orqali PDF yuklab oladi (WYSIWYG).
 * selector string[] bo'lsa barcha sahifalar bitta PDF ga qo'shiladi.
 * data berilsa (sampling): layout bir xil, lekin data-data-key li elementlarda key o'rniga data[key] value ko'rsatiladi.
 */
export async function exportPageToPdf(
  selector: string | string[] = '#a4-page',
  filename = 'document.pdf',
  data?: Record<string, string>
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
          if (key && data[key] !== undefined) {
            ;(node as HTMLElement).textContent = data[key]
          }
        })
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
