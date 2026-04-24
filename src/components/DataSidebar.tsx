import { useEffect, useState } from 'react'
import { useEditorStore } from '../store/editorStore'
import type { ElementType } from '../types/editor'
import type { TemplateType } from '../api/server'
import { samplingReportKeysStatic } from '../data/samplingReportKeysStatic'
import { thcReportKeysStatic } from '../data/thcReportKeysStatic'
import { mobileScaleReportKeysStatic } from '../data/mobileScaleReportKeysStatic'
import { operationReportKeysStatic } from '../data/operationReportKeysStatic'
import { envMeasurementReportKeysStatic } from '../data/envMeasurementReportKeysStatic'
import { wasteWaterReportKeysStatic } from '../data/wasteWaterReportKeysStatic'
import { safetyInspectionReportKeysStatic } from '../data/safetyInspectionReportKeysStatic'
import type { SamplingDefineItem } from '../api/samplingDefine'
import { fetchSamplingDefineKeys } from '../api/samplingDefine'

const setDraggingFromSidebar = () => useEditorStore.getState().setDraggingFromSidebar(true)
const setNotDraggingFromSidebar = () => useEditorStore.getState().setDraggingFromSidebar(false)

const ELEMENTS: { type: ElementType; label: string; icon: string }[] = [
  { type: 'text', label: '텍스트', icon: 'T' },
  { type: 'textTemplate', label: '텍스트 + 키 (Text${key})', icon: 'T$' },
  { type: 'parentheses', label: '괄호 (…)', icon: '( )' },
  { type: 'textSplit', label: "Strikethrough Text", icon: '|T' },
  { type: 'fraction', label: 'Fraction', icon: 'a/b' },
  { type: 'script', label: 'Indeks (P_a)', icon: 'Pₐ' },
  { type: 'rect', label: '사각형', icon: '▢' },
  { type: 'line', label: '선', icon: '—' },
]

function groupByTitle(items: SamplingDefineItem[]): Record<string, SamplingDefineItem[]> {
  return items.reduce<Record<string, SamplingDefineItem[]>>((acc, f) => {
    if (!acc[f.title]) acc[f.title] = []
    acc[f.title].push(f)
    return acc
  }, {})
}

