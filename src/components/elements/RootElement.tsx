import type { EditorElement } from '../../types/editor'

interface Props {
  element: EditorElement
  isSelected: boolean
}

export function RootElement({ element, isSelected }: Props) {
  const style = element.style ?? {}
  const text = element.dataKey ?? element.content ?? 'x'

  return (
    <div
      className={`element-text element-root ${isSelected ? 'selected' : ''}`}
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
        overflow: 'hidden',
        whiteSpace: 'pre-wrap',
        borderLeft: style.borderLeft,
        borderRight: style.borderRight,
        borderTop: style.borderTop,
        borderBottom: style.borderBottom,
      }}
    >
      <span style={{ fontSize: '1.15em', lineHeight: 1 }} aria-hidden>√</span>
      <span>{text}</span>
    </div>
  )
}
