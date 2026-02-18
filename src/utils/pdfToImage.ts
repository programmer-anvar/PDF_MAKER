/**
 * PDF birinchi sahifasini rasmga (data URL) aylantiradi.
 * PDF.js orqali render qilinadi – matn (harflar) to'g'ri chiqadi.
 */
import * as pdfjsLib from 'pdfjs-dist'
// Vite: worker faylini URL sifatida import qilish kerak
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url'

const TARGET_WIDTH = 794

let workerInitialized = false
function ensureWorker() {
  if (workerInitialized) return
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl
  workerInitialized = true
}

export interface PdfPageImage {
  dataUrl: string
  width: number
  height: number
}

export async function pdfFirstPageToDataUrl(pdfBlob: Blob): Promise<PdfPageImage> {
  ensureWorker()
  const data = await pdfBlob.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({
    data,
    useSystemFonts: true,
    cMapUrl: 'https://unpkg.com/pdfjs-dist@5.4.624/cmaps/',
    cMapPacked: true,
  }).promise
  const numPages = pdf.numPages
  if (numPages < 1) throw new Error('PDF da sahifa yo‘q')
  const page = await pdf.getPage(1)
  const view = page.getViewport({ scale: 1 })
  const scale = TARGET_WIDTH / view.width
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas context yo‘q')
  await page.render({
    canvasContext: ctx,
    canvas,
    viewport,
    intent: 'display',
  }).promise
  return {
    dataUrl: canvas.toDataURL('image/png'),
    width: viewport.width,
    height: viewport.height,
  }
}

export async function pdfBase64ToDataUrl(base64: string): Promise<PdfPageImage> {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  const blob = new Blob([bytes], { type: 'application/pdf' })
  return pdfFirstPageToDataUrl(blob)
}

/** PDF sahifasidan tahrirlanadigan matn bloklari (pozitsiya + matn) */
export interface PdfTextBlock {
  str: string
  x: number
  y: number
  w: number
  h: number
}

export interface PdfEditablePage {
  image: PdfPageImage
  textBlocks: PdfTextBlock[]
  pageWidth: number
  pageHeight: number
}

/** PDF birinchi sahifasini rasm + matn bloklari sifatida qaytaradi – har bir matnni edit/delete qilish mumkin */
export async function getPdfFirstPageAsEditable(
  pdfBlob: Blob
): Promise<PdfEditablePage> {
  ensureWorker()
  const data = await pdfBlob.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({
    data,
    useSystemFonts: true,
    cMapUrl: 'https://unpkg.com/pdfjs-dist@5.4.624/cmaps/',
    cMapPacked: true,
  }).promise
  if (pdf.numPages < 1) throw new Error('PDF da sahifa yo‘q')
  const page = await pdf.getPage(1)
  const view = page.getViewport({ scale: 1 })
  const scale = TARGET_WIDTH / view.width
  const viewport = page.getViewport({ scale })
  const pageWidth = viewport.width
  const pageHeight = viewport.height

  const canvas = document.createElement('canvas')
  canvas.width = pageWidth
  canvas.height = pageHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas context yo‘q')
  await page.render({
    canvasContext: ctx,
    canvas,
    viewport,
    intent: 'display',
  }).promise
  const image: PdfPageImage = {
    dataUrl: canvas.toDataURL('image/png'),
    width: pageWidth,
    height: pageHeight,
  }

  const textContent = await page.getTextContent()
  const raw: PdfTextBlock[] = []
  for (const item of textContent.items) {
    if (!('str' in item) || typeof item.str !== 'string') continue
    const tx = item.transform
    if (!tx || tx.length < 6) continue
    const x = tx[4] * scale
    const w = (item.width ?? 0) * scale
    const h = (item.height ?? 0) * scale
    const y = pageHeight - (tx[5] + (item.height ?? 0)) * scale
    if (item.str.trim() === '') continue
    raw.push({ str: item.str, x, y, w: Math.max(w, 20), h: Math.max(h, 14) })
  }

  const LINE_TOLERANCE = 18
  const blocks = mergeTextBlocksOnSameLine(raw, LINE_TOLERANCE)

  return { image, textBlocks: blocks, pageWidth, pageHeight }
}

function mergeTextBlocksOnSameLine(raw: PdfTextBlock[], yTolerance: number): PdfTextBlock[] {
  if (raw.length === 0) return []
  const byLine = new Map<number, PdfTextBlock[]>()
  for (const b of raw) {
    const yKey = Math.round(b.y / yTolerance) * yTolerance
    if (!byLine.has(yKey)) byLine.set(yKey, [])
    byLine.get(yKey)!.push(b)
  }
  const out: PdfTextBlock[] = []
  for (const lineBlocks of byLine.values()) {
    lineBlocks.sort((a, b) => a.x - b.x)
    let x = lineBlocks[0].x
    let y = lineBlocks[0].y
    let w = lineBlocks[0].w
    let h = lineBlocks[0].h
    let str = lineBlocks[0].str
    for (let i = 1; i < lineBlocks.length; i++) {
      const b = lineBlocks[i]
      const gap = b.x - (x + w)
      str += gap > 3 ? ' ' + b.str : b.str
      w = Math.max(x + w, b.x + b.w) - x
      h = Math.max(h, b.h)
    }
    const lineHeight = Math.min(Math.max(h, 14), 36)
    const minWidthByChars = str.length * 14
    const widthWithPadding = Math.max(w, 20, minWidthByChars) + 24
    out.push({ str, x, y, w: widthWithPadding, h: lineHeight })
  }
  out.sort((a, b) => b.y - a.y)
  return out
}

export async function pdfBase64ToEditable(base64: string): Promise<PdfEditablePage> {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  const blob = new Blob([bytes], { type: 'application/pdf' })
  return getPdfFirstPageAsEditable(blob)
}
