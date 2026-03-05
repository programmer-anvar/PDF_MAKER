import type { EditorElement } from '../../types/editor'

interface Props {
  element: EditorElement
  isSelected: boolean
}

const PLACEHOLDER_LABELS: Record<string, string> = {
  __sign1Img__: 'Signature 1',
  __sign2Img__: 'Signature 2',
  __shapeImage__: 'Shape',
}

const SHAPE_IMAGE_FALLBACK = '/shapeImg.png'

export function ImageElement({ element, isSelected }: Props) {
  const displaySrc = element.src || (element.dataKey === '__shapeImage__' ? SHAPE_IMAGE_FALLBACK : null)
  const placeholder = !displaySrc && element.dataKey ? PLACEHOLDER_LABELS[element.dataKey] : null
  return (
    <div
      className={`element-image ${isSelected ? 'selected' : ''}`}
      style={{ overflow: 'hidden', width: '100%', height: '100%', minHeight: 0, boxSizing: 'border-box' }}
    >
      {displaySrc ? (
        <img src={displaySrc} alt="" style={{ objectFit: 'contain', width: '100%', height: '100%', display: 'block' }} />
      ) : (
        <div style={{  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: 11, width: '100%', height: '100%', minHeight: 0 }}>
          {placeholder ?? 'Rasm'}
        </div>
      )}
    </div>
  )
}
