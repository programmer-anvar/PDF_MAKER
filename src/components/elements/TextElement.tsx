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
      data-data-key={element.dataKey ?? undefined}
      style={{
        width: '100%',
        height: '100%',
        minWidth: 0,
        minHeight: 0,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: style.verticalAlign === 'top' ? 'flex-start' : style.verticalAlign === 'bottom' ? 'flex-end' : 'center',
        justifyContent: style.textAlign === 'center' ? 'center' : style.textAlign === 'right' ? 'flex-end' : 'flex-start',
        fontSize: style.fontSize ?? 14,
        fontWeight: style.fontWeight ?? 'normal',
        color: style.color ?? '#000',
        textAlign: style.textAlign ?? 'left',
        fontFamily: style.fontFamily ?? 'inherit',
        padding: 4,
        lineHeight: 1.4,
        letterSpacing: '0.02em',
        overflow: 'hidden',
        wordBreak: 'normal',
        overflowWrap: 'normal',
        whiteSpace: 'pre-wrap',
        textOverflow: 'ellipsis',
        borderLeft: style.borderLeft,
        borderRight: style.borderRight,
        borderTop: style.borderTop,
        borderBottom: style.borderBottom,
      }}
    >
      {element.dataKey ?? element.content ?? 'Matn'}
    </div>
  )
}
