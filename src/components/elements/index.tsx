import { TextElement } from './TextElement'
import { TextSplitElement } from './TextSplitElement'
import { ParenthesesElement } from './ParenthesesElement'
import { ImageElement } from './ImageElement'
import { RectElement } from './RectElement'
import { LineElement } from './LineElement'
import { TableElement } from './TableElement'
import { RootElement } from './RootElement'
import { FractionElement } from './FractionElement'
import { FormulaElement } from './FormulaElement'
import { ScriptElement } from './ScriptElement'
import type { EditorElement } from '../../types/editor'

interface Props {
  element: EditorElement
  isSelected: boolean
}

export function ElementRenderer({ element, isSelected }: Props) {
  switch (element.type) {
    case 'text':
      return <TextElement element={element} isSelected={isSelected} />
    case 'parentheses':
      return <ParenthesesElement element={element} isSelected={isSelected} />
    case 'textSplit':
      return <TextSplitElement element={element} isSelected={isSelected} />
    case 'image':
      return <ImageElement element={element} isSelected={isSelected} />
    case 'rect':
      return <RectElement element={element} isSelected={isSelected} />
    case 'line':
      return <LineElement element={element} isSelected={isSelected} />
    case 'table':
      return <TableElement element={element} isSelected={isSelected} />
    case 'root':
      return <RootElement element={element} isSelected={isSelected} />
    case 'fraction':
      return <FractionElement element={element} isSelected={isSelected} />
    case 'formula':
      return <FormulaElement element={element} isSelected={isSelected} />
    case 'script':
      return <ScriptElement element={element} isSelected={isSelected} />
    default:
      return null
  }
}
