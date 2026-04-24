import type { SamplingDefineItem } from '../api/samplingDefine'

export const mobileScaleReportKeysStatic: SamplingDefineItem[] = [
  { dataKey: 'receiptDay',                  title: '페이지',       label: '작성일자' },
  { dataKey: 'author',                      title: '페이지',       label: '작성자' },
  { dataKey: 'equipmentRegistrationNumber', title: '페이지',       label: '관리번호' },
  { dataKey: 'meaDay',                      title: '이동식 저울 열', label: '날짜' },
  { dataKey: 'companyName',                 title: '이동식 저울 열', label: '업체명' },
  { dataKey: 'facilityNumber',              title: '이동식 저울 열', label: '시설번호' },
  { dataKey: 'testReferenceValue',          title: '이동식 저울 열', label: '기준치' },
  { dataKey: 'testMeaValue',                title: '이동식 저울 열', label: '측정치' },
  { dataKey: 'testErrorValue',              title: '이동식 저울 열', label: '오차' },
]
