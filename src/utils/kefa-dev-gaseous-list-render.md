# kefa-dev-front: data.gaseousList ni loop qilib chiqarish (SamplingReport)

Backend layout ni xohlagan shaklda saqlaydi (`responseList[].pdf` → `layout[].elements`). **Faqat loop** kerak: elementda `gaseousKey` bo‘lsa, "Text" o‘rniga `data.gaseousList` ni for/map qilib har qator uchun `item[key]` chiqaring.

---

## Nega faqat "Text" chiqadi va nima qilish kerak

1. **Layout** backenddan keladi – elementlarda `gaseousKey` bor (masalan `pollutantName`, `gasVolumeStart,gasVolumeEnd`, `collectionTime`). Agar bunday elementni **bitta marta** render qilib `content` ("Text") ko‘rsatsangiz – faqat "Text" chiqadi.
2. **Qilish kerak:** `element.gaseousKey` bo‘lgan element uchun **content ni chiqarmang**. `data.gaseousList` ni **loop** qiling: har bir `list[i]` uchun `list[i][key]` ni `y = element.y + i * rowHeight` da chiqaring.
3. **data.gaseousList** bo‘lishi kerak. Agar backend faqat `valueList` (flat) bersa, avval normalizer bilan `gaseousList` yig‘ing.

### Layout dan render: gaseousKey bo‘lsa loop (pseudo-kod)

```js
const list = data.gaseousList || [];
const rowHeight = 6; 

layout.elements.forEach((el) => {
  if (!el.gaseousKey) {
    renderOnce(el, data[el.dataKey]);
    return;
  }
  const keys = el.gaseousKey.split(',').map((k) => k.trim());
  for (let i = 0; i < list.length; i++) {
    const item = list[i] || {};
    const y = el.y + i * (el.gaseousRowHeight ?? rowHeight);
    const text = keys.length === 1 ? (item[keys[0]] ?? '') : keys.map((k) => item[k] ?? '').join(' ');
    renderField({ text, position: { x: el.x, y, w: el.w, h: el.h }, border: true });
  }
});
```

---

## Kefa-dev ga ulash (2 qadam) – faqat "Text" chiqmasligi uchun

**1)** pdf-maker dan **`src/utils/kefa-dev-expandLayoutGaseous.js`** faylini kefa-dev loyihasiga nusxa qiling (masalan `src/utils/kefa-dev-expandLayoutGaseous.js`).

**2)** Layout ni render qiladigan joyda (masalan template pdf ko‘rsatiladigan komponentda) backend dan kelgan layout ni **to‘g‘ridan-to‘g‘ri** ishlatmaslik, avval expand qiling:

```js
import { expandLayoutWithGaseous } from '@/utils/kefa-dev-expandLayoutGaseous'; // path o‘zingizniki bo‘yicha

// Layout + sampling data bor joyda (masalan template tanlanganda yoki report ko‘rsatilganda):
const layoutFromBackend = template.pdf ? JSON.parse(template.pdf) : { layout: [] };
const data = { gaseousList: [...], companyName: '...', ... }; // valueList dan yoki API dan

const layoutToRender = expandLayoutWithGaseous(layoutFromBackend, data);

// Keyin layoutToRender ni render qiling (eski kodda layoutFromBackend ishlatilgan bo‘lsa, uni layoutToRender ga almashtiring)
// Masalan: layoutToRender.layout.forEach(page => page.elements.map(el => <TextViewField key={el.id} content={el.content} style={el.style} ... />))
```

**Muhim:** `data` da **gaseousList** massivi bo‘lishi shart. Agar backend faqat flat `valueList` bersa, avval `gaseousList` yig‘ing (pdf-maker dagi `pdfDataNormalizer.buildListFromFlatKeys` ga o‘xshash).

Shundan keyin `gaseousKey` li elementlar "Text" emas, balki har bir qator uchun `item.pollutantName`, `item.gasVolumeStart` va h.k. chiqadi va ramkali kataklar (border) ham qo‘llanadi.