export function DataSidebar() {
  const templateType = useEditorStore((s) => s.templateType)
  const setTemplateType = useEditorStore((s) => s.setTemplateType)

  const [samplingKeys, setSamplingKeys] = useState<SamplingDefineItem[]>(() => samplingReportKeysStatic)
  const [loadingSampling, setLoadingSampling] = useState(true)

  // type LoopGroup = { id: number; prefix: string; dbName: string; count: string }
  // const [loopGroups, setLoopGroups] = useState<LoopGroup[]>([{ id: 1, prefix: '', dbName: '', count: '' }])

  // const updateLoopGroup = (id: number, field: keyof Omit<LoopGroup, 'id'>, value: string) => {
  //   setLoopGroups((prev) => prev.map((g) => (g.id === id ? { ...g, [field]: value } : g)))
  // }
  // const addLoopGroup = () => {
  //   setLoopGroups((prev) => [...prev, { id: Date.now(), prefix: '', dbName: '', count: '' }])
  // }
  // const removeLoopGroup = (id: number) => {
  //   setLoopGroups((prev) => prev.filter((g) => g.id !== id))
  // }
  // const getGroupKeys = (g: LoopGroup): string[] => {
  //   const n = Math.max(1, Math.min(200, parseInt(g.count, 10) || 0))
  //   if (!g.dbName.trim() || n === 0) return []
  //   return Array.from({ length: n }, (_, i) =>
  //     g.prefix.trim()
  //       ? `${g.prefix.trim()}_${i}_${g.dbName.trim()}`
  //       : `${g.dbName.trim()}_${i}`,
  //   )
  // }

  useEffect(() => {
    let cancelled = false
    setLoadingSampling(true)
    fetchSamplingDefineKeys()
      .then((list) => {
        if (!cancelled && list && list.length > 0) setSamplingKeys(list)
      })
      .finally(() => {
        if (!cancelled) setLoadingSampling(false)
      })
    return () => { cancelled = true }
  }, [])

  const activeKeys =
    templateType === 'thc'
      ? thcReportKeysStatic
      : templateType === 'mobileScale'
        ? mobileScaleReportKeysStatic
        : templateType === 'operation'
          ? operationReportKeysStatic
          : templateType === 'envMeasurement'
            ? envMeasurementReportKeysStatic
            : templateType === 'wasteWater'
              ? wasteWaterReportKeysStatic
              : templateType === 'safetyInspection'
                ? safetyInspectionReportKeysStatic
                : samplingKeys
  const isLoading = templateType === 'sampling2' && loadingSampling
  const fieldsByTitle = groupByTitle(activeKeys)

  const handleTypeChange = (type: TemplateType) => {
    setTemplateType(type)
  }

  return (
    <aside className="panel left-panel data-sidebar">
      {/* Template type toggle */}
      <section className="sidebar-section">
        <p className="panel-hint">템플릿 종류</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <button
            type="button"
            className={`btn small ${templateType === 'sampling2' ? 'primary' : ''}`}
            onClick={() => handleTypeChange('sampling2')}
          >
            Sampling
          </button>
          <button
            type="button"
            className={`btn small ${templateType === 'thc' ? 'primary' : ''}`}
            onClick={() => handleTypeChange('thc')}
          >
            THC
          </button>
          <button
            type="button"
            className={`btn small ${templateType === 'mobileScale' ? 'primary' : ''}`}
            onClick={() => handleTypeChange('mobileScale')}
          >
            Mobile-Scale
          </button>
          <button
            type="button"
            className={`btn small ${templateType === 'operation' ? 'primary' : ''}`}
            onClick={() => handleTypeChange('operation')}
          >
            Operation
          </button>
          <button
            type="button"
            className={`btn small ${templateType === 'envMeasurement' ? 'primary' : ''}`}
            onClick={() => handleTypeChange('envMeasurement')}
          >
            Env-Measurement
          </button>
          <button
            type="button"
            className={`btn small ${templateType === 'wasteWater' ? 'primary' : ''}`}
            onClick={() => handleTypeChange('wasteWater')}
          >
            Waste-Water
          </button>
          <button
            type="button"
            className={`btn small ${templateType === 'safetyInspection' ? 'primary' : ''}`}
            onClick={() => handleTypeChange('safetyInspection')}
          >
            Safety-Inspection
          </button>
        </div>
      </section>
{/* 
      <section className="sidebar-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <p className="panel-hint" style={{ margin: 0 }}>데이터 키</p>
          <button type="button" className="btn small" onClick={addLoopGroup} title="Yangi qo'shish">+ qo'sh</button>
        </div>
        {loopGroups.map((g) => {
          const keys = getGroupKeys(g)
          return (
            <div key={g.id} style={{ border: '1px solid #333', borderRadius: 4, padding: 6, marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
                {loopGroups.length > 1 && (
                  <button type="button" className="btn small" style={{ color: '#f66' }} onClick={() => removeLoopGroup(g.id)}>✕</button>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: 11 }}>
                  <span>prefiks (ixtiyoriy)</span>
                  <input className="panel-input" placeholder="예: thc" value={g.prefix} onChange={(e) => updateLoopGroup(g.id, 'prefix', e.target.value)} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: 11 }}>
                  <span>dbName</span>
                  <input className="panel-input" placeholder="예: eqRegObjId" value={g.dbName} onChange={(e) => updateLoopGroup(g.id, 'dbName', e.target.value)} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: 11 }}>
                  <span>nechta (son)</span>
                  <input className="panel-input" type="number" min={1} max={200} placeholder="예: 20" value={g.count} onChange={(e) => updateLoopGroup(g.id, 'count', e.target.value)} />
                </label>
              </div>
              {keys.length > 0 && (
                <>
                  <button
                    type="button"
                    className="btn small primary"
                    style={{ width: '100%', margin: '6px 0' }}
                    onClick={() => {
                      const store = useEditorStore.getState()
                      const ROW_H = 8
                      const START_X = 5
                      const START_Y = 5
                      const W = 50
                      keys.forEach((key, i) => {
                        store.addElement('text', START_X, START_Y + i * ROW_H, key, { w: W, h: ROW_H }, key)
                      })
                    }}
                  >
                    Canvasga qo'sh ({keys.length} ta)
                  </button>
                  <ul className="data-list">
                    {keys.map((key) => (
                      <li
                        key={key}
                        className="data-row data-row-draggable"
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('application/json', JSON.stringify({ label: key, value: '', text: key, dataKey: key }))
                          e.dataTransfer.effectAllowed = 'copy'
                          setDraggingFromSidebar()
                        }}
                        onDragEnd={() => setNotDraggingFromSidebar()}
                      >
                        <span className="data-label" title={key}>{key}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )
        })}
      </section> */}

      <section className="sidebar-section">
        <p className="panel-hint">
          {templateType === 'thc' ? 'THC 정의' : templateType === 'mobileScale' ? '이동식 저울 정의' : templateType === 'operation' ? '운행일지 정의' : templateType === 'envMeasurement' ? '환경측정 정의' : templateType === 'wasteWater' ? '폐수 정의' : templateType === 'safetyInspection' ? '안전점검 정의' : '샘플링 정의'}
        </p>
        {isLoading && <p className="panel-hint">로딩 중…✅</p>}
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
        <h3>요소</h3>
        <p className="panel-hint">페이지에 추가하세요. 먼저 프레임을 넣고, 그다음 그 안에 요소를 넣으세요.</p>
        <ul className="element-list">
          <li>
            <button
              type="button"
              className="element-btn element-btn-ramka"
              onClick={() => useEditorStore.getState().addFrame()}
              title="프레임 – 요소들이 이 안에 유지됩니다"
            >
              <span className="element-icon">▣</span>
              <span>윤곽선</span>
            </button>
          </li>
          {ELEMENTS.map(({ type, label, icon }) => (
            <li key={type}>
              <ElementBtn type={type} label={label} icon={icon} />
            </li>
          ))}
          {templateType === 'sampling2' && (
            <>
              <li>
                <button
                  type="button"
                  className="element-btn"
                  onClick={() => useEditorStore.getState().addElement('image', undefined, undefined, undefined, { w: 20, h: 10 }, '__sign1Img__')}
                  title="PDF da meaSignature1 (o'lcham 20×10 mm)"
                >
                  <span className="element-icon">✍</span>
                  <span>서명 1</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  style={{ background: 'none' }}
                  className="element-btn"
                  onClick={() => useEditorStore.getState().addElement('image', undefined, undefined, undefined, { w: 20, h: 10 }, '__sign2Img__')}
                  title="PDF da meaSignature2 (o'lcham 20×10 mm)"
                >
                  <span className="element-icon">✍</span>
                  <span>서명 2</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="element-btn"
                  onClick={() => useEditorStore.getState().addElement('image', undefined, undefined, undefined, { w: 28, h: 25 }, '__shapeImage__')}
                  title="PDF da shapeImage (o'lchamni boshqarish mumkin)"
                >
                  <span className="element-icon">▢</span>
                  <span>도형</span>
                </button>
              </li>
            </>
          )}
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
