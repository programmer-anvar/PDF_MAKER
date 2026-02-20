/** Sidebar da ko‘rsatiladigan mock ma’lumotlar (PDF dagi barcha ma’lumotlar) */
export interface DataSection {
  title: string
  items: { label: string; value: string }[]
}

/** Sampling da ishlatish uchun: label → value map (dataKey = label) */
export function getMockDataAsRecord(): Record<string, string> {
  const out: Record<string, string> = {}
  mockSidebarData.forEach((section) => {
    section.items.forEach((item) => {
      out[item.label] = item.value
    })
  })
  return out
}

export const mockSidebarData: DataSection[] = [
  {
    title: 'Korxona',
    items: [
      { label: 'Nomi', value: '대신금속(주)마산4공장' },
      { label: 'Manzil', value: '경남 창원시 마산회원구 자유무역3길 96' },
      { label: 'Ob’ekt', value: '방지시설 28, 29, 30(7) 여과집진시설 50 m³/min' },
      { label: 'Mahsulot', value: '알루미늄 주물 주조업' },
      { label: 'Turi', value: '시설종별 5종 / 사업장종별 3종' },
    ],
  },
  {
    title: 'Shaxslar',
    items: [
      { label: 'Rahbar', value: '박준모' },
      { label: 'Muhandis', value: '백근령' },
      { label: 'Maqsad', value: '자가측정(시설관리)' },
    ],
  },
  {
    title: 'O‘lchov',
    items: [
      { label: 'Elementlar', value: '먼지' },
      { label: 'Sana', value: '2026-02-12' },
      { label: 'Nuqta', value: '1 지점' },
      { label: 'Vaqt', value: '09:09 ~ 09:09' },
      { label: 'Harorat', value: '˚C' },
      { label: 'Namlik', value: '%' },
      { label: 'Bosim', value: 'mmHg' },
    ],
  },
  {
    title: 'Stack / Gaz',
    items: [
      { label: 'Gaz metr boshi', value: 'm³' },
      { label: 'Gaz metr oxiri', value: 'm³' },
      { label: 'Temp', value: '˚C' },
      { label: 'Diametr (m)', value: '0.300' },
      { label: 'Kesim (m²)', value: '0.071' },
    ],
  },
  {
    title: 'Jadval',
    items: [
      { label: 'Ustun 1', value: 'Ustun 2' },
      { label: 'Ustun 3', value: '' },
      { label: 'A', value: 'B' },
      { label: 'C', value: 'D' },
    ],
  },
]