---

## 0. Qisqa: for orqali chiqarish (SamplingReport ga qo‘yish)

SamplingReport ichida `generateAllRows` o‘rniga shunchaki **for** bilan:

```js
// data.gaseousList ni for orqali chiqarish
const list = data.gaseousList || [];
const allRows = [];
const startX = 155;
const startY1 = 0;
const startY2 = 95;

for (let i = 0; i < list.length; i++) {
  const item = list[i] || {};
  const isBlock2 = i >= 15;
  const x = startX + (isBlock2 ? i - 15 : i) * 6;
  const baseY = isBlock2 ? startY2 : startY1;
  allRows.push(
    { text: item.pollutantName ?? '', position: { x, y: baseY + 0, w: 20, h: 6 } },
    { text: item.gasVolumeStart ?? '', position: { x, y: baseY + 20, w: 15, h: 3 } },
    { text: item.gasVolumeEnd ?? '', position: { x: x + 3, y: baseY + 20, w: 15, h: 3 } },
    { text: item.collectionTime ?? '', position: { x, y: baseY + 35, w: 15, h: 6 } },
    { text: item.gasMeterTemp ?? '', position: { x, y: baseY + 50, w: 15, h: 6 } },
    { text: item.gaugePressureHg ?? '', position: { x, y: baseY + 65, w: 15, h: 6 } },
    { text: item.gasVolumeResult ?? '', position: { x, y: baseY + 80, w: 15, h: 6 } }
  );
}
// Render (o'zgarishsiz):
// {allRows.map((field, index) => <TextViewField key={index} {...field} />)}
```

Eski `generateAllRows` va `const allRows = generateAllRows(data.gaseousList)` o‘rniga yuqoridagi **for** blokni qo‘ying; pastdagi `allRows.map(...)` o‘zgarishsiz ishlaydi. Bir qatorni “template” qilib, har bir list element uchun **top** (y) ga **rowHeight** qo‘shib ketasiz.

---

## 1. Mavjud yondashuv (generateAllRows)

Hozirgi `SamplingReport` da:

```js
const generateAllRows = (gaseousDataList = []) => {
  const rows = [];
  const startX = 155;
  const startY1 = 0;   // birinchi blok
  const startY2 = 95;  // ikkinchi blok

  for (let index = 0; index < 30; index++) {
    let gaseousData = gaseousDataList[index] || {};
    if (index < 15) {
      const x = startX + index * 6;
      rows.push([
        { text: gaseousData.pollutantName,    position: { x, y: startY1 + 0,  w: 20, h: 6 } },
        { text: gaseousData.gasVolumeStart,   position: { x, y: startY1 + 20, w: 15, h: 3 } },
        { text: gaseousData.gasVolumeEnd,     position: { x: x + 3, y: startY1 + 20, w: 15, h: 3 } },
        { text: gaseousData.collectionTime,   position: { x, y: startY1 + 35, w: 15, h: 6 } },
        { text: gaseousData.gasMeterTemp,     position: { x, y: startY1 + 50, w: 15, h: 6 } },
        { text: gaseousData.gaugePressureHg,  position: { x, y: startY1 + 65, w: 15, h: 6 } },
        { text: gaseousData.gasVolumeResult,  position: { x, y: startY1 + 80, w: 15, h: 6 } },
      ]);
    } else {
      const x = startX + (index - 15) * 6;
      const startY = startY2;
      rows.push([ /* xuddi shu kalitlar, startY2 bilan */ ]);
    }
  }
  return rows;
};

const allRows = generateAllRows(data.gaseousList);
// ... allRows.flat().map((field, index) => <TextViewField key={index} {...field} />)
```

Bu yerda **har bir index** (0..29) uchun bitta “qator”: bir xil 7 ta field, faqat **x** va **y** o‘zgaradi (blok bo‘yicha).

---

## 2. Umumiy formula: bir template qator + loop, Y += rowHeight

