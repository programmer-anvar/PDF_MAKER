import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { A4_WIDTH, A4_HEIGHT } from '../types/editor'
import { useEditorStore } from '../store/editorStore'

const A4_MM = { w: 210, h: 297 }

/**
 * A4 page element'ni html2canvas bilan rasmga aylantiradi va jsPDF orqali PDF yuklab oladi (WYSIWYG).
 * data berilsa (sampling): layout bir xil, lekin data-data-key li elementlarda key o'rniga data[key] value ko'rsatiladi.
 */
export async function exportPageToPdf(
  selector = '#a4-page',
  filename = 'document.pdf',
  data?: Record<string, string>
): Promise<void> {
  let el = document.querySelector(selector) as HTMLElement
  if (!el) {
    console.error('A4 page element topilmadi:', selector)
    return
  }

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
  }

  const wrapper = el.parentElement as HTMLElement | null
  const savedScale = useEditorStore.getState().canvasScale
  const savedTransform = wrapper?.style.transform ?? ''

  if (wrapper) {
    wrapper.style.transform = 'scale(1)'
    await new Promise((r) => requestAnimationFrame(r))
  }

  try {
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
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
    pdf.addImage(imgData, 'PNG', 0, 0, A4_MM.w, A4_MM.h)
    pdf.save(filename)
  } finally {
    if (wrapper) {
      wrapper.style.transform = savedTransform || `scale(${savedScale})`
    }
    if (clone?.parentElement) {
      clone.parentElement.removeChild(clone)
    }
  }
}
