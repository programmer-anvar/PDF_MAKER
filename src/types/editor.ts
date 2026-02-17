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
  /** A4 dimensions in px (794×1123 at 96dpi) */
  pageWidth: number
  pageHeight: number
}

export const A4_WIDTH = 794
export const A4_HEIGHT = 1123
export const GRID_SNAP = 5
