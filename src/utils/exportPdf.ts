import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

const A4_MM = { w: 210, h: 297 }

/**
 * A4 page element'ni html2canvas bilan rasmga aylantiradi va jsPDF orqali PDF yuklab oladi (WYSIWYG).
 */
export async function exportPageToPdf(selector = '#a4-page', filename = 'document.pdf'): Promise<void> {
  const el = document.querySelector(selector) as HTMLElement
  if (!el) {
    console.error('A4 page element topilmadi:', selector)
    return
  }

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
  })

  const imgData = canvas.toDataURL('image/jpeg', 0.95)
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
  pdf.addImage(imgData, 'JPEG', 0, 0, A4_MM.w, A4_MM.h)
  pdf.save(filename)
}
