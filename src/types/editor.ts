/** Element types in the designer */
export type ElementType = 'text' | 'textSplit' | 'parentheses' | 'textTemplate' | 'image' | 'rect' | 'line' | 'table' | 'root' | 'fraction' | 'formula' | 'script'

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
  /** Formula (ildizli kasr): surat */
  formulaNum?: string
  /** Formula: maxraj */
  formulaDen?: string
  /** Kasr chizig'i uzunligi, % (kasr va formula) */
  fractionLineWidth?: number
  /** Kasr chizig'i qalinligi, px (kasr va formula) */
  fractionLineThickness?: number
  /** Formula tepasidagi chiziq (ildiz ostidagi) uzunligi, % */
  formulaTopLineWidth?: number
  /** Formula chiziqlarini qiyshaytirish, gradus (-45 … 45), 0 = gorizontal */
  formulaLineAngle?: number
  /** Indeksli matn (P_a): pastki indeks */
  scriptSub?: string
  /** Indeksli matn (x^2): yuqori indeks */
  scriptSuper?: string
  /** data.gaseousList qatorida chiqarish: har bir element uchun kalit (pollutantName, gasVolumeStart, …) */
  gaseousKey?: string
  /** TextSplit uchun: pastdagi qism uchun gaseous kalit (masalan gasVolumeEnd) */
  gaseousKeyBottom?: string
  /** Gaseous qator balandligi, mm – har bir yangi qator uchun Y += gaseousRowHeight */
  gaseousRowHeight?: number
  /** Qatorlar soni – shuncha katak chiqadi; data.gaseousList dan to'ldiriladi (ortiqchasi bo'sh) */
  gaseousRowCount?: number
  /** Ustun boshiga qatorlar soni (masalan 6) – X o'qi bo'yicha keyingi ustun shu qatordan boshlanadi */
  gaseousBlock2AtRow?: number
  /** Faqat 2-ustun (o'ng): faqat list[block2AtRow].. chiqaradi, Y bir xil (baseY) */
  gaseousBlock2Only?: boolean
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
