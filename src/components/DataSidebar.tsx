import { useEffect, useState } from 'react'
import { useEditorStore } from '../store/editorStore'
import type { ElementType } from '../types/editor'
import { samplingReportKeysStatic } from '../data/samplingReportKeysStatic'
import type { SamplingDefineItem } from '../api/samplingDefine'
import { fetchSamplingDefineKeys } from '../api/samplingDefine'

const setDraggingFromSidebar = () => useEditorStore.getState().setDraggingFromSidebar(true)
const setNotDraggingFromSidebar = () => useEditorStore.getState().setDraggingFromSidebar(false)

const ELEMENTS: { type: ElementType; label: string; icon: string }[] = [
  { type: 'text', label: 'Matn', icon: 'T' },
  { type: 'image', label: 'Rasm', icon: '🖼' },
  { type: 'rect', label: 'To‘rtburchak', icon: '▢' },
  { type: 'line', label: 'Chiziq', icon: '—' },
  { type: 'table', label: 'Jadval', icon: '▦' },
]

/** title bo‘yicha guruhlash */
function groupByTitle(items: SamplingDefineItem[]): Record<string, SamplingDefineItem[]> {
  return items.reduce<Record<string, SamplingDefineItem[]>>((acc, f) => {
    if (!acc[f.title]) acc[f.title] = []
    acc[f.title].push(f)
    return acc
  }, {})
}


export function DataSidebar() {
  const [defineKeys, setDefineKeys] = useState<SamplingDefineItem[]>(() => samplingReportKeysStatic)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchSamplingDefineKeys()
      .then((list) => {
        if (!cancelled && list && list.length > 0) setDefineKeys(list)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const fieldsByTitle = groupByTitle(defineKeys)

  return (
    <aside className="panel left-panel data-sidebar">
      <section className="sidebar-section">
        <p className="panel-hint">Keylarni sahifaga torting. API dan dbName / showName. Kefa-dev da value lar chiqadi.</p>
        {loading && <p className="panel-hint">Yuklanmoqda…</p>}
        <div className="data-blocks">
          {Object.entries(fieldsByTitle).map(([title, items]) => (
            <div key={title} className="data-block">
              <div className="data-block-title">{title}</div>
              <ul className="data-list">
                {items.map((item) => (
                  <li
                    key={item.dataKey}
                    className="data-row data-row-draggable"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData(
                        'application/json',
                        JSON.stringify({ label: item.dataKey, value: '', text: item.dataKey, dataKey: item.dataKey })
                      )
                      e.dataTransfer.effectAllowed = 'copy'
                      setDraggingFromSidebar()
                    }}
                    onDragEnd={() => setNotDraggingFromSidebar()}
                  >
                    <span className="data-label" title={item.dataKey}>{item.label}</span>
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
          <li>
            <button
              type="button"
              className="element-btn"
              onClick={() => useEditorStore.getState().addElement('image', undefined, undefined, undefined, { w: 20, h: 10 }, '__sign1Img__')}
              title="PDF da meaSignature1 (o‘lcham 20×10 mm)"
            >
              <span className="element-icon">✍</span>
              <span>Imzo 1</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              style={{background:'none'}}
              className="element-btn"
              onClick={() => useEditorStore.getState().addElement('image', undefined, undefined, undefined, { w: 20, h: 10 }, '__sign2Img__')}
              title="PDF da meaSignature2 (o‘lcham 20×10 mm)"
            >
              <span className="element-icon">✍</span>
              <span>Imzo 2</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              className="element-btn"
              onClick={() => useEditorStore.getState().addElement('image', undefined, undefined, undefined, { w: 28, h: 25 }, '__shapeImage__')}
              title="PDF da shapeImage (o‘lchamni boshqarish mumkin)"
            >
              <span className="element-icon">▢</span>
              <span>Shape</span>
            </button>
          </li>
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
