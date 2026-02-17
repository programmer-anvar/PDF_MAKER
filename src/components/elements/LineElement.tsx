import type { EditorElement } from '../../types/editor'

interface Props {
  element: EditorElement
  isSelected: boolean
}

export function LineElement({ element, isSelected }: Props) {
  const style = element.style ?? {}
  return (
    <div
      className={`element-line ${isSelected ? 'selected' : ''}`}
      style={{
        width: '100%',
        height: '100%',
        minHeight: 2,
        borderBottom: `${style.borderWidth ?? 2}px solid ${style.color ?? '#000'}`,
      }}
    />
  )
}
