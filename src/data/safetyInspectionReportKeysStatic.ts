import type { SamplingDefineItem } from '../api/samplingDefine'

export const safetyInspectionReportKeysStatic: SamplingDefineItem[] = [
  { dataKey: 'zoneName',     title: '페이지', label: '구역' },
  { dataKey: 'userName',     title: '페이지', label: '담당자' },
  { dataKey: 'receiptDate',  title: '페이지', label: '작성일자' },
  { dataKey: 'type',         title: '점검 행', label: '점검구분' },
  { dataKey: 'item',         title: '점검 행', label: '점검항목' },
  { dataKey: 'result',       title: '점검 행', label: '점검결과' },
  { dataKey: 'createdBy',    title: '점검 행', label: '작성자' },
  { dataKey: 'createdAt',    title: '점검 행', label: '작성일시' },
]
