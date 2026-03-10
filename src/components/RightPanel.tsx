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

const TYPE_LABELS: Record<string, string> = { text: '텍스트', textTemplate: '텍스트 + 키 (Text${key})', textSplit: '취소선 텍스트', parentheses: '괄호 (…)', root: '수학 루트', fraction: '분수', formula: '루트 분수', script: '첨자 (P_a)', image: '이미지', rect: '사각형', line: '선', table: '표' }

export function RightPanel() {
  const elements = useEditorStore((s) => s.pages[s.activePageIndex]?.elements ?? [])
  const selectedId = useEditorStore((s) => s.selectedId)
  const selected = useEditorStore((s) => s.getSelected())
  const updateElement = useEditorStore((s) => s.updateElement)
  const deleteElement = useEditorStore((s) => s.deleteElement)
  const setSelected = useEditorStore((s) => s.setSelected)
  const duplicateElement = useEditorStore((s) => s.duplicateElement)

  if (!selected) {
    return (
      <aside className="panel right-panel">
        <h3>속성</h3>
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
                    <span className="el-preview">{(el.type === 'text' || el.type === 'textTemplate' || el.type === 'textSplit' || el.type === 'parentheses' || el.type === 'root' || el.type === 'fraction' || el.type === 'formula' || el.type === 'script') ? (el.type === 'formula' ? `${(el.formulaNum ?? '').slice(0, 12)}…` : el.type === 'script' ? `${el.content ?? 'P'}${(el.scriptSub ?? '').slice(0, 4)}${(el.scriptSuper ?? '').slice(0, 4)}` : (el.type === 'textTemplate' ? (el.content ?? '—') : (el.dataKey ?? el.content ?? '—')).slice(0, 20)) : `#${i + 1}`}</span>
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
        <button type="button" className="btn small" onClick={() => duplicateElement(selected.id)} title="Nusxa (Ctrl+D ni keyinroq qo‘shamiz)">
          📋 복사
        </button>
        <button type="button" className="btn small danger" onClick={() => { deleteElement(selected.id); setSelected(null) }} title="Delete">
          삭제
        </button>
      </div>

      <div className="prop-group">
        <label>위치 / 크기 (mm)</label>
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
        <label>각도 (도)</label>
        <input
          type="number"
          step={5}
          min={-360}
          max={360}
          value={selected.rotate ?? 0}
          onChange={(e) => updateElement(selected.id, { rotate: Number(e.target.value) || 0 })}
          title="Skew the element"
        />
      </div>

      {(selected.type === 'text' || selected.type === 'textTemplate' || selected.type === 'textSplit' || selected.type === 'parentheses' || selected.type === 'root' || selected.type === 'fraction' || selected.type === 'formula' || selected.type === 'script') && (
        <>
          {selected.type !== 'textTemplate' && (
          <div className="prop-group">
              <label>데이터 키</label>
              <input
              type="text"
              value={selected.dataKey ?? ''}
              onChange={(e) => updateElement(selected.id, { dataKey: e.target.value || undefined })}
              placeholder="키 이름 또는 비워 두세요"
            />
          </div>
          )}
          {selected.type === 'textTemplate' && (
            <div className="prop-group">
              <label>텍스트 + 키 (Text{'{'}${'{key}'}{'}'})</label>
              <input
                type="text"
                value={selected.content ?? ''}
                onChange={(e) => updateElement(selected.id, { content: e.target.value || 'text${key}' })}
                placeholder="text${key}"
              />
              <p className="panel-hint">PDF에서 {`\${key}`} 로 대체됩니다.</p>
            </div>
          )}
          {(selected.type === 'text' || selected.type === 'textSplit' || selected.type === 'parentheses') && (
            <>
              <div className="prop-group">
                <label>가스 키{selected.type === 'textSplit' ? ' (Top)' : ''}</label>
                <input
                  type="text"
                  value={selected.gaseousKey ?? ''}
                  onChange={(e) => updateElement(selected.id, { gaseousKey: e.target.value || undefined })}
                  placeholder={selected.type === 'textSplit' ? 'gasVolumeStart' : 'pollutantName, gasVolumeStart, gasVolumeEnd, …'}
                />
                {selected.type === 'textSplit' && (
                  <div className="prop-group">
                    <label>가스 키 (하단)</label>
                    <input
                      type="text"
                      value={selected.gaseousKeyBottom ?? ''}
                      onChange={(e) => updateElement(selected.id, { gaseousKeyBottom: e.target.value || undefined })}
                      placeholder="가스 부피 종료"
                    />
                  </div>
                )}
              </div>
              <div className="prop-group">
                <label>줄 높이 (mm) – 새 줄마다 Y 값이 이만큼 증가합니다</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={selected.gaseousRowHeight ?? 6}
                  onChange={(e) => updateElement(selected.id, { gaseousRowHeight: Number(e.target.value) || undefined })}
                />
              </div>
              <div className="prop-group">
                <label>행 수 – 지정한 만큼의 셀이 생성됩니다 (data.gaseousList에서 채워지며, 남는 셀은 비어 있습니다).</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={selected.gaseousRowCount ?? ''}
                  onChange={(e) => updateElement(selected.id, { gaseousRowCount: e.target.value === '' ? undefined : Number(e.target.value) || 0 })}
                  placeholder="비어 있음 = 목록 길이"
                />
              </div>
            </>
          )}
          {selected.type === 'formula' ? (
            <>
              <div className="prop-group">
                <label>분자 (루트 아래)</label>
                <input
                  type="text"
                  value={selected.formulaNum ?? ''}
                  onChange={(e) => updateElement(selected.id, { formulaNum: e.target.value })}
                  placeholder="2 × 9.81 × (-)"
                />
              </div>
              <div className="prop-group">
                <label>분모 (아래 부분)</label>
                <input
                  type="text"
                  value={selected.formulaDen ?? ''}
                  onChange={(e) => updateElement(selected.id, { formulaDen: e.target.value })}
                  placeholder="(-)"
                />
              </div>
           
              <div className="prop-group">
                <label>선 각도 (도)</label>
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
          ) : selected.type === 'textSplit' ? (
            <>
              <div className="prop-group">
                <label>위쪽 선</label>
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
                <label>선 아래 텍스트</label>
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
                <label>기본 기호 (예: P)</label>
                <input
                  type="text"
                  value={selected.content ?? ''}
                  onChange={(e) => updateElement(selected.id, { content: e.target.value })}
                  placeholder="P"
                />
              </div>
              <div className="prop-group">
                <label>아래 첨자 (Pₐ)</label>
                <input
                  type="text"
                  value={selected.scriptSub ?? ''}
                  onChange={(e) => updateElement(selected.id, { scriptSub: e.target.value })}
                  placeholder="a"
                />
              </div>
              <div className="prop-group">
                <label>위 첨자 (x²)</label>
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
              <label>{selected.type === 'fraction' ? 'Fraction (e.g., a/b)' : selected.type === 'root' ? 'Expression under the root' : selected.type === 'parentheses' ? '텍스트 (괄호 안)' : 'Text'}</label>
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
                <label>분수선 길이 (%)</label>
                <input
                  type="number"
                  min={10}
                  max={500}
                  value={selected.fractionLineWidth ?? 100}
                  onChange={(e) => updateElement(selected.id, { fractionLineWidth: Math.max(10, Math.min(500, Number(e.target.value) || 100)) })}
                />
              </div>
              <div className="prop-group">
                <label>분수선 두께 (px)</label>
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
            <label>글자 크기</label>
            <input
              type="number"
              value={selected.style?.fontSize ?? 8}
              onChange={(e) => updateStyle({ fontSize: Number(e.target.value) })}
            />
          </div>
          <div className="prop-group">
            <label>색상</label>
            <input
              type="color"
              value={selected.style?.color ?? '#000000'}
              onChange={(e) => updateStyle({ color: e.target.value })}
            />
          </div>
          <div className="prop-group">
            <label>정렬 (X)</label>
            <select
              value={selected.style?.textAlign ?? 'left'}
              onChange={(e) => updateStyle({ textAlign: e.target.value as 'left' | 'center' | 'right' })}
            >
              <option value="left">왼쪽</option>
              <option value="center">가운데</option>
              <option value="right">오른쪽</option>
            </select>
          </div>
          <div className="prop-group">
            <label>정렬 (Y)</label>
            <select
              value={selected.style?.verticalAlign ?? 'middle'}
              onChange={(e) => updateStyle({ verticalAlign: e.target.value as 'top' | 'middle' | 'bottom' })}
            >
              <option value="top">위쪽</option>
              <option value="middle">가운데</option>
              <option value="bottom">아래쪽</option>
            </select>
          </div>
          <div className="prop-group">
            <label>테두리 (왼쪽, 오른쪽, 위, 아래)</label>
            <input
              type="text"
              placeholder="왼쪽: 1px solid #999"
              value={selected.style?.borderLeft ?? ''}
              onChange={(e) => updateStyle({ borderLeft: e.target.value || undefined })}
            />
            <input
              type="text"
              placeholder="오른쪽: 1px solid #999"
              value={selected.style?.borderRight ?? ''}
              onChange={(e) => updateStyle({ borderRight: e.target.value || undefined })}
            />
            <input
              type="text"
              placeholder="위쪽: 1px solid #999"
              value={selected.style?.borderTop ?? ''}
              onChange={(e) => updateStyle({ borderTop: e.target.value || undefined })}
            />
            <input
              type="text"
              placeholder="아래쪽: 1px solid #999"
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
              <span>프레임 (모든 요소는 이 안에 있어야 합니다)</span>
            </label>
          </div>
          <div className="prop-group">
            <label>배경색</label>
            <input
              type="color"
              value={selected.style?.backgroundColor ?? '#f0f0f0'}
              onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
            />
          </div>
          <div className="prop-group">
            <label>테두리 (왼쪽, 오른쪽, 위쪽, 아래쪽)</label>
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
          <label>색상 / 두께</label>
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
            <label>행 / 열</label>
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
            <label>테이블 텍스트 (CSV: 행은 ; 로, 열은 쉼표로 구분)</label>
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
