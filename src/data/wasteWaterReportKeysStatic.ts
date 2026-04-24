import type { SamplingDefineItem } from '../api/samplingDefine'

export const wasteWaterReportKeysStatic: SamplingDefineItem[] = [
  { dataKey: 'receiptDate',      title: '폐수 행', label: '작성일자' },
  { dataKey: 'generationVolume', title: '폐수 행', label: '발생량' },
  { dataKey: 'storageVolume',    title: '폐수 행', label: '보관량' },
  { dataKey: 'outsourcedVolume', title: '폐수 행', label: '위탁처리량' },
]
