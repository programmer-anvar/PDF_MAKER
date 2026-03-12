export type ElementType = 'text' | 'textSplit' | 'parentheses' | 'textTemplate' | 'image' | 'rect' | 'line' | 'table' | 'root' | 'fraction' | 'formula' | 'script'

export interface ElementStyle {
  fontSize?: number
  fontWeight?: string
  color?: string
  backgroundColor?: string
  border?: string
  borderWidth?: number
  borderLeft?: string
  borderRight?: string
  borderTop?: string
  borderBottom?: string
  textAlign?: 'left' | 'center' | 'right'
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
  content?: string
  /** For textTemplate: shown in editor and PDF. Backend saves `content` (template). */
  displayContent?: string
  dataKey?: string
  src?: string
  table?: TableData
  isContainer?: boolean
  formulaNum?: string
  formulaDen?: string
  fractionLineWidth?: number
  fractionLineThickness?: number
  formulaTopLineWidth?: number
  formulaLineAngle?: number
  scriptSub?: string
  scriptSuper?: string
  gaseousKey?: string
  gaseousKeyBottom?: string
  gaseousRowHeight?: number
  gaseousRowCount?: number
  gaseousBlock2AtRow?: number
  gaseousBlock2Only?: boolean
}

export interface EditorState {
  elements: EditorElement[]
  selectedId: string | null
  pageWidth: number
  pageHeight: number
}

export const PX_PER_MM = 96 / 25.4
export const A4_WIDTH_MM = 210
export const A4_HEIGHT_MM = 297
export const A4_WIDTH = A4_WIDTH_MM * PX_PER_MM
export const A4_HEIGHT = A4_HEIGHT_MM * PX_PER_MM
export const GRID_SNAP_MM = 1
