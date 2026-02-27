import { useEditorStore } from '../store/editorStore'
import type { ElementStyle } from '../types/editor'

const TYPE_LABELS: Record<string, string> = { text: 'Matn', root: 'Matematik ildiz', fraction: 'Kasr', formula: 'Ildizli kasr', script: 'Indeks (P_a)', image: 'Rasm', rect: 'To‘rtburchak', line: 'Chiziq', table: 'Jadval' }

export function RightPanel() {
  const elements = useEditorStore((s) => s.pages[s.activePageIndex]?.elements ?? [])
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
        <h3>Properties</h3>
        <p className="panel-hint">Select an element from the page or click it from the list.</p>
        <p className="panel-hint kbd-hint-inline"><kbd>Delete</kbd> <kbd>Esc</kbd> tanlovni bekor</p>
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
                    <span className="el-preview">{(el.type === 'text' || el.type === 'root' || el.type === 'fraction' || el.type === 'formula' || el.type === 'script') ? (el.type === 'formula' ? `${(el.formulaNum ?? '').slice(0, 12)}…` : el.type === 'script' ? `${el.content ?? 'P'}${(el.scriptSub ?? '').slice(0, 4)}${(el.scriptSuper ?? '').slice(0, 4)}` : (el.dataKey ?? el.content ?? '—').slice(0, 20)) : `#${i + 1}`}</span>
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
      <h3>Properties</h3>
      <div className="props-actions">
        <button type="button" className="btn small" onClick={() => duplicateElement(selected.id)} title="Nusxa (Ctrl+D ni keyinroq qo‘shamiz)">
          📋 Copy
        </button>
        <button type="button" className="btn small" onClick={() => bringForward(selected.id)}>
          Forward
        </button>
        <button type="button" className="btn small" onClick={() => sendBackward(selected.id)}>
          Back
        </button>
        <button type="button" className="btn small danger" onClick={() => { deleteElement(selected.id); setSelected(null) }} title="Delete">
          Delete
        </button>
      </div>

      <div className="prop-group">
        <label>Position / Size (mm)</label>
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

      <div className="prop-group">
        <label>Angle (degrees)</label>
        <input
          type="number"
          step={5}
          min={-360}
          max={360}
          value={selected.rotate ?? 0}
          onChange={(e) => updateElement(selected.id, { rotate: Number(e.target.value) || 0 })}
          title="Elementni qiyshaytirish"
        />
      </div>

      {(selected.type === 'text' || selected.type === 'root' || selected.type === 'fraction' || selected.type === 'formula' || selected.type === 'script') && (
        <>
          <div className="prop-group">
              <label>Data Key (displays “value” in sampling)</label>
              <input
              type="text"
              value={selected.dataKey ?? ''}
              onChange={(e) => updateElement(selected.id, { dataKey: e.target.value || undefined })}
              placeholder="key nomi yoki bo'sh qoldiring"
            />
          </div>
          {selected.type === 'text' && (
            <>
              <div className="prop-group">
                <label>Gaseous qator kaliti (data.gaseousList[i] dan key)</label>
                <input
                  type="text"
                  value={selected.gaseousKey ?? ''}
                  onChange={(e) => updateElement(selected.id, { gaseousKey: e.target.value || undefined })}
                  placeholder="pollutantName, gasVolumeStart, gasVolumeEnd, …"
                />
                <p className="panel-hint">To'ldirsangiz sampling PDF da loop: har qator uchun Y += qator balandligi. Katak ramkasi uchun matn elementiga style (border) bering.</p>
              </div>
              <div className="prop-group">
                <label>Qator balandligi (mm) – har yangi qator uchun Y += shu qiymat</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={selected.gaseousRowHeight ?? 6}
                  onChange={(e) => updateElement(selected.id, { gaseousRowHeight: Number(e.target.value) || undefined })}
                />
              </div>
              <div className="prop-group">
                <label>Qatorlar soni – shuncha katak chiqadi (data.gaseousList dan to'ldiriladi, ortiqchasi bo'sh)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={selected.gaseousRowCount ?? ''}
                  onChange={(e) => updateElement(selected.id, { gaseousRowCount: e.target.value === '' ? undefined : Number(e.target.value) || 0 })}
                  placeholder="bo'sh = list uzunligi"
                />
              </div>
              <div className="prop-group">
                <label>Ustun boshiga qatorlar (X o'qi: 6 = birinchi 6 chapda, keyingi 6 o'ngda)</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={selected.gaseousBlock2AtRow ?? ''}
                  onChange={(e) => updateElement(selected.id, { gaseousBlock2AtRow: e.target.value === '' ? undefined : Number(e.target.value) || 0 })}
                  placeholder="6"
                />
              </div>
              <div className="prop-group">
                <label>
                  <input
                    type="checkbox"
                    checked={!!selected.gaseousBlock2Only}
                    onChange={(e) => updateElement(selected.id, { gaseousBlock2Only: e.target.checked || undefined })}
                  />
                  {' '}Faqat 2-ustun (o'ng): list[6].. chiqadi, Y bir xil
                </label>
              </div>
            </>
          )}
          {selected.type === 'formula' ? (
            <>
              <div className="prop-group">
                <label>Numerator (under the radical)</label>
                <input
                  type="text"
                  value={selected.formulaNum ?? ''}
                  onChange={(e) => updateElement(selected.id, { formulaNum: e.target.value })}
                  placeholder="2 × 9.81 × (-)"
                />
              </div>
              <div className="prop-group">
                <label>Maxraj (pastki qismi)</label>
                <input
                  type="text"
                  value={selected.formulaDen ?? ''}
                  onChange={(e) => updateElement(selected.id, { formulaDen: e.target.value })}
                  placeholder="(-)"
                />
              </div>
              <div className="prop-group">
                <label>Tepadagi chiziq uzunligi (%)</label>
                <input
                  type="number"
                  min={10}
                  max={200}
                  value={selected.formulaTopLineWidth ?? 100}
                  onChange={(e) => updateElement(selected.id, { formulaTopLineWidth: Math.max(10, Math.min(200, Number(e.target.value) || 100)) })}
                />
              </div>
              <div className="prop-group">
                <label>Kasr chizig'i uzunligi (%)</label>
                <input
                  type="number"
                  min={10}
                  max={200}
                  value={selected.fractionLineWidth ?? 100}
                  onChange={(e) => updateElement(selected.id, { fractionLineWidth: Math.max(10, Math.min(200, Number(e.target.value) || 100)) })}
                />
              </div>
              <div className="prop-group">
                <label>Kasr chizig'i qalinligi (px)</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={selected.fractionLineThickness ?? 2}
                  onChange={(e) => updateElement(selected.id, { fractionLineThickness: Math.max(1, Math.min(20, Number(e.target.value) || 2)) })}
                />
              </div>
              <div className="prop-group">
                <label>Chiziq burchagi (gradus)</label>
                <input
                  type="number"
                  min={-45}
                  max={45}
                  value={selected.formulaLineAngle ?? 0}
                  onChange={(e) => updateElement(selected.id, { formulaLineAngle: Math.max(-45, Math.min(45, Number(e.target.value) || 0)) })}
                  placeholder="0 = gorizontal"
                />
              </div>
            </>
          ) : selected.type === 'script' ? (
            <>
              <div className="prop-group">
                <label>Asosiy belgi (masalan: P)</label>
                <input
                  type="text"
                  value={selected.content ?? ''}
                  onChange={(e) => updateElement(selected.id, { content: e.target.value })}
                  placeholder="P"
                />
              </div>
              <div className="prop-group">
                <label>Pastki indeks (P_a)</label>
                <input
                  type="text"
                  value={selected.scriptSub ?? ''}
                  onChange={(e) => updateElement(selected.id, { scriptSub: e.target.value })}
                  placeholder="a"
                />
              </div>
              <div className="prop-group">
                <label>Yuqori indeks (x^2)</label>
                <input
                  type="text"
                  value={selected.scriptSuper ?? ''}
                  onChange={(e) => updateElement(selected.id, { scriptSuper: e.target.value })}
                  placeholder="2"
                />
              </div>
            </>
          ) : (
            <div className="prop-group">
              <label>{selected.type === 'fraction' ? 'Kasr (masalan: a/b)' : selected.type === 'root' ? 'Ildiz ostidagi ifoda' : 'Text'}</label>
              <textarea
                value={selected.content ?? ''}
                onChange={(e) => updateElement(selected.id, { content: e.target.value })}
                rows={3}
              />
            </div>
          )}
          {selected.type === 'fraction' && (
            <>
              <div className="prop-group">
                <label>Kasr chizig'i uzunligi (%)</label>
                <input
                  type="number"
                  min={10}
                  max={200}
                  value={selected.fractionLineWidth ?? 100}
                  onChange={(e) => updateElement(selected.id, { fractionLineWidth: Math.max(10, Math.min(200, Number(e.target.value) || 100)) })}
                />
              </div>
              <div className="prop-group">
                <label>Kasr chizig'i qalinligi (px)</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={selected.fractionLineThickness ?? 2}
                  onChange={(e) => updateElement(selected.id, { fractionLineThickness: Math.max(1, Math.min(20, Number(e.target.value) || 2)) })}
                />
              </div>
            </>
          )}
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
              <option value="__sign1Img__"> 1 (meaSignature1)</option>
              <option value="__sign2Img__">2 (meaSignature2)</option>
              <option value="__shapeImage__">Shape (shapeImage)</option>
            </select>
          </div>
          {(selected.dataKey === '__sign1Img__' || selected.dataKey === '__sign2Img__') ? (
            <p className="panel-hint">Kefa-dev da PDF exportda sampling imzosi avtomatik chiqadi. Backend ga saqlang.</p>
          ) : selected.dataKey === '__shapeImage__' ? (
            <p className="panel-hint">Kefa-dev da PDF da shapeImage avtomatik chiqadi. Eni va balandlikni yuqoridagi Kenglik/Balandlik (mm) orqali boshqaring.</p>
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
              <span>Frame (all elements must stay inside it)</span>
            </label>
          </div>
          <div className="prop-group">
            <label>Backround</label>
            <input
              type="color"
              value={selected.style?.backgroundColor ?? '#f0f0f0'}
              onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
            />
          </div>
          <div className="prop-group">
            <label>border (left, right, top, bottom)</label>
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
