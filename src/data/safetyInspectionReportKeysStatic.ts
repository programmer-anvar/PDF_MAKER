import type { SamplingDefineItem } from '../api/samplingDefine'

export const safetyInspectionReportKeysStatic: SamplingDefineItem[] = [
  { dataKey: 'zoneName',    title: '페이지',         label: '구역' },
  { dataKey: 'userName',    title: '페이지',         label: '담당자' },
  { dataKey: 'receiptDate', title: '페이지',         label: '작성일자' },

  { dataKey: 'type1',       title: '구분 (정적)',    label: '점검구분 1 (잠금상태)' },
  { dataKey: 'item1',       title: 'Y행 루프',       label: '점검항목 1' },
  { dataKey: 'result1',     title: 'Y+X 셀',         label: '점검결과 1' },

  { dataKey: 'type2',       title: '구분 (정적)',    label: '점검구분 2 (전원상태)' },
  { dataKey: 'item2',       title: 'Y행 루프',       label: '점검항목 2' },
  { dataKey: 'result2',     title: 'Y+X 셀',         label: '점검결과 2' },

  { dataKey: 'type3',       title: '구분 (정적)',    label: '점검구분 3 (정리)' },
  { dataKey: 'item3',       title: 'Y행 루프',       label: '점검항목 3' },
  { dataKey: 'result3',     title: 'Y+X 셀',         label: '점검결과 3' },

  { dataKey: 'type4',       title: '구분 (정적)',    label: '점검구분 4 (소화기)' },
  { dataKey: 'item4',       title: 'Y행 루프',       label: '점검항목 4' },
  { dataKey: 'result4',     title: 'Y+X 셀',         label: '점검결과 4' },

  { dataKey: 'createdBy',   title: 'X열 (하단)',     label: '확인자' },
  { dataKey: 'createdAt',   title: 'X열 (하단)',     label: '확인시간' },
]
