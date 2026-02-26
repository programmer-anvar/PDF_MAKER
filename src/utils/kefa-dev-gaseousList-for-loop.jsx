/**
 * kefa-dev-front SamplingReport da: data.gaseousList ni for orqali chiqarish.
 * generateAllRows o'rniga shu funksiyani ishlating.
 */

const KEYS = ['pollutantName', 'gasVolumeStart', 'gasVolumeEnd', 'collectionTime', 'gasMeterTemp', 'gaugePressureHg', 'gasVolumeResult'];
const startX = 155;
const startY1 = 0;
const startY2 = 95;

export function getGaseousRows(gaseousList = []) {
  const rows = [];
  for (let i = 0; i < gaseousList.length; i++) {
    const item = gaseousList[i] || {};
    const isSecondBlock = i >= 15;
    const x = startX + (isSecondBlock ? i - 15 : i) * 6;
    const baseY = isSecondBlock ? startY2 : startY1;
    rows.push(
      { text: item.pollutantName ?? '', position: { x, y: baseY + 0, w: 20, h: 6 } },
      { text: item.gasVolumeStart ?? '', position: { x, y: baseY + 20, w: 15, h: 3 } },
      { text: item.gasVolumeEnd ?? '', position: { x: x + 3, y: baseY + 20, w: 15, h: 3 } },
      { text: item.collectionTime ?? '', position: { x, y: baseY + 35, w: 15, h: 6 } },
      { text: item.gasMeterTemp ?? '', position: { x, y: baseY + 50, w: 15, h: 6 } },
      { text: item.gaugePressureHg ?? '', position: { x, y: baseY + 65, w: 15, h: 6 } },
      { text: item.gasVolumeResult ?? '', position: { x, y: baseY + 80, w: 15, h: 6 } }
    );
  }
  return rows.flat();
}

// SamplingReport.jsx da:
// import { getGaseousRows } from '@/utils/kefa-dev-gaseousList-for-loop';  // yoki to'g'ri path
// const allRows = getGaseousRows(data.gaseousList);
// {allRows.map((field, index) => <TextViewField key={index} {...field} />)}
