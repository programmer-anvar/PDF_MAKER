import type { EditorElement } from '../../types/editor'

interface Props {
  element: EditorElement
  isSelected: boolean
}

const SIGN_LABELS: Record<string, string> = {
  __sign1Img__: 'Imzo 1',
  __sign2Img__: 'Imzo 2',
}

export function ImageElement({ element, isSelected }: Props) {
  const placeholder = !element.src && element.dataKey ? SIGN_LABELS[element.dataKey] : null
  return (
    <div className={`element-image ${isSelected ? 'selected' : ''}`} style={{ overflow: 'hidden' }}>
      {element.src ? (
        <img src={element.src} alt="" style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
      ) : (
        <div style={{ background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: 11, width: '100%', height: '100%' }}>
          {placeholder ?? 'Rasm'}
        </div>
      )}
    </div>
  )
}
