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
        minWidth: 'min-content',
        minHeight: 'min-content',
        boxSizing: 'border-box',
        fontSize: style.fontSize ?? 14,
        fontWeight: style.fontWeight ?? 'normal',
        color: style.color ?? '#000',
        textAlign: style.textAlign ?? 'left',
        fontFamily: style.fontFamily ?? 'inherit',
        padding: 4,
        lineHeight: 1.4,
        letterSpacing: '0.02em',
        overflow: 'visible',
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        whiteSpace: 'pre-wrap',
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
