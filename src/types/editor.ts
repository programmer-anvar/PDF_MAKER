/** Element types in the designer */
export type ElementType = 'text' | 'image' | 'rect' | 'line' | 'table'

export interface ElementStyle {
  fontSize?: number
  fontWeight?: string
  color?: string
  backgroundColor?: string
  border?: string
  borderWidth?: number
  /** Har bir tomon alohida: "1px solid #999" */
  borderLeft?: string
  borderRight?: string
  borderTop?: string
  borderBottom?: string
  textAlign?: 'left' | 'center' | 'right'
  /** Y o'qi bo'yicha: yuqori, o'rta, past */
  verticalAlign?: 'top' | 'middle' | 'bottom'
  fontFamily?: string
}

export interface TableData {
  rows: number
  cols: number
  data?: string[][]
  border?: boolean
  cellPadding?: number
}

export interface EditorElement {
  id: string
  type: ElementType
  x: number
  y: number
  w: number
  h: number
  rotate?: number
  style?: ElementStyle
  /** Text content */
  content?: string
  /** Ma'lumot kaliti – designer da key ko'rsatiladi, sampling da data[dataKey] value */
  dataKey?: string
  /** Image src (data URL or URL) */
  src?: string
  /** Table config */
  table?: TableData
  /** To‘rtburchak ramka bo‘lsa – boshqa elementlar shundan chiqib ketmasin */
  isContainer?: boolean
}

export interface EditorState {
  elements: EditorElement[]
  selectedId: string | null
  /** Sahifa o'lchami, mm (210×297 A4) */
  pageWidth: number
  pageHeight: number
}

/** 1 mm = necha px (96 DPI): 96/25.4 */
export const PX_PER_MM = 96 / 25.4
/** A4 mm da – barcha o'lchamlar shu birlikda */
export const A4_WIDTH_MM = 210
export const A4_HEIGHT_MM = 297
/** Eksport uchun A4 px (html2canvas) */
export const A4_WIDTH = A4_WIDTH_MM * PX_PER_MM
export const A4_HEIGHT = A4_HEIGHT_MM * PX_PER_MM
/** Panjara qadami, mm */
export const GRID_SNAP_MM = 1
