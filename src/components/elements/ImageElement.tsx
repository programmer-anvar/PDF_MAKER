import type { EditorElement } from '../../types/editor'

interface Props {
  element: EditorElement
  isSelected: boolean
}

export function ImageElement({ element, isSelected }: Props) {
  return (
    <div className={`element-image ${isSelected ? 'selected' : ''}`} style={{  overflow: 'hidden' }}>
      {element.src ? (
        <img src={element.src} alt="" style={{ objectFit: 'contain' }} />
      ) : (
        <div style={{  background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 12 }}>
          Rasm
        </div>
      )}
    </div>
  )
}
