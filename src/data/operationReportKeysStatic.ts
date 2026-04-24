import type { SamplingDefineItem } from '../api/samplingDefine'

export const operationReportKeysStatic: SamplingDefineItem[] = [
  { dataKey: 'carObjId',       title: '페이지', label: '차량번호' },
  { dataKey: 'operationDate',  title: '페이지', label: '사용일자' },
  { dataKey: 'authorObjId',    title: '페이지', label: '작성자' },
  { dataKey: 'meaField',       title: '페이지', label: '구분' },
  { dataKey: 'note',           title: '페이지', label: '특이사항' },
  { dataKey: 'departureTime',  title: '운행 행', label: '출발시간' },
  { dataKey: 'arrivalTime',    title: '운행 행', label: '도착시간' },
  { dataKey: 'odometerBefore', title: '운행 행', label: '출발 시 누적' },
  { dataKey: 'odometerAfter',  title: '운행 행', label: '도착 시 누적' },
  { dataKey: 'drivenDistance', title: '운행 행', label: '주행 거리' },
  { dataKey: 'purpose',        title: '운행 행', label: '사용목적' },
  { dataKey: 'departure',      title: '운행 행', label: '출발지' },
  { dataKey: 'destination',    title: '운행 행', label: '도착지' },
  { dataKey: 'drivingTime',    title: '운행 행', label: '운행시간' },
]
