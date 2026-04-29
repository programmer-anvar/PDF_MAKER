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
// safetyInspection: resultN and dailyResults loop X; typeN/itemN/type/item are static
const SI_RESULT_RE = /^result\d+$/
const SI_X_KEYS = new Set(['createdBy', 'createdAt', 'name', 'time'])
const SI_DAILY_RESULTS_KEY = 'dailyResults'

function isLoopElement(el: EditorElement, type: TemplateType): boolean {
  if (type === 'thc') return !!(el.thcKey || (el.dataKey && THC_ROW_FIELDS.includes(el.dataKey)))
  if (type === 'mobileScale') return !!(el.mobileScaleKey || (el.dataKey && MOBILE_SCALE_ROW_FIELDS.includes(el.dataKey)))
  if (type === 'operation') return !!(el.operationKey || (el.dataKey && OPERATION_ROW_FIELDS.includes(el.dataKey)))
  if (type === 'envMeasurement') return !!(el.envMeasurementKey || (el.dataKey && ENV_MEASUREMENT_ROW_FIELDS.includes(el.dataKey)))
  if (type === 'wasteWater') return !!(el.wasteWaterKey || (el.dataKey && WASTE_WATER_ROW_FIELDS.includes(el.dataKey)))
  if (type === 'safetyInspection') {
    const k = el.safetyInspectionKey || el.dataKey || ''
    return SI_RESULT_RE.test(k) || SI_X_KEYS.has(k) || k === SI_DAILY_RESULTS_KEY
  }
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
  if (type === 'wasteWater') return el.wasteWaterRowCount ?? 45
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

  // --- safetyInspection: full X+Y expansion for alias and numbered keys ---
  if (templateType === 'safetyInspection') {
    const getKey = (el: EditorElement) => el.safetyInspectionKey || el.dataKey || ''
    const SI_NUMBERED_ITEM_RE = /^item\d+$/
    const SI_NUMBERED_TYPE_RE = /^type\d+$/
    const PREVIEW_GROUPS = 3

    // Row height and minRows from item or dailyResults element
    const refEl =
      elements.find(el => getKey(el) === 'item') ??
      elements.find(el => getKey(el) === SI_DAILY_RESULTS_KEY) ??
      elements.find(el => SI_NUMBERED_ITEM_RE.test(getKey(el))) ??
      elements.find(el => SI_RESULT_RE.test(getKey(el))) ??
      null
    const rowH = refEl?.h ?? 6
    const minRows = refEl?.safetyInspectionRowCount ?? 5

    // baseX / colW / colCount from the first result-type element
    let baseX: number | null = null
    let colW = 8
    let colCount = previewCount
    for (const el of elements) {
      const k = getKey(el)
      if (SI_RESULT_RE.test(k) || k === SI_DAILY_RESULTS_KEY) {
        baseX = el.x
        colW = getColWidth(el)
        colCount = getColCount(el, previewCount)
        break
      }
    }
    if (baseX === null) {
      for (const el of elements) {
        if (SI_X_KEYS.has(getKey(el))) { baseX = el.x; break }
      }
    }

    for (const el of elements) {
      const k = getKey(el)
      const isXKey = SI_X_KEYS.has(k)
      const isDataKey = SI_RESULT_RE.test(k) || k === SI_DAILY_RESULTS_KEY ||
        SI_NUMBERED_ITEM_RE.test(k) || SI_NUMBERED_TYPE_RE.test(k) || k === 'type' || k === 'item'
      const isCompanion = !isDataKey && !isXKey && baseX !== null && el.x === baseX

      // Alias 'type' → ghost cells for groups 2..PREVIEW_GROUPS, each spanning minRows rows
      if (k === 'type') {
        const groupH = minRows * rowH
        for (let g = 1; g < PREVIEW_GROUPS; g++) {
          ghosts.push({ ...el, id: `${el.id}-ghost-tg${g}`, _ghostRow: g, _sourceId: el.id,
            y: el.y + g * groupH, content: '-' })
        }
        continue
      }

      // Alias 'item' → PREVIEW_GROUPS × minRows rows total
      if (k === 'item') {
        const total = PREVIEW_GROUPS * minRows
        for (let i = 1; i < total; i++) {
          ghosts.push({ ...el, id: `${el.id}-ghost-iy${i}`, _ghostRow: i, _sourceId: el.id,
            y: el.y + i * rowH, content: '-' })
        }
        continue
      }

      // Alias 'dailyResults' → PREVIEW_GROUPS × minRows rows × colCount cols
      if (k === SI_DAILY_RESULTS_KEY) {
        const rColW = getColWidth(el)
        const rCount = getColCount(el, previewCount)
        const total = PREVIEW_GROUPS * minRows
        for (let rowIdx = 0; rowIdx < total; rowIdx++) {
          for (let j = rowIdx === 0 ? 1 : 0; j < rCount; j++) {
            ghosts.push({ ...el, id: `${el.id}-ghost-dr${rowIdx}-x${j}`, _ghostRow: rowIdx * rCount + j,
              _sourceId: el.id, y: el.y + rowIdx * rowH, x: el.x + j * rColW, content: '-' })
          }
        }
        continue
      }

      // Numbered resultN → minRows rows × colCount cols
      if (SI_RESULT_RE.test(k)) {
        const rColW = getColWidth(el)
        const rCount = getColCount(el, previewCount)
        for (let rowIdx = 0; rowIdx < minRows; rowIdx++) {
          for (let j = rowIdx === 0 ? 1 : 0; j < rCount; j++) {
            ghosts.push({ ...el, id: `${el.id}-ghost-nr${rowIdx}-x${j}`, _ghostRow: rowIdx * rCount + j,
              _sourceId: el.id, y: el.y + rowIdx * rowH, x: el.x + j * rColW, content: '-' })
          }
        }
        continue
      }

      // Numbered itemN → minRows rows (Y-loop only)
      if (SI_NUMBERED_ITEM_RE.test(k)) {
        for (let i = 1; i < minRows; i++) {
          ghosts.push({ ...el, id: `${el.id}-ghost-ni${i}`, _ghostRow: i, _sourceId: el.id,
            y: el.y + i * rowH, content: '-' })
        }
        continue
      }

      // Numbered typeN → static (user positioned in template, no ghosts)
      if (SI_NUMBERED_TYPE_RE.test(k)) continue

      // createdBy / createdAt — X-loop regardless of X position
      if (isXKey && baseX !== null) {
        for (let i = 1; i < colCount; i++) {
          ghosts.push({ ...el, id: `${el.id}-ghost-x${i}`, _ghostRow: i, _sourceId: el.id,
            x: el.x + i * colW, content: el.content ?? '' })
        }
      }
      // companion column headers — X-loop only from baseX
      if (isCompanion && baseX !== null && el.x <= baseX) {
        const baseNum = parseBaseNumber(el.content)
        for (let i = 1; i < colCount; i++) {
          ghosts.push({ ...el, id: `${el.id}-ghost-x${i}`, _ghostRow: i, _sourceId: el.id,
            x: el.x + i * colW, content: baseNum !== null ? String(baseNum + i) : (el.content ?? '') })
        }
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
