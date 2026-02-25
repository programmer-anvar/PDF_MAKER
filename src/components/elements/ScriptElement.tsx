import type { EditorElement } from '../../types/editor'

interface Props {
  element: EditorElement
  isSelected: boolean
}

export function ScriptElement({ element, isSelected }: Props) {
  const style = element.style ?? {}
  const base = element.content ?? element.dataKey ?? 'P'
  const sub = element.scriptSub ?? ''
  const sup = element.scriptSuper ?? ''
  const fontSize = style.fontSize ?? 14
  const scriptSize = Math.max(8, fontSize * 0.7)

  return (
    <div
      className={`element-text element-script ${isSelected ? 'selected' : ''}`}
      data-data-key={element.dataKey ?? undefined}
      style={{
        width: '100%',
        height: '100%',
        minWidth: 0,
        minHeight: 0,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: style.textAlign === 'center' ? 'center' : style.textAlign === 'right' ? 'flex-end' : 'flex-start',
        fontSize,
        fontWeight: style.fontWeight ?? 'normal',
        color: style.color ?? '#000',
        fontFamily: style.fontFamily ?? 'inherit',
        padding: 4,
        overflow: 'hidden',
        borderLeft: style.borderLeft,
        borderRight: style.borderRight,
        borderTop: style.borderTop,
        borderBottom: style.borderBottom,
      }}
    >
      <span style={{ display: 'inline', lineHeight: 1.3 }}>
        {sup ? <span style={{ fontSize: scriptSize, verticalAlign: 'super' }}>{sup}</span> : null}
        <span>{base}</span>
        {sub ? <span style={{ fontSize: scriptSize, verticalAlign: 'sub' }}>{sub}</span> : null}
      </span>
    </div>
  )
}
