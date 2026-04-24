import type { EditorElement } from '../types/editor'
import type { TemplateType } from '../api/server'

const THC_ROW_FIELDS = [
  'eqRegObjId', 'calibrationDate', 'calibrationTime',
  'stdGasPpm', 'postCalibrationPpm', 'stdGasExpiryDate', 'calibratorObjId',
]
const MOBILE_SCALE_ROW_FIELDS = [
  'companyName', 'facilityNumber', 'testReferenceValue',
  'testMeaValue', 'testErrorValue', 'meaDay',
]
const OPERATION_ROW_FIELDS = [
  'departureTime', 'arrivalTime', 'odometerBefore', 'odometerAfter',
  'drivenDistance', 'purpose', 'departure', 'destination', 'drivingTime', 'calculateTime',
]
const ENV_MEASUREMENT_ROW_FIELDS = [
  'zone', 'name', 'temperatureStd', 'humidityStd', 'temperature', 'humidity', 'createdAt',
]
const WASTE_WATER_ROW_FIELDS = [
  'receiptDate', 'generationVolume', 'storageVolume', 'outsourcedVolume',
]
const SAFETY_INSPECTION_ROW_FIELDS = [
  'type', 'item', 'result', 'createdBy', 'createdAt',
]

function isLoopElement(el: EditorElement, type: TemplateType): boolean {
  if (type === 'thc') return !!(el.thcKey || (el.dataKey && THC_ROW_FIELDS.includes(el.dataKey)))
  if (type === 'mobileScale') return !!(el.mobileScaleKey || (el.dataKey && MOBILE_SCALE_ROW_FIELDS.includes(el.dataKey)))
  if (type === 'operation') return !!(el.operationKey || (el.dataKey && OPERATION_ROW_FIELDS.includes(el.dataKey)))
  if (type === 'envMeasurement') return !!(el.envMeasurementKey || (el.dataKey && ENV_MEASUREMENT_ROW_FIELDS.includes(el.dataKey)))
  if (type === 'wasteWater') return !!(el.wasteWaterKey || (el.dataKey && WASTE_WATER_ROW_FIELDS.includes(el.dataKey)))
  if (type === 'safetyInspection') return !!(el.safetyInspectionKey || (el.dataKey && SAFETY_INSPECTION_ROW_FIELDS.includes(el.dataKey)))
  return false
}

// For Y-axis types: returns row height in mm
function getRowHeight(el: EditorElement, type: TemplateType): number {
  if (type === 'thc') return el.thcRowHeight ?? el.h ?? 8
  if (type === 'mobileScale') return el.mobileScaleRowHeight ?? el.h ?? 8
  if (type === 'operation') return el.operationRowHeight ?? el.h ?? 8
  if (type === 'envMeasurement') return el.envMeasurementRowHeight ?? el.h ?? 8
  if (type === 'wasteWater') return el.wasteWaterRowHeight ?? el.h ?? 8
  return el.h ?? 8
}

// For Y-axis types: returns row count per page
function getRowCount(el: EditorElement, type: TemplateType): number {
  if (type === 'thc') return el.thcRowCount ?? 20
  if (type === 'mobileScale') return el.mobileScaleRowCount ?? 20
  if (type === 'operation') return el.operationRowCount ?? 11
  if (type === 'envMeasurement') return el.envMeasurementRowCount ?? 31
  if (type === 'wasteWater') return el.wasteWaterRowCount ?? 50
  return 20
}

// For X-axis types (safetyInspection): returns column width in mm
function getColWidth(el: EditorElement): number {
  return el.safetyInspectionColWidth ?? el.w ?? 20
}

// For X-axis types (safetyInspection): returns column count per page
function getColCount(el: EditorElement, previewCount: number): number {
  return Math.min(previewCount, el.safetyInspectionColCount ?? 31)
}

function parseBaseNumber(content: string | undefined): number | null {
  if (!content) return null
  const trimmed = content.trim()
  if (!/^\d+$/.test(trimmed)) return null
  const n = parseInt(trimmed, 10)
  return n > 0 ? n : null
}

export function getGhostRows(
  elements: EditorElement[],
  templateType: TemplateType,
  previewCount = 20,
): Array<EditorElement & { _ghostRow: number; _sourceId: string }> {
  const ghosts: Array<EditorElement & { _ghostRow: number; _sourceId: string }> = []

  // --- X-axis expansion (safetyInspection) ---
  if (templateType === 'safetyInspection') {
    let baseX: number | null = null
    let colW = 20
    let loopColCount = previewCount
    for (const el of elements) {
      if (!isLoopElement(el, templateType)) continue
      if (baseX === null) baseX = el.x
      colW = getColWidth(el)
      loopColCount = getColCount(el, previewCount)
      break
    }

    for (const el of elements) {
      const isLoop = isLoopElement(el, templateType)

      if (!isLoop) {
        // Companion: non-loop element at same X as first column
        if (baseX !== null && el.x === baseX) {
          const baseNum = parseBaseNumber(el.content)
          for (let i = 1; i < loopColCount; i++) {
            ghosts.push({
              ...el,
              id: `${el.id}-ghost-${i}`,
              _ghostRow: i,
              _sourceId: el.id,
              x: el.x + i * colW,
              content: baseNum !== null ? String(baseNum + i) : (el.content ?? ''),
            })
          }
        }
        continue
      }

      // Only generate ghost cols for elements in the first column band
      if (baseX !== null && el.x >= baseX + colW) continue

      const w = getColWidth(el)
      const count = getColCount(el, previewCount)
      const baseNum = parseBaseNumber(el.content)
      for (let i = 1; i < count; i++) {
        ghosts.push({
          ...el,
          id: `${el.id}-ghost-${i}`,
          _ghostRow: i,
          _sourceId: el.id,
          x: el.x + i * w,
          content: baseNum !== null ? String(baseNum + i) : '',
        })
      }
    }
    return ghosts
  }

  // --- Y-axis expansion (all other types) ---
  let baseY: number | null = null
  let rowH = 8
  let loopRowCount = previewCount
  for (const el of elements) {
    if (!isLoopElement(el, templateType)) continue
    if (baseY === null) baseY = el.y
    rowH = getRowHeight(el, templateType)
    loopRowCount = Math.min(previewCount, getRowCount(el, templateType))
    break
  }

  for (const el of elements) {
    const isLoop = isLoopElement(el, templateType)

    if (!isLoop) {
      if (baseY !== null && el.y === baseY) {
        const baseNum = parseBaseNumber(el.content)
        for (let i = 1; i < loopRowCount; i++) {
          ghosts.push({
            ...el,
            id: `${el.id}-ghost-${i}`,
            _ghostRow: i,
            _sourceId: el.id,
            y: el.y + i * rowH,
            content: baseNum !== null ? String(baseNum + i) : (el.content ?? ''),
          })
        }
      }
      continue
    }

    if (baseY !== null && el.y >= baseY + rowH) continue

    const h = getRowHeight(el, templateType)
    const count = Math.min(previewCount, getRowCount(el, templateType))
    const baseNum = parseBaseNumber(el.content)
    for (let i = 1; i < count; i++) {
      ghosts.push({
        ...el,
        id: `${el.id}-ghost-${i}`,
        _ghostRow: i,
        _sourceId: el.id,
        y: el.y + i * h,
        content: baseNum !== null ? String(baseNum + i) : '',
      })
    }
  }
  return ghosts
}
