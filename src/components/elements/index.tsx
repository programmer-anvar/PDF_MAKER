import { TextElement } from './TextElement'
import { ImageElement } from './ImageElement'
import { RectElement } from './RectElement'
import { LineElement } from './LineElement'
import { TableElement } from './TableElement'
import type { EditorElement } from '../../types/editor'

interface Props {
  element: EditorElement
  isSelected: boolean
}

export function ElementRenderer({ element, isSelected }: Props) {
  switch (element.type) {
    case 'text':
      return <TextElement element={element} isSelected={isSelected} />
    case 'image':
      return <ImageElement element={element} isSelected={isSelected} />
    case 'rect':
      return <RectElement element={element} isSelected={isSelected} />
    case 'line':
      return <LineElement element={element} isSelected={isSelected} />
    case 'table':
      return <TableElement element={element} isSelected={isSelected} />
    default:
      return null
  }
}
