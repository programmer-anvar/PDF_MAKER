import { useEditorStore } from '../store/editorStore'
import type { ElementType } from '../types/editor'
import { mockSidebarData } from '../data/mockSidebarData'

const setDraggingFromSidebar = () => useEditorStore.getState().setDraggingFromSidebar(true)
const setNotDraggingFromSidebar = () => useEditorStore.getState().setDraggingFromSidebar(false)

const ELEMENTS: { type: ElementType; label: string; icon: string }[] = [
  { type: 'text', label: 'Matn', icon: 'T' },
  { type: 'image', label: 'Rasm', icon: '🖼' },
  { type: 'rect', label: 'To‘rtburchak', icon: '▢' },
  { type: 'line', label: 'Chiziq', icon: '—' },
  { type: 'table', label: 'Jadval', icon: '▦' },
]

/** Chap panel: ma’lumotlar sidebar ko‘rinishida + elementlar */
export function DataSidebar() {
  return (
    <aside className="panel left-panel data-sidebar">
      <section className="sidebar-section">
        <h3>Ma’lumotlar</h3>
        <p className="panel-hint">PDF da chiqadigan ma’lumotlar</p>
        <div className="data-blocks">
          {mockSidebarData.map((section, i) => (
            <div key={i} className="data-block">
              <div className="data-block-title">{section.title}</div>
              <ul className="data-list">
                {section.items.map((item, j) => (
                  <li
                    key={j}
                    className="data-row data-row-draggable"
                    draggable
                    onDragStart={(e) => {
                      const text = item.value ? `${item.label}: ${item.value}` : item.label
                      e.dataTransfer.setData('application/json', JSON.stringify({ label: item.label, value: item.value, text }))
                      e.dataTransfer.effectAllowed = 'copy'
                      setDraggingFromSidebar()
                    }}
                    onDragEnd={() => setNotDraggingFromSidebar()}
                  >
                    <span className="data-label">{item.label}</span>
                    <span className="data-value">{item.value || '—'}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <section className="sidebar-section element-section">
        <h3>Elementlar</h3>
        <p className="panel-hint">Sahifaga qo‘shish. Avval Ramka qo‘ying, keyin ichiga elementlarni joylashtiring.</p>
        <ul className="element-list">
          <li>
            <button
              type="button"
              className="element-btn element-btn-ramka"
              onClick={() => useEditorStore.getState().addFrame()}
              title="Ramka – elementlar shu ichida qoladi"
            >
              <span className="element-icon">▣</span>
              <span>Ramka</span>
            </button>
          </li>
          {ELEMENTS.map(({ type, label, icon }) => (
            <li key={type}>
              <ElementBtn type={type} label={label} icon={icon} />
            </li>
          ))}
        </ul>
      </section>
    </aside>
  )
}

function ElementBtn({ type, label, icon }: { type: ElementType; label: string; icon: string }) {
  const addElement = useEditorStore((s) => s.addElement)
  return (
    <button
      type="button"
      className="element-btn"
      onClick={() => addElement(type)}
      title={label}
    >
      <span className="element-icon">{icon}</span>
      <span>{label}</span>
    </button>
  )
}
