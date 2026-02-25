import type { EditorElement } from '../../types/editor'

interface Props {
  element: EditorElement
  isSelected: boolean
}

export function FractionElement({ element, isSelected }: Props) {
  const style = element.style ?? {}
  const raw = element.dataKey ?? element.content ?? 'a/b'
  const slashIdx = raw.indexOf('/')
  const num = slashIdx >= 0 ? raw.slice(0, slashIdx).trim() || 'a' : raw
  const den = slashIdx >= 0 ? raw.slice(slashIdx + 1).trim() || 'b' : ''
  const lineWidth = Math.max(10, Math.min(200, element.fractionLineWidth ?? 100))
  const lineThickness = Math.max(1, Math.min(20, element.fractionLineThickness ?? 2))

  return (
    <div
      className={`element-text element-fraction ${isSelected ? 'selected' : ''}`}
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
        fontSize: style.fontSize ?? 14,
        fontWeight: style.fontWeight ?? 'normal',
        color: style.color ?? '#000',
        fontFamily: style.fontFamily ?? 'inherit',
        padding: 2,
        overflow: 'hidden',
        borderLeft: style.borderLeft,
        borderRight: style.borderRight,
        borderTop: style.borderTop,
        borderBottom: style.borderBottom,
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0,
          lineHeight: 1.2,
          minWidth: 0,
        }}
      >
        <span>{num}</span>
        <span style={{ borderBottom: `${lineThickness}px solid ${style.color ?? '#000'}`, width: `${lineWidth}%`, textAlign: 'center', paddingTop:"1px", paddingBottom:"1px" }} />
        <span style={{paddingTop:'1px'}}>{den}</span>
      </span>
    </div>
  )
}
