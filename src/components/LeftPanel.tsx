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
      </ul>
    </aside>
  )
}
