import { useEditorStore } from '../store/editorStore'
import type { ElementType } from '../types/editor'

const ELEMENTS: { type: ElementType; label: string; icon: string }[] = [
  { type: 'text', label: 'Matn', icon: 'T' },
  { type: 'image', label: 'Rasm', icon: '🖼' },
  { type: 'rect', label: 'To‘rtburchak', icon: '▢' },
  { type: 'line', label: 'Chiziq', icon: '—' },
  { type: 'table', label: 'Jadval', icon: '▦' },
]

export function LeftPanel() {
  const addElement = useEditorStore((s) => s.addElement)

  return (
    <aside className="panel left-panel">
      <h3>Elementlar</h3>
      <p className="panel-hint">Qo‘shish uchun bosing</p>
      <ul className="element-list">
        {ELEMENTS.map(({ type, label, icon }) => (
          <li key={type}>
            <button
              type="button"
              className="element-btn"
              onClick={() => addElement(type)}
              title={label}
            >
              <span className="element-icon">{icon}</span>
              <span>{label}</span>
            </button>
          </li>
        ))}
        <li>
          <button
            type="button"
            className="element-btn"
            onClick={() => addElement('image', undefined, undefined, undefined, { w: 20, h: 10 }, '__sign1Img__')}
            title="PDF da meaSignature1"
          >
            <span className="element-icon">✍</span>
            <span>Imzo 1</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            className="element-btn"
            onClick={() => addElement('image', undefined, undefined, undefined, { w: 20, h: 10 }, '__sign2Img__')}
            title="PDF da meaSignature2"
          >
            <span className="element-icon">✍</span>
            <span>Imzo 2</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            className="element-btn"
            onClick={() => addElement('image', undefined, undefined, undefined, { w: 28, h: 25 }, '__shapeImage__')}
            title="PDF da shapeImage (eni/balandlik boshqariladi)"
          >
            <span className="element-icon">▢</span>
            <span>Shape</span>
          </button>
        </li>
      </ul>
    </aside>
  )
}
