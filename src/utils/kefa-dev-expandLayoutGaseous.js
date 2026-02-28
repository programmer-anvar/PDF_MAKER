/**
 * kefa-dev: Backend layout + data dan "Text" o'rniga data.gaseousList bo'yicha
 * loop qilingan elementlar ro'yxati. Bu faylni kefa-dev ga copy qilib, render
 * qilishdan OLDIN chaqiring.
 *
 * Ishlatish (kefa-dev da):
 *   import { expandLayoutWithGaseous } from './utils/kefa-dev-expandLayoutGaseous';
 *   const layoutToRender = expandLayoutWithGaseous(layoutFromBackend, data);
 *   // Keyin layoutToRender.layout[].elements ni odatdagidek render qiling.
 */

const DEFAULT_ROW_HEIGHT_MM = 6;

/**
 * Sahifa elementlari ichidan "Qatorlar soni" (gaseousRowCount) ni oladi.
 * Birinchi topilgan gaseousRowCount > 0 qiymatini qaytaradi, yo'q bo'lsa 0.
 * Kefa-dev da o'ng blok uchun for (r < N) da N o'rniga ishlatish: getMaxRowsFromElements(page.elements)
 */
export function getMaxRowsFromElements(elements) {
  if (!Array.isArray(elements)) return 0;
  const el = elements.find((e) => e.gaseousRowCount != null && e.gaseousRowCount > 0);
  return el ? Math.max(0, Number(el.gaseousRowCount)) : 0;
}

/**
 * Bitta elementni data bo'yicha content bilan yangilaydi (dataKey bo'lsa).
 */
function getElementContent(el, data) {
  if (el.dataKey && data && typeof data[el.dataKey] !== 'undefined') {
    const v = data[el.dataKey];
    return v === null || v === undefined ? '' : String(v);
  }
  return el.content ?? '';
}

/**
 * Layout ni qayta ishlaydi: gaseousKey li elementlarni data.gaseousList
 * bo'yicha loop qilib, har qator uchun alohida element qiladi (border bilan).
 * Qatorlar soni layout dan olinadi: sahifa elementlarida gaseousRowCount
 * berilgan bo'lsa, shuncha qator chiqadi (ortiqchasi bo'sh); berilmagan bo'lsa list uzunligi.
 *
 * @param {Object} layout - Backend dan kelgan layout: { layout: [ { id, elements: [...] } ] }
 * @param {Object} data   - { gaseousList: [...], companyName, ... }
 * @returns {Object}      - Xuddi shu struktura, lekin elements ichida gaseous
 *                         elementlar expand qilingan (har qator = alohida element)
 */
export function expandLayoutWithGaseous(layout, data = {}) {
  const list = data.gaseousList || [];
  const rowHeight = DEFAULT_ROW_HEIGHT_MM;

  if (!layout || !layout.layout || !Array.isArray(layout.layout)) {
    return layout;
  }

  const newLayout = {
    ...layout,
    layout: layout.layout.map((page) => {
      const pageElements = page.elements || [];
      const maxRows = getMaxRowsFromElements(pageElements);
      const rowCount = maxRows > 0 ? maxRows : list.length;

      const elements = [];
      for (const el of pageElements) {
        if (!el.gaseousKey) {
          elements.push({
            ...el,
            content: getElementContent(el, data),
          });
          continue;
        }
        const keys = String(el.gaseousKey).split(',').map((k) => k.trim()).filter(Boolean);
        const bottomKey = (el.gaseousKeyBottom ?? '').trim() || null;
        const h = el.gaseousRowHeight ?? el.h ?? rowHeight;
        for (let i = 0; i < rowCount; i++) {
          const item = list[i] || {};
          const y = el.y + i * h;
          let text;
          if (bottomKey) {
            const topVal = keys[0] ? (item[keys[0]] ?? '') : '';
            const bottomVal = item[bottomKey] ?? '';
            text = topVal + '\n' + bottomVal;
          } else if (keys.length === 1) {
            text = item[keys[0]] ?? '';
          } else {
            text = keys.map((k) => item[k] ?? '').join('\n');
          }
          const style = {
            ...(el.style || {}),
            border: '1px solid black',
            borderRight: el.style?.borderRight ?? '1px solid black',
            borderBottom: el.style?.borderBottom ?? '1px solid black',
            borderTop: el.style?.borderTop ?? '1px solid black',
            borderLeft: el.style?.borderLeft ?? '1px solid black',
          };
          elements.push({
            ...el,
            id: el.id ? `${el.id}-g${i}` : undefined,
            content: String(text),
            y,
            style,
          });
        }
      }
      return { ...page, elements };
    }),
  };

  return newLayout;
}
