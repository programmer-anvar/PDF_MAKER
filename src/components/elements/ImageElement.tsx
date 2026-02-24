import type { EditorElement } from '../../types/editor'

interface Props {
  element: EditorElement
  isSelected: boolean
}

const PLACEHOLDER_LABELS: Record<string, string> = {
  __sign1Img__: 'Imzo 1',
  __sign2Img__: 'Imzo 2',
  __shapeImage__: 'Shape',
}

export function ImageElement({ element, isSelected }: Props) {
  const placeholder = !element.src && element.dataKey ? PLACEHOLDER_LABELS[element.dataKey] : null
  return (
    <div
      className={`element-image ${isSelected ? 'selected' : ''}`}
      style={{ overflow: 'hidden', width: '100%', height: '100%', minHeight: 0, boxSizing: 'border-box' }}
    >
      {element.src ? (
        <img src={element.src} alt="" style={{ objectFit: 'contain', width: '100%', height: '100%', display: 'block' }} />
      ) : (
        <div style={{ background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: 11, width: '100%', height: '100%', minHeight: 0 }}>
          {placeholder ?? 'Rasm'}
        </div>
      )}
    </div>
  )
}
