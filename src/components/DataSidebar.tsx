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
  { type: 'text', label: 'Text', icon: 'T' },
  { type: 'textTemplate', label: 'Text + Key (Text${key})', icon: 'T$' },
  { type: 'parentheses', label: 'Parentheses (…)', icon: '( )' },
  { type: 'textSplit', label: 'Split Text', icon: '|T' },
  { type: 'fraction', label: 'Fraction', icon: 'a/b' },
  { type: 'script', label: 'Script (P_a)', icon: 'Pₐ' },
  { type: 'rect', label: 'Rectangle', icon: '▢' },
  { type: 'line', label: 'Line', icon: '—' },
]

function groupByTitle(items: SamplingDefineItem[]): Record<string, SamplingDefineItem[]> {
  return items.reduce<Record<string, SamplingDefineItem[]>>((acc, f) => {
    if (!acc[f.title]) acc[f.title] = []
    acc[f.title].push(f)
    return acc
  }, {})
}

const DEFINITION_LABELS: Record<string, string> = {
  thc: 'THC Keys',
  mobileScale: 'Mobile Scale Keys',
  operation: 'Operation Keys',
  envMeasurement: 'Env Measurement Keys',
  wasteWater: 'Waste Water Keys',
  safetyInspection: 'Safety Inspection Keys',
  sampling2: 'Sampling Keys',
}

export function DataSidebar() {
  const templateType = useEditorStore((s) => s.templateType)
  const setTemplateType = useEditorStore((s) => s.setTemplateType)

  const [samplingKeys, setSamplingKeys] = useState<SamplingDefineItem[]>(() => samplingReportKeysStatic)
  const [loadingSampling, setLoadingSampling] = useState(true)

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
      <section className="sidebar-section">
        <p className="panel-hint">Template type</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(['sampling2', 'thc', 'mobileScale', 'operation', 'envMeasurement', 'wasteWater', 'safetyInspection'] as TemplateType[]).map((type) => (
            <button
              key={type}
              type="button"
              className={`btn small ${templateType === type ? 'primary' : ''}`}
              onClick={() => handleTypeChange(type)}
            >
              {type === 'sampling2' ? 'Sampling' : type === 'mobileScale' ? 'Mobile Scale' : type === 'envMeasurement' ? 'Env Measurement' : type === 'wasteWater' ? 'Waste Water' : type === 'safetyInspection' ? 'Safety Inspection' : type.toUpperCase()}
            </button>
          ))}
        </div>
      </section>

      <section className="sidebar-section">
        <p className="panel-hint">{DEFINITION_LABELS[templateType] ?? 'Keys'}</p>
        {isLoading && <p className="panel-hint">Loading…</p>}
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
        <h3>Elements</h3>
        <p className="panel-hint">Add a frame first, then place elements inside.</p>
        <ul className="element-list">
          <li>
            <button
              type="button"
              className="element-btn element-btn-ramka"
              onClick={() => useEditorStore.getState().addFrame()}
              title="Frame – all elements must be placed inside"
            >
              <span className="element-icon">▣</span>
              <span>Frame</span>
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
                  title="meaSignature1 (20×10 mm)"
                >
                  <span className="element-icon">✍</span>
                  <span>Sign 1</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  style={{ background: 'none' }}
                  className="element-btn"
                  onClick={() => useEditorStore.getState().addElement('image', undefined, undefined, undefined, { w: 20, h: 10 }, '__sign2Img__')}
                  title="meaSignature2 (20×10 mm)"
                >
                  <span className="element-icon">✍</span>
                  <span>Sign 2</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="element-btn"
                  onClick={() => useEditorStore.getState().addElement('image', undefined, undefined, undefined, { w: 28, h: 25 }, '__shapeImage__')}
                  title="shapeImage (resizable)"
                >
                  <span className="element-icon">▢</span>
                  <span>Shape</span>
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
