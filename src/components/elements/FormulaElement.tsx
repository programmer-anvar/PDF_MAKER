import type { EditorElement } from '../../types/editor'

interface Props {
  element: EditorElement
  isSelected: boolean
}

export function FormulaElement({ element, isSelected }: Props) {
  const style = element.style ?? {}
  const num = element.formulaNum ?? '2 × 9.81 × (-)'
  const den = element.formulaDen ?? '(-)'
  const topLineWidth = Math.max(10, Math.min(500, element.formulaTopLineWidth ?? 100))
  const fractionLineWidth = Math.max(10, Math.min(500, element.fractionLineWidth ?? 100))
  const lineThickness = Math.max(1, Math.min(20, element.fractionLineThickness ?? 2))
  const lineAngle = Math.max(-45, Math.min(45, element.formulaLineAngle ?? 0))
  const lineTransform = lineAngle !== 0 ? `rotate(${lineAngle}deg)` : undefined

  return (
    <div
      className={`element-formula ${isSelected ? 'selected' : ''}`}
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
        padding: '4px 6px',
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
          alignItems: 'center',
          gap: 4,
          lineHeight: 1.3,
        }}
      >
        <span style={{ fontSize: '1.35em', alignSelf: 'stretch', display: 'flex', alignItems: 'stretch' }} aria-hidden>
          √
        </span>
        <span
          style={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0,
            paddingTop: 2,
          }}
        >
          <span style={{ borderTop: `${lineThickness}px solid ${style.color ?? '#000'}`, width: `${topLineWidth}%`, alignSelf: 'center', display: 'block', height: 0, marginBottom: 2, transform: lineTransform, transformOrigin: 'center center' }} />
          <span>{num}</span>
          <span style={{ borderBottom: `${lineThickness}px solid ${style.color ?? '#000'}`, width: `${fractionLineWidth}%`, textAlign: 'center', transform: lineTransform, transformOrigin: 'center center' }} />
          <span>{den}</span>
        </span>
      </span>
    </div>
  )
}
