import type { SamplingDefineItem } from '../api/samplingDefine'

export const envMeasurementReportKeysStatic: SamplingDefineItem[] = [
  { dataKey: 'receiptDate', title: '페이지', label: '작성일자' },
  { dataKey: 'userName',    title: '페이지', label: '담당자' },
  { dataKey: 'taskName',    title: '페이지', label: '업무' },
  { dataKey: 'zone',           title: '측정 행', label: '구역' },
  { dataKey: 'name',           title: '측정 행', label: '구역명' },
  { dataKey: 'temperatureStd', title: '측정 행', label: '기준온도' },
  { dataKey: 'humidityStd',    title: '측정 행', label: '기준습도' },
  { dataKey: 'temperature',    title: '측정 행', label: '온도' },
  { dataKey: 'humidity',       title: '측정 행', label: '습도' },
  { dataKey: 'createdAt',      title: '측정 행', label: '작성일시' },
]
