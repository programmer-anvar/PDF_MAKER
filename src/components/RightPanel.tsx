import { useEditorStore } from '../store/editorStore'
import type { ElementStyle } from '../types/editor'

const TYPE_LABELS: Record<string, string> = { text: 'Matn', image: 'Rasm', rect: 'To‘rtburchak', line: 'Chiziq', table: 'Jadval' }

export function RightPanel() {
  const elements = useEditorStore((s) => s.elements)
  const selectedId = useEditorStore((s) => s.selectedId)
  const selected = useEditorStore((s) => s.getSelected())
  const updateElement = useEditorStore((s) => s.updateElement)
  const deleteElement = useEditorStore((s) => s.deleteElement)
  const setSelected = useEditorStore((s) => s.setSelected)
  const bringForward = useEditorStore((s) => s.bringForward)
  const sendBackward = useEditorStore((s) => s.sendBackward)
  const duplicateElement = useEditorStore((s) => s.duplicateElement)

  if (!selected) {
    return (
      <aside className="panel right-panel">
        <h3>Xossalar</h3>
        <p className="panel-hint">Sahifadan elementni tanlang yoki ro‘yxatdan bosing.</p>
        <p className="panel-hint kbd-hint-inline"><kbd>Delete</kbd> o‘chirish · <kbd>Esc</kbd> tanlovni bekor</p>
        {elements.length > 0 && (
          <div className="element-list-panel">
            <label className="prop-group label">Sahifadagi elementlar ({elements.length})</label>
            <ul className="element-list-compact">
              {elements.map((el, i) => (
                <li key={el.id}>
                  <button
                    type="button"
                    className={`element-list-item ${selectedId === el.id ? 'selected' : ''}`}
                    onClick={() => setSelected(el.id)}
                  >
                    <span className="el-type">{TYPE_LABELS[el.type] ?? el.type}</span>
                    <span className="el-preview">{el.type === 'text' ? (el.dataKey ?? el.content ?? '—').slice(0, 20) : `#${i + 1}`}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    )
  }

  const updateStyle = (patch: Partial<ElementStyle>) => {
    updateElement(selected.id, { style: { ...selected.style, ...patch } })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => updateElement(selected.id, { src: reader.result as string })
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <aside className="panel right-panel">
      <h3>Xossalar</h3>
      <div className="props-actions">
        <button type="button" className="btn small" onClick={() => duplicateElement(selected.id)} title="Nusxa (Ctrl+D ni keyinroq qo‘shamiz)">
          📋 Nusxa
        </button>
        <button type="button" className="btn small" onClick={() => bringForward(selected.id)}>
          Oldinga
        </button>
        <button type="button" className="btn small" onClick={() => sendBackward(selected.id)}>
          Orqaga
        </button>
        <button type="button" className="btn small danger" onClick={() => { deleteElement(selected.id); setSelected(null) }} title="Delete">
          O‘chirish
        </button>
      </div>

      <div className="prop-group">
        <label>Pozitsiya / o‘lcham (mm)</label>
        <div className="row two">
          <input
            type="number"
            step={0.5}
            value={selected.x}
            onChange={(e) => updateElement(selected.id, { x: Number(e.target.value) })}
            title="X, mm"
          />
          <input
            type="number"
            step={0.5}
            value={selected.y}
            onChange={(e) => updateElement(selected.id, { y: Number(e.target.value) })}
            title="Y, mm"
          />
        </div>
        <div className="row two">
          <input
            type="number"
            step={0.5}
            value={selected.w}
            onChange={(e) => updateElement(selected.id, { w: Number(e.target.value) })}
            title="Kenglik, mm"
          />
          <input
            type="number"
            step={0.5}
            value={selected.h}
            onChange={(e) => updateElement(selected.id, { h: Number(e.target.value) })}
            title="Balandlik, mm"
          />
        </div>
      </div>

      {selected.type === 'text' && (
        <>
          {selected.dataKey && (
            <div className="prop-group">
              <label>Ma’lumot kaliti (sampling da value chiqadi)</label>
              <input type="text" value={selected.dataKey} readOnly style={{ background: 'rgba(0,0,0,0.2)', cursor: 'default' }} />
            </div>
          )}
          <div className="prop-group">
            <label>Text</label>
            <textarea
              value={selected.content ?? ''}
              onChange={(e) => updateElement(selected.id, { content: e.target.value })}
              rows={3}
            />
          </div>
          <div className="prop-group">
            <label>Shrift o‘lchami</label>
            <input
              type="number"
              value={selected.style?.fontSize ?? 8}
              onChange={(e) => updateStyle({ fontSize: Number(e.target.value) })}
            />
          </div>
          <div className="prop-group">
            <label>Rang</label>
            <input
              type="color"
              value={selected.style?.color ?? '#000000'}
              onChange={(e) => updateStyle({ color: e.target.value })}
            />
          </div>
          <div className="prop-group">
            <label>Hizalash (X)</label>
            <select
              value={selected.style?.textAlign ?? 'left'}
              onChange={(e) => updateStyle({ textAlign: e.target.value as 'left' | 'center' | 'right' })}
            >
              <option value="left">Chap</option>
              <option value="center">Markaz</option>
              <option value="right">O‘ng</option>
            </select>
          </div>
          <div className="prop-group">
            <label>Hizalash (Y)</label>
            <select
              value={selected.style?.verticalAlign ?? 'middle'}
              onChange={(e) => updateStyle({ verticalAlign: e.target.value as 'top' | 'middle' | 'bottom' })}
            >
              <option value="top">Yuqori</option>
              <option value="middle">O‘rta</option>
              <option value="bottom">Past</option>
            </select>
          </div>
          <div className="prop-group">
            <label>Chegara (chap, o‘ng, yuqori, past)</label>
            <input
              type="text"
              placeholder="Chap: 1px solid #999"
              value={selected.style?.borderLeft ?? ''}
              onChange={(e) => updateStyle({ borderLeft: e.target.value || undefined })}
            />
            <input
              type="text"
              placeholder="O‘ng"
              value={selected.style?.borderRight ?? ''}
              onChange={(e) => updateStyle({ borderRight: e.target.value || undefined })}
            />
            <input
              type="text"
              placeholder="Yuqori"
              value={selected.style?.borderTop ?? ''}
              onChange={(e) => updateStyle({ borderTop: e.target.value || undefined })}
            />
            <input
              type="text"
              placeholder="Past"
              value={selected.style?.borderBottom ?? ''}
              onChange={(e) => updateStyle({ borderBottom: e.target.value || undefined })}
            />
          </div>
        </>
      )}

      {selected.type === 'image' && (
        <>
          <div className="prop-group">
            <label>Rasm turi (PDF da)</label>
            <select
              value={selected.dataKey ?? ''}
              onChange={(e) => updateElement(selected.id, { dataKey: e.target.value || undefined })}
            >
              <option value="">Rasm (o‘zingiz yuklaysiz)</option>
              <option value="__sign1Img__">Imzo 1 (meaSignature1)</option>
              <option value="__sign2Img__">Imzo 2 (meaSignature2)</option>
            </select>
          </div>
          {(selected.dataKey === '__sign1Img__' || selected.dataKey === '__sign2Img__') ? (
            <p className="panel-hint">Kefa-dev da PDF exportda sampling imzosi avtomatik chiqadi. Backend ga saqlang.</p>
          ) : (
            <div className="prop-group">
              <label>Rasm</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} />
            </div>
          )}
        </>
      )}

      {selected.type === 'rect' && (
        <>
          <div className="prop-group prop-group-checkbox">
            <label>
              <input
                type="checkbox"
                checked={!!selected.isContainer}
                onChange={(e) => {
                  const setContainer = useEditorStore.getState().setContainer
                  setContainer(e.target.checked ? selected.id : null)
                }}
              />
              <span>Ramka (barcha elementlar shu ichida qolsin)</span>
            </label>
          </div>
          <div className="prop-group">
            <label>Orqa fon</label>
            <input
              type="color"
              value={selected.style?.backgroundColor ?? '#f0f0f0'}
              onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
            />
          </div>
          <div className="prop-group">
            <label>Chegara (chap, o‘ng, yuqori, past)</label>
            <input
              type="text"
              placeholder="Chap: 1px solid #999"
              value={selected.style?.borderLeft ?? ''}
              onChange={(e) => updateStyle({ borderLeft: e.target.value || undefined })}
            />
            <input
              type="text"
              placeholder="O‘ng"
              value={selected.style?.borderRight ?? ''}
              onChange={(e) => updateStyle({ borderRight: e.target.value || undefined })}
            />
            <input
              type="text"
              placeholder="Yuqori"
              value={selected.style?.borderTop ?? ''}
              onChange={(e) => updateStyle({ borderTop: e.target.value || undefined })}
            />
            <input
              type="text"
              placeholder="Past"
              value={selected.style?.borderBottom ?? ''}
              onChange={(e) => updateStyle({ borderBottom: e.target.value || undefined })}
            />
          </div>
        </>
      )}

      {selected.type === 'line' && (
        <div className="prop-group">
          <label>Rang / qalinlik</label>
          <input
            type="color"
            value={selected.style?.color ?? '#000000'}
            onChange={(e) => updateStyle({ color: e.target.value })}
          />
          <input
            type="number"
            min={1}
            max={20}
            value={selected.style?.borderWidth ?? 2}
            onChange={(e) => updateStyle({ borderWidth: Number(e.target.value) })}
          />
        </div>
      )}

      {selected.type === 'table' && selected.table && (
        <>
          <div className="prop-group">
            <label>Qatorlar / Ustunlar</label>
            <div className="row two">
              <input
                type="number"
                min={1}
                max={20}
                value={selected.table.rows}
                onChange={(e) => {
                  const rows = Number(e.target.value)
                  const data = selected.table!.data ?? []
                  const newData = Array.from({ length: rows }, (_, i) => data[i] ?? Array(selected.table!.cols).fill(''))
                  updateElement(selected.id, { table: { ...selected.table!, rows, data: newData } })
                }}
              />
              <input
                type="number"
                min={1}
                max={10}
                value={selected.table.cols}
                onChange={(e) => {
                  const cols = Number(e.target.value)
                  const data = selected.table!.data ?? []
                  const newData = data.map((row) => row.slice(0, cols).concat(Array(Math.max(0, cols - row.length)).fill('')))
                  updateElement(selected.id, { table: { ...selected.table!, cols, data: newData } })
                }}
              />
            </div>
          </div>
          <div className="prop-group">
            <label>Jadval matni (CSV: qatorlar ; ustunlar vergul)</label>
            <textarea
              placeholder="1,2,3;4,5,6"
              rows={4}
              value={(selected.table.data ?? []).map((r) => r.join(',')).join(';')}
              onChange={(e) => {
                const str = e.target.value
                const data = str.split(';').map((row) => row.split(',').map((c) => c.trim()))
                updateElement(selected.id, { table: { ...selected.table!, data } })
              }}
            />
          </div>
        </>
      )}
    </aside>
  )
}
