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
 * Natijada "Text" o'rniga haqiqiy qiymatlar chiqadi.
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
      const elements = [];
      for (const el of page.elements || []) {
        if (!el.gaseousKey) {
          // Oddiy element: bitta, content ni data dan to'ldirish
          elements.push({
            ...el,
            content: getElementContent(el, data),
          });
          continue;
        }
        // Gaseous: "Text" chiqarma, loop qil
        const keys = String(el.gaseousKey).split(',').map((k) => k.trim()).filter(Boolean);
        const h = el.gaseousRowHeight ?? el.h ?? rowHeight;
        for (let i = 0; i < list.length; i++) {
          const item = list[i] || {};
          const y = el.y + i * h;
          const text = keys.length === 1
            ? (item[keys[0]] ?? '')
            : keys.map((k) => item[k] ?? '').join(' ');
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
