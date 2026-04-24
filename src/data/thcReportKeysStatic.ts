import type { SamplingDefineItem } from '../api/samplingDefine'

export const thcReportKeysStatic: SamplingDefineItem[] = [
  { dataKey: 'reportDate',          title: '페이지',  label: '작성일자' },
  { dataKey: 'reportAuthor',        title: '페이지',  label: '작성자' },
  { dataKey: 'eqRegObjId',          title: 'THC 행', label: '관리번호' },
  { dataKey: 'calibrationDate',     title: 'THC 행', label: '교정일자' },
  { dataKey: 'calibrationTime',     title: 'THC 행', label: '교정시간' },
  { dataKey: 'stdGasPpm',           title: 'THC 행', label: '표준가스 농도 (ppm)' },
  { dataKey: 'postCalibrationPpm',  title: 'THC 행', label: '교정 후 농도 (ppm)' },
  { dataKey: 'stdGasExpiryDate',    title: 'THC 행', label: '표준가스 유효일' },
  { dataKey: 'calibratorObjId',     title: 'THC 행', label: '교정자' },
]