**Bir qator**ni template qilib olasiz (har bir ustun uchun `key` va `position`), keyin `data.gaseousList` ni **map** qilasiz va har bir element uchun **y** ga `index * rowHeight` qo‘shasiz.

```js
const ROW_HEIGHT_MM = 6;  // yoki layout dan
const KEYS = ['pollutantName', 'gasVolumeStart', 'gasVolumeEnd', 'collectionTime', 'gasMeterTemp', 'gaugePressureHg', 'gasVolumeResult'];

// Bir qator template: har ustun uchun { key, x, y0, w, h }
const templateRow = [
  { key: 'pollutantName',    x: 155, y0: 0,  w: 20, h: 6 },
  { key: 'gasVolumeStart',   x: 155, y0: 20, w: 15, h: 3 },
  { key: 'gasVolumeEnd',     x: 158, y0: 20, w: 15, h: 3 },
  { key: 'collectionTime',   x: 155, y0: 35, w: 15, h: 6 },
  { key: 'gasMeterTemp',     x: 155, y0: 50, w: 15, h: 6 },
  { key: 'gaugePressureHg',  x: 155, y0: 65, w: 15, h: 6 },
  { key: 'gasVolumeResult',  x: 155, y0: 80, w: 15, h: 6 },
];

function buildGaseousRows(gaseousList = [], baseY = 0, rowHeightMm = 6) {
  const rowHeight = rowHeightMm; // mm → px agar kerak bo'lsa
  const rows = [];
  gaseousList.forEach((item, index) => {
    const yOffset = baseY + index * rowHeight;
    templateRow.forEach(({ key, x, y0, w, h }) => {
      rows.push({
        text: item[key] != null ? String(item[key]) : '',
        position: { x, y: y0 + yOffset, w, h },
      });
    });
  });
  return rows;
}

// Ishlatish:
const gaseousRows = buildGaseousRows(data.gaseousList, 0, 6);
// gaseousRows ni TextViewField orqali render qilish
gaseousRows.map((field, i) => <TextViewField key={i} {...field} />)
```

Agar **ikki blok** bo‘lsa (sizdagi kabi): birinchi blok uchun `baseY = 0`, ikkinchi blok uchun `baseY = 95`, va har birida `buildGaseousRows(list, baseY, rowHeight)` chaqilasiz (yoki list ni 15+15 qilib bo‘lib).

---

## 3. To‘liq misol: map bilan, ikkala blok

```js
const templateRow = (baseX, baseY) => [
  { key: 'pollutantName',   x: baseX,     y: baseY + 0,  w: 20, h: 6 },
  { key: 'gasVolumeStart',  x: baseX,     y: baseY + 20, w: 15, h: 3 },
  { key: 'gasVolumeEnd',    x: baseX + 3, y: baseY + 20, w: 15, h: 3 },
  { key: 'collectionTime', x: baseX,     y: baseY + 35, w: 15, h: 6 },
  { key: 'gasMeterTemp',    x: baseX,     y: baseY + 50, w: 15, h: 6 },
  { key: 'gaugePressureHg',x: baseX,     y: baseY + 65, w: 15, h: 6 },
  { key: 'gasVolumeResult', x: baseX,     y: baseY + 80, w: 15, h: 6 },
];

const ROW_HEIGHT = 6;

function gaseousListToFields(list = [], startX, startY) {
  return list.map((item, index) =>
    templateRow(startX + index * 6, startY).map(({ key, x, y, w, h }) => ({
      text: item[key] != null ? String(item[key]) : '',
      position: { x, y, w, h },
    }))
  ).flat();
}

const list = data.gaseousList || [];
const block1 = gaseousListToFields(list.slice(0, 15), 155, 0);
const block2 = gaseousListToFields(list.slice(15, 30), 155, 95);
const allRows = [...block1, ...block2];

// Render
{allRows.map((field, index) => (
  <TextViewField key={index} {...field} />
))}
```

Bu yerda ham **har bir qator** uchun **y** template dagi `baseY` + ustun offset (0, 20, 35, …); **x** esa `startX + index * 6` (har bir list element bitta “vertikal” qator).

