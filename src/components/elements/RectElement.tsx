import type { EditorElement } from '../../types/editor'

interface Props {
  element: EditorElement
  isSelected: boolean
}

export function RectElement({ element, isSelected }: Props) {
  const style = element.style ?? {}
  const hasSides = style.borderLeft ?? style.borderRight ?? style.borderTop ?? style.borderBottom
  const isRamka = element.isContainer
  return (
    <div
      className={`element-rect ${isRamka ? 'element-ramka' : ''} ${isSelected ? 'selected' : ''}`}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: isRamka ? 'transparent' : (style.backgroundColor ?? '#f0f0f0'),
        border: hasSides ? undefined : (style.border ?? '1px solid #999'),
        borderLeft: style.borderLeft,
        borderRight: style.borderRight,
        borderTop: style.borderTop,
        borderBottom: style.borderBottom,
      }}
    >
      {isRamka && <span className="ramka-label">Ramka</span>}
    </div>
  )
}
