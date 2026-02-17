import type { EditorElement } from '../../types/editor'

interface Props {
  element: EditorElement
  isSelected: boolean
}

export function TextElement({ element, isSelected }: Props) {
  const style = element.style ?? {}
  return (
    <div
      className={`element-text ${isSelected ? 'selected' : ''}`}
      style={{
        width: '100%',
        height: '100%',
        fontSize: style.fontSize ?? 14,
        fontWeight: style.fontWeight ?? 'normal',
        color: style.color ?? '#000',
        textAlign: style.textAlign ?? 'left',
        fontFamily: style.fontFamily ?? 'inherit',
        padding: 4,
        overflow: 'hidden',
        wordBreak: 'break-word',
        borderLeft: style.borderLeft,
        borderRight: style.borderRight,
        borderTop: style.borderTop,
        borderBottom: style.borderBottom,
      }}
    >
      {element.content || 'Matn'}
    </div>
  )
}
