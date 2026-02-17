import type { EditorElement } from '../../types/editor'

interface Props {
  element: EditorElement
  isSelected: boolean
}

export function ImageElement({ element, isSelected }: Props) {
  return (
    <div className={`element-image ${isSelected ? 'selected' : ''}`} style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      {element.src ? (
        <img src={element.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      ) : (
        <div style={{ width: '100%', height: '100%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 12 }}>
          Rasm
        </div>
      )}
    </div>
  )
}