---

## 4. pdf-maker dagi kabi: ramkali kataklar (border)

**Muammo:** kefa-dev da hozir faqat **matn** chiqyapti; pdf-maker da esa har bir maydon **qora ramkali katak** ichida (rasmdagidek).

**Yechim:** Har bir `TextViewField` (yoki har bir cell) uchun **border** qo‘llang – `@react-pdf/renderer` da `View` bilan `borderWidth: 1`, `borderColor: '#000'` yoki `style` da `borders`.

### Variant A: TextViewField ga border berish

Agar `TextViewField` `viewStyle.borders` yoki `style` qabul qilsa, har bir field uchun ramka qo‘shing:

```js
// Har bir cell uchun border bilan
{
  text: item[key] != null ? String(item[key]) : '',
  position: { x, y, w, h },
  viewStyle: {
    style: {
      borderWidth: 1,
      borderColor: '#000',
      borderStyle: 'solid',
    },
  },
}
```

Yoki sizda `borders: { left: 1, right: 1, top: 1, bottom: 1 }` bo‘lsa, shuni ishlating.

### Variant B: View + Text – har cell alohida ramkali

```jsx
import { View, Text } from '@react-pdf/renderer';

// StyleSheet da
cell: {
  borderWidth: 1,
  borderColor: '#000',
  padding: 2,
  width: '20mm',
  height: '6mm',
  justifyContent: 'center',
  alignItems: 'center',
},

// Loop da
{data.gaseousList?.map((item, rowIndex) => (
  <View key={rowIndex} style={{ flexDirection: 'row', marginTop: rowIndex === 0 ? 0 : 2 }}>
    {['pollutantName', 'gasVolumeStart', 'gasVolumeEnd', 'collectionTime', 'gasMeterTemp', 'gaugePressureHg', 'gasVolumeResult'].map((key) => (
      <View style={styles.cell}>
        <Text>{item[key] != null ? String(item[key]) : ''}</Text>
      </View>
    ))}
  </View>
))}
```

Bu usulda har bir maydon **alohida ramkali katak** bo‘ladi – pdf-maker dagi ko‘rinishga yaqin.

### Variant C: Mavjud TextViewField komponentida borders

Agar `TextViewField` allaqachon `viewStyle.borders` yoki `style` ni qo‘llayotgan bo‘lsa, `buildGaseousRows` / `generateAllRows` dan qaytayotgan har bir field ga **borders** qo‘shing:

```js
rows.push({
  text: item[key] != null ? String(item[key]) : '',
  position: { x, y, w, h },
  viewStyle: { borders: { left: 1, right: 1, top: 1, bottom: 1 } }, // yoki style: { borderWidth: 1, borderColor: '#000' }
});
```

Xulosa: **kefa-dev da faqat text chiqmasin, pdf-maker dagi kabi ramkali kataklar bo‘lsin** deyilsa, har bir gaseousList cell uchun **border** (borderWidth + borderColor yoki borders) berishingiz kifoya.

---

## 5. Xulosa

| Narsa | Qanday |
|-------|--------|
| Backend | `data.gaseousList` ni xohlagan shaklda saqlaysiz (array of objects). |
| Chiqarish | `data.gaseousList.map(...)` yoki `for` loop. |
| Bir qator | Bir matn elementiga **key** yozib, style/position berasiz; loop da **har bir** element uchun **top** (y) ga `index * rowHeight` qo‘shib ketasiz. |
| **Ramkali katak** | Har bir cell uchun **border** (borderWidth: 1, borderColor: '#000' yoki viewStyle.borders) qo‘llang – pdf-maker dagi kabi ko‘rinadi. |
| pdf-maker | Matn elementda **style** da borderTop/Left/Right/Bottom bor; gaseousKey + rowHeight bilan loop. |

kefa-dev-front da: **bir template qator** (key + position) + **har bir field uchun border** → list.map(...) → pdf-maker dagi kabi jadval ko‘rinishi.
