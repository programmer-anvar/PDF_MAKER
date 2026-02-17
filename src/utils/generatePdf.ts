import { jsPDF } from 'jspdf'
import type { SampleCollectionForm } from '../types/form'

const FONT_SIZE = 9
const LINE_HEIGHT = 5
const MARGIN = 14
const PAGE_W = 210
const PAGE_H = 297

function addText(doc: jsPDF, text: string, x: number, y: number, size = FONT_SIZE) {
  doc.setFontSize(size)
  doc.text(text, x, y)
}

export function generatePdf(data: SampleCollectionForm): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  let y = MARGIN

  doc.setFont('helvetica')
  doc.setFontSize(12)
  doc.text(data.title || '대기시료채취기록지', PAGE_W / 2, y, { align: 'center' })
  y += 8

  doc.setFontSize(FONT_SIZE)
  doc.text(`상호(업체명) ${data.companyName}`, MARGIN, y)
  y += LINE_HEIGHT
  doc.text(`소재지(주소) ${data.address}`, MARGIN, y)
  y += LINE_HEIGHT
  doc.text(`방지시설 ${data.facilities}`, MARGIN, y)
  y += LINE_HEIGHT
  doc.text(`주생산품 ${data.mainProduct}`, MARGIN, y)
  doc.text(`시설종별 ${data.facilityType}`, 110, y)
  doc.text(`사업장종별 ${data.siteType}`, 160, y)
  y += LINE_HEIGHT
  doc.text(`대표자 ${data.representative}`, MARGIN, y)
  doc.text(`환경기술인 ${data.envTechnician}`, 80, y)
  doc.text(`측정용도 ${data.measurementPurpose}`, 140, y)
  y += LINE_HEIGHT
  doc.text(`전체 측정 항목 ${data.measurementItems}`, MARGIN, y)
  y += 8

  // 1. 시료채취
  addText(doc, '1. 시료채취', MARGIN, y, 10)
  y += 6
  const row1 = ['날짜', '지점', '시간', '현장기상', '기온', '습도', '대기압', '풍향', '풍속']
  const vals1 = [
    data.sampleDate,
    data.samplePoint,
    data.sampleTime,
    data.weather,
    data.temperature + ' ˚C',
    data.humidity + ' %',
    data.pressure + ' mmHg',
    data.windDirection + ' 풍',
    data.windSpeed + ' m/s',
  ]
  let x = MARGIN
  row1.forEach((h, i) => {
    doc.text(h, x, y)
    doc.text(vals1[i] || '-', x, y + LINE_HEIGHT)
    x += i < 3 ? 22 : 18
  })
  y += LINE_HEIGHT + 6

  // 2. 연도
  addText(doc, '2. 연도', MARGIN, y, 10)
  y += 6
  doc.text('수분측정 가스미터 시작 m³', MARGIN, y)
  doc.text(data.gasMeterStart, 55, y)
  doc.text('수분측정 가스미터 끝 m³', 80, y)
  doc.text(data.gasMeterEnd, 130, y)
  y += LINE_HEIGHT
  doc.text('가스미터 온도 ˚C', MARGIN, y)
  doc.text(data.gasMeterTemp, 45, y)
  doc.text('가스미터 게이지압 mmHg', 60, y)
  doc.text(data.gasMeterGaugePressure, 105, y)
  y += LINE_HEIGHT
  doc.text('임핀저 무게 흡입전 g', MARGIN, y)
  doc.text(data.moistureImpingerBefore, 45, y)
  doc.text('흡입후 g', 65, y)
  doc.text(data.moistureImpingerAfter, 80, y)
  doc.text('무수염화칼슘소모량 g', 100, y)
  doc.text(data.moistureCalciumChloride, 145, y)
  y += LINE_HEIGHT
  doc.text('흡입한 건조가스량 L', MARGIN, y)
  doc.text(data.dryGasVolume, 45, y)
  doc.text('수분량 %', 75, y)
  doc.text(data.moisturePercent, 95, y)
  y += LINE_HEIGHT
  doc.text('방향', MARGIN, y)
  doc.text(data.direction, 25, y)
  doc.text('형태', 45, y)
  doc.text(data.shape, 60, y)
  doc.text('직경 (m)', 80, y)
  doc.text(data.diameter, 105, y)
  doc.text('단면적 (m²)', 120, y)
  doc.text(data.crossSectionArea, 155, y)
  doc.text('측정구로부터 (m)', 170, y)
  doc.text(data.distanceFromPoint1, 195, y)
  y += 8

  // 3. 입자상물질
  addText(doc, '3. 입자상물질 측정', MARGIN, y, 10)
  y += 6
  const headers = [
    '채취점',
    '시료채취시간(min)',
    '진공게이지압',
    '배출가스온도(℃)',
    '배출가스정압',
    '배출가스동압',
    '오리피스압차',
    '시료채취량(m³)',
    '가스미터온도(℃)',
    '여과지홀더온도(℃)',
    '임핀저출구온도(℃)',
  ]
  const colW = 16
  headers.forEach((h, i) => {
    doc.text(h, MARGIN + i * colW, y)
  })
  y += LINE_HEIGHT
  data.particulateRows?.slice(0, 5).forEach((row, idx) => {
    doc.text(String(idx + 1), MARGIN + 2, y)
    doc.text(row.sampleTimeMin, MARGIN + colW, y)
    doc.text(row.vacuumPressure, MARGIN + colW * 2, y)
    doc.text(row.gasTemp, MARGIN + colW * 3, y)
    doc.text(row.gasStaticPressure, MARGIN + colW * 4, y)
    doc.text(row.gasDynamicPressure, MARGIN + colW * 5, y)
    doc.text(row.orificePressure, MARGIN + colW * 6, y)
    doc.text(row.sampleVolume, MARGIN + colW * 7, y)
    doc.text(row.gasMeterTemp, MARGIN + colW * 8, y)
    doc.text(row.filterHolderTemp, MARGIN + colW * 9, y)
    doc.text(row.impingerOutTemp, MARGIN + colW * 10, y)
    y += LINE_HEIGHT
  })
  y += LINE_HEIGHT
  doc.text('합계', MARGIN, y)
  doc.text('0', MARGIN + colW * 7, y)
  y += 8

  // 4. 가스상물질 / 의견
  addText(doc, '4. 가스상물질 측정', MARGIN, y, 10)
  y += 6
  doc.text('측정장비 누출확인시험', MARGIN, y)
  doc.text(data.equipmentLeakTest, 55, y)
  y += LINE_HEIGHT
  doc.text('채취자 의견 :', MARGIN, y)
  doc.text(data.collectorOpinion, 35, y)
  y += 8

  // 5. 시료의 접수
  addText(doc, '5. 시료의 접수', MARGIN, y, 10)
  y += 6
  doc.text(
    '측정조건 및 측정항목, 시료의 상태 등을 확인하고, 분석용 시료로 접수합니다.',
    MARGIN,
    y
  )
  y += LINE_HEIGHT
  doc.text('년 월 일', MARGIN, y)
  doc.text(data.acceptanceDate, 25, y)
  doc.text('시료채취자 1', 50, y)
  doc.text(data.collector1Name, 75, y)
  doc.text('(서명)', 95, y)
  doc.text('시료채취자 2', 115, y)
  doc.text(data.collector2Name, 140, y)
  doc.text('(서명)', 160, y)
  doc.text('기술책임자', 175, y)
  doc.text(data.technicalManager, 195, y)
  doc.text('(서명)', 205, y)
  y += 6
  doc.setFontSize(8)
  doc.text('A4(210x297mm)', MARGIN, PAGE_H - 10)
  doc.text('접수번호 ' + (data.receptionNumber || ''), 100, PAGE_H - 10)

  doc.save(`채취정보_${data.sampleDate || 'record'}.pdf`)
}
