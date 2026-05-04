import { useEditorStore } from '../store/editorStore'
import type { ElementStyle } from '../types/editor'

function round1mm(n: number | undefined): number {
  if (n == null || !Number.isFinite(n)) return 0
  return Math.round(n * 10) / 10
}

function parseMmInput(v: string): number {
  const normalized = String(v).trim().replace(',', '.')
  return Number(normalized)
}

const TYPE_LABELS: Record<string, string> = { text: 'Text', textTemplate: 'Text + Key (Text${key})', textSplit: 'Split Text', parentheses: 'Parentheses (…)', root: 'Root (√)', fraction: 'Fraction', formula: 'Formula', script: 'Script (P_a)', image: 'Image', rect: 'Rectangle', line: 'Line', table: 'Table' }

export function RightPanel() {
  const elements = useEditorStore((s) => s.pages[s.activePageIndex]?.elements ?? [])
  const selectedId = useEditorStore((s) => s.selectedId)
  const selected = useEditorStore((s) => s.getSelected())
  const updateElement = useEditorStore((s) => s.updateElement)
  const deleteElement = useEditorStore((s) => s.deleteElement)
  const setSelected = useEditorStore((s) => s.setSelected)
  const duplicateElement = useEditorStore((s) => s.duplicateElement)
  const templateType = useEditorStore((s) => s.templateType)

  if (!selected) {
    return (
      <aside className="panel right-panel">
        <h3>Properties</h3>
        <p className="panel-hint">Select an element.</p>
        {elements.length > 0 && (
          <div className="element-list-panel">
            <label className="prop-group label">Elements on page ({elements.length})</label>
            <ul className="element-list-compact">
              {elements.map((el, i) => (
                <li key={el.id}>
                  <button
                    type="button"
                    className={`element-list-item ${selectedId === el.id ? 'selected' : ''}`}
                    onClick={() => setSelected(el.id)}
                  >
                    <span className="el-type">{TYPE_LABELS[el.type] ?? el.type}</span>
                    <span className="el-preview">{(el.type === 'text' || el.type === 'textTemplate' || el.type === 'textSplit' || el.type === 'parentheses' || el.type === 'root' || el.type === 'fraction' || el.type === 'formula' || el.type === 'script') ? (el.type === 'formula' ? `${(el.formulaNum ?? '').slice(0, 12)}…` : el.type === 'script' ? `${el.content ?? 'P'}${(el.scriptSub ?? '').slice(0, 4)}${(el.scriptSuper ?? '').slice(0, 4)}` : (el.type === 'textTemplate' ? (el.displayContent || (el.content ?? '—')) : (el.dataKey ?? el.content ?? '—')).slice(0, 20)) : `#${i + 1}`}</span>
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

  return (
    <aside className="panel right-panel">
      <h3>Properties</h3>
      <div className="props-actions">
        <button type="button" className="btn small" onClick={() => duplicateElement(selected.id)} title="Copy">
          📋 Copy
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
            step={0.1}
            value={round1mm(selected.x)}
            onChange={(e) => updateElement(selected.id, { x: round1mm(parseMmInput(e.target.value)) })}
            title="X, mm"
          />
          <input
            type="number"
            step={0.1}
            value={round1mm(selected.y)}
            onChange={(e) => updateElement(selected.id, { y: round1mm(parseMmInput(e.target.value)) })}
            title="Y, mm"
          />
        </div>
        <div className="row two">
          <input
            type="number"
            step={0.1}
            value={round1mm(selected.w)}
            onChange={(e) => updateElement(selected.id, { w: round1mm(parseMmInput(e.target.value)) })}
            title="Width, mm"
          />
          <input
            type="number"
            step={0.1}
            value={round1mm(selected.h)}
            onChange={(e) => updateElement(selected.id, { h: round1mm(parseMmInput(e.target.value)) })}
            title="Height, mm"
          />
        </div>
      </div>

      <div className="prop-group">
        <label>Rotation (°)</label>
        <input
          type="number"
          step={5}
          min={-360}
          max={360}
          value={selected.rotate ?? 0}
          onChange={(e) => updateElement(selected.id, { rotate: Number(e.target.value) || 0 })}
        />
      </div>

      {(selected.type === 'text' || selected.type === 'textTemplate' || selected.type === 'textSplit' || selected.type === 'parentheses' || selected.type === 'root' || selected.type === 'fraction' || selected.type === 'formula' || selected.type === 'script') && (
        <>
          {selected.type !== 'textTemplate' && (
            <div className="prop-group">
              <label>Data Key</label>
              <input
                type="text"
                value={selected.dataKey ?? ''}
                onChange={(e) => updateElement(selected.id, { dataKey: e.target.value || undefined })}
                placeholder="key name or leave empty"
              />
            </div>
          )}
          {selected.type === 'textTemplate' && (
            <div className="prop-group">
              <label>Text + Key (Text{'{'}${'{key}'}{'}'})</label>
              <input
                type="text"
                value={selected.content ?? ''}
                onChange={(e) => updateElement(selected.id, { content: e.target.value || 'text${key}' })}
                placeholder="text${key}"
              />
              <p className="panel-hint">{`\${key}`} will be replaced in PDF.</p>
            </div>
          )}
          {(selected.type === 'text' || selected.type === 'textSplit' || selected.type === 'parentheses') && (
            <>
              {templateType === 'sampling2' && (
                <>
                  <div className="prop-group">
                    <label>Gaseous Key{selected.type === 'textSplit' ? ' (top)' : ''}</label>
                    <input
                      type="text"
                      value={selected.gaseousKey ?? ''}
                      onChange={(e) => updateElement(selected.id, { gaseousKey: e.target.value || undefined })}
                      placeholder={selected.type === 'textSplit' ? 'gasVolumeStart' : 'pollutantName, gasVolumeStart, …'}
                    />
                    {selected.type === 'textSplit' && (
                      <div className="prop-group">
                        <label>Gaseous Key (bottom)</label>
                        <input
                          type="text"
                          value={selected.gaseousKeyBottom ?? ''}
                          onChange={(e) => updateElement(selected.id, { gaseousKeyBottom: e.target.value || undefined })}
                          placeholder="gasVolumeEnd"
                        />
                      </div>
                    )}
                  </div>
                  <div className="prop-group">
                    <label>Gaseous row count</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={selected.gaseousRowCount ?? ''}
                      onChange={(e) => updateElement(selected.id, { gaseousRowCount: e.target.value === '' ? undefined : Number(e.target.value) || 0 })}
                      placeholder="empty = list length"
                    />
                  </div>
                </>
              )}
              {templateType === 'thc' && (
                <>
                  <div className="prop-group">
                    <label>THC Key</label>
                    <input
                      type="text"
                      value={selected.thcKey ?? ''}
                      onChange={(e) => updateElement(selected.id, { thcKey: e.target.value || undefined })}
                      placeholder="eqRegObjId, calibrationDate, …"
                    />
                  </div>
                  <div className="prop-group">
                    <label>THC row count</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={selected.thcRowCount ?? ''}
                      onChange={(e) => updateElement(selected.id, { thcRowCount: e.target.value === '' ? undefined : Number(e.target.value) || 0 })}
                      placeholder="empty = list length"
                    />
                  </div>
                </>
              )}
              {templateType === 'mobileScale' && (
                <>
                  <div className="prop-group">
                    <label>Mobile Scale Key</label>
                    <input
                      type="text"
                      value={selected.mobileScaleKey ?? ''}
                      onChange={(e) => updateElement(selected.id, { mobileScaleKey: e.target.value || undefined })}
                      placeholder="companyName, testMeaValue, …"
                    />
                  </div>
                  <div className="prop-group">
                    <label>Mobile Scale row count</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={selected.mobileScaleRowCount ?? ''}
                      onChange={(e) => updateElement(selected.id, { mobileScaleRowCount: e.target.value === '' ? undefined : Number(e.target.value) || 0 })}
                      placeholder="empty = list length"
                    />
                  </div>
                </>
              )}
              {templateType === 'operation' && (
                <>
                  <div className="prop-group">
                    <label>Operation Key</label>
                    <input
                      type="text"
                      value={selected.operationKey ?? ''}
                      onChange={(e) => updateElement(selected.id, { operationKey: e.target.value || undefined })}
                      placeholder="departureTime, arrivalTime, …"
                    />
                  </div>
                  <div className="prop-group">
                    <label>Operation row count</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={selected.operationRowCount ?? ''}
                      onChange={(e) => updateElement(selected.id, { operationRowCount: e.target.value === '' ? undefined : Number(e.target.value) || 0 })}
                      placeholder="empty = list length"
                    />
                  </div>
                </>
              )}
              {templateType === 'envMeasurement' && (
                <>
                  <div className="prop-group">
                    <label>Env Measurement Key</label>
                    <input
                      type="text"
                      value={selected.envMeasurementKey ?? ''}
                      onChange={(e) => updateElement(selected.id, { envMeasurementKey: e.target.value || undefined })}
                      placeholder="zone, temperature, humidity, …"
                    />
                  </div>
                  <div className="prop-group">
                    <label>Env Measurement row count</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={selected.envMeasurementRowCount ?? ''}
                      onChange={(e) => updateElement(selected.id, { envMeasurementRowCount: e.target.value === '' ? undefined : Number(e.target.value) || 0 })}
                      placeholder="empty = list length"
                    />
                  </div>
                </>
              )}
              {templateType === 'wasteWater' && (
                <>
                  <div className="prop-group">
                    <label>Waste Water Key</label>
                    <input
                      type="text"
                      value={selected.wasteWaterKey ?? ''}
                      onChange={(e) => updateElement(selected.id, { wasteWaterKey: e.target.value || undefined })}
                      placeholder="receiptDate, generationVolume, …"
                    />
                  </div>
                  <div className="prop-group">
                    <label>Waste Water row count</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={selected.wasteWaterRowCount ?? ''}
                      onChange={(e) => updateElement(selected.id, { wasteWaterRowCount: e.target.value === '' ? undefined : Number(e.target.value) || 0 })}
                      placeholder="empty = list length"
                    />
                  </div>
                </>
              )}
              {templateType === 'safetyInspection' && (
                <>
                  <div className="prop-group">
                    <label>Safety Inspection Key</label>
                    <input
                      type="text"
                      value={selected.safetyInspectionKey ?? ''}
                      onChange={(e) => updateElement(selected.id, { safetyInspectionKey: e.target.value || undefined })}
                      placeholder="type1, item1, result1, …, createdBy, createdAt"
                    />
                  </div>
                  <div className="prop-group">
                    <label>Safety Inspection col width (mm)</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={selected.safetyInspectionColWidth ?? ''}
                      onChange={(e) => updateElement(selected.id, { safetyInspectionColWidth: Number(e.target.value) || undefined })}
                      placeholder="default = element width"
                    />
                  </div>
                  <div className="prop-group">
                    <label>Safety Inspection col count</label>
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={selected.safetyInspectionColCount ?? ''}
                      onChange={(e) => updateElement(selected.id, { safetyInspectionColCount: e.target.value === '' ? undefined : Number(e.target.value) || 0 })}
                      placeholder="empty = list length"
                    />
                  </div>
                  <div className="prop-group">
                    <label>Safety Inspection min rows</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={selected.safetyInspectionRowCount ?? ''}
                      onChange={(e) => updateElement(selected.id, { safetyInspectionRowCount: e.target.value === '' ? undefined : Number(e.target.value) || 0 })}
                      placeholder="default = 5"
                    />
                  </div>
                </>
              )}
            </>
          )}
          {selected.type === 'formula' ? (
            <>
              <div className="prop-group">
                <label>Numerator (under root)</label>
                <input
                  type="text"
                  value={selected.formulaNum ?? ''}
                  onChange={(e) => updateElement(selected.id, { formulaNum: e.target.value })}
                  placeholder="2 × 9.81 × (-)"
                />
              </div>
              <div className="prop-group">
                <label>Denominator</label>
                <input
                  type="text"
                  value={selected.formulaDen ?? ''}
                  onChange={(e) => updateElement(selected.id, { formulaDen: e.target.value })}
                  placeholder="(-)"
                />
              </div>
              <div className="prop-group">
                <label>Line angle (°)</label>
                <input
                  type="number"
                  min={-45}
                  max={45}
                  value={selected.formulaLineAngle ?? 0}
                  onChange={(e) => updateElement(selected.id, { formulaLineAngle: Math.max(-45, Math.min(45, Number(e.target.value) || 0)) })}
                  placeholder="0 = horizontal"
                />
              </div>
            </>
          ) : selected.type === 'textSplit' ? (
            <>
              <div className="prop-group">
                <label>Above line</label>
                <input
                  type="text"
                  value={(selected.content ?? '').split('\n')[0] ?? ''}
                  onChange={(e) => {
                    const bottom = (selected.content ?? '').split('\n')[1] ?? ''
                    updateElement(selected.id, { content: e.target.value + (bottom ? '\n' + bottom : '') })
                  }}
                  placeholder="6"
                />
              </div>
              <div className="prop-group">
                <label>Below line</label>
                <input
                  type="text"
                  value={(selected.content ?? '').split('\n')[1] ?? ''}
                  onChange={(e) => {
                    const top = (selected.content ?? '').split('\n')[0] ?? ''
                    updateElement(selected.id, { content: top + (e.target.value ? '\n' + e.target.value : '') })
                  }}
                  placeholder="5"
                />
              </div>
            </>
          ) : selected.type === 'script' ? (
            <>
              <div className="prop-group">
                <label>Base symbol (e.g. P)</label>
                <input
                  type="text"
                  value={selected.content ?? ''}
                  onChange={(e) => updateElement(selected.id, { content: e.target.value })}
                  placeholder="P"
                />
              </div>
              <div className="prop-group">
                <label>Subscript (Pₐ)</label>
                <input
                  type="text"
                  value={selected.scriptSub ?? ''}
                  onChange={(e) => updateElement(selected.id, { scriptSub: e.target.value })}
                  placeholder="a"
                />
              </div>
              <div className="prop-group">
                <label>Superscript (x²)</label>
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
              <label>{selected.type === 'fraction' ? 'Fraction (e.g., a/b)' : selected.type === 'root' ? 'Expression under root' : selected.type === 'parentheses' ? 'Text (inside parentheses)' : 'Text'}</label>
              <textarea
                value={selected.type === 'textTemplate' ? (selected.displayContent ?? '') : (selected.content ?? '')}
                onChange={(e) => updateElement(selected.id, selected.type === 'textTemplate' ? { displayContent: e.target.value } : { content: e.target.value })}
                rows={3}
              />
              {selected.type === 'textTemplate' && (
                <p className="panel-hint">Displayed in editor and PDF. Backend stores Text+Key.</p>
              )}
            </div>
          )}
          {selected.type === 'fraction' && (
            <>
              <div className="prop-group">
                <label>Line width (%)</label>
                <input
                  type="number"
                  min={10}
                  max={500}
                  value={selected.fractionLineWidth ?? 100}
                  onChange={(e) => updateElement(selected.id, { fractionLineWidth: Math.max(10, Math.min(500, Number(e.target.value) || 100)) })}
                />
              </div>
              <div className="prop-group">
                <label>Line thickness (px)</label>
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
            <label>Font size</label>
            <input
              type="number"
              value={selected.style?.fontSize ?? 8}
              onChange={(e) => updateStyle({ fontSize: Number(e.target.value) })}
            />
          </div>
          <div className="prop-group">
            <label>Color</label>
            <input
              type="color"
              value={selected.style?.color ?? '#000000'}
              onChange={(e) => updateStyle({ color: e.target.value })}
            />
          </div>
          <div className="prop-group">
            <label>Align (X)</label>
            <select
              value={selected.style?.textAlign ?? 'left'}
              onChange={(e) => updateStyle({ textAlign: e.target.value as 'left' | 'center' | 'right' })}
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
          <div className="prop-group">
            <label>Align (Y)</label>
            <select
              value={selected.style?.verticalAlign ?? 'middle'}
              onChange={(e) => updateStyle({ verticalAlign: e.target.value as 'top' | 'middle' | 'bottom' })}
            >
              <option value="top">Top</option>
              <option value="middle">Middle</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>
          <div className="prop-group">
            <label>Border (left, right, top, bottom)</label>
            <input
              type="text"
              placeholder="left: 1px solid #999"
              value={selected.style?.borderLeft ?? ''}
              onChange={(e) => updateStyle({ borderLeft: e.target.value || undefined })}
            />
            <input
              type="text"
              placeholder="right: 1px solid #999"
              value={selected.style?.borderRight ?? ''}
              onChange={(e) => updateStyle({ borderRight: e.target.value || undefined })}
            />
            <input
              type="text"
              placeholder="top: 1px solid #999"
              value={selected.style?.borderTop ?? ''}
              onChange={(e) => updateStyle({ borderTop: e.target.value || undefined })}
            />
            <input
              type="text"
              placeholder="bottom: 1px solid #999"
              value={selected.style?.borderBottom ?? ''}
              onChange={(e) => updateStyle({ borderBottom: e.target.value || undefined })}
            />
          </div>
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
              <span>Frame (all elements must be placed inside)</span>
            </label>
          </div>
          <div className="prop-group">
            <label>Background color</label>
            <input
              type="color"
              value={selected.style?.backgroundColor ?? '#f0f0f0'}
              onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
            />
          </div>
          <div className="prop-group">
            <label>Border (left, right, top, bottom)</label>
            <input
              type="text"
              placeholder="left: 1px solid #999"
              value={selected.style?.borderLeft ?? ''}
              onChange={(e) => updateStyle({ borderLeft: e.target.value || undefined })}
            />
            <input
              type="text"
              placeholder="right: 1px solid #999"
              value={selected.style?.borderRight ?? ''}
              onChange={(e) => updateStyle({ borderRight: e.target.value || undefined })}
            />
            <input
              type="text"
              placeholder="top: 1px solid #999"
              value={selected.style?.borderTop ?? ''}
              onChange={(e) => updateStyle({ borderTop: e.target.value || undefined })}
            />
            <input
              type="text"
              placeholder="bottom: 1px solid #999"
              value={selected.style?.borderBottom ?? ''}
              onChange={(e) => updateStyle({ borderBottom: e.target.value || undefined })}
            />
          </div>
        </>
      )}

      {selected.type === 'line' && (
        <div className="prop-group">
          <label>Color / Thickness</label>
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
            <label>Rows / Cols</label>
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
            <label>Table text</label>
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
