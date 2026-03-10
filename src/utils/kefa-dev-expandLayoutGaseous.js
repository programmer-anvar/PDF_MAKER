const DEFAULT_ROW_HEIGHT_MM = 6;
export function getMaxRowsFromElements(elements) {
  if (!Array.isArray(elements)) return 0;
  const el = elements.find((e) => e.gaseousRowCount != null && e.gaseousRowCount > 0);
  return el ? Math.max(0, Number(el.gaseousRowCount)) : 0;
}

function getElementContent(el, data) {
  if (el.dataKey && data && typeof data[el.dataKey] !== 'undefined') {
    const v = data[el.dataKey];
    return v === null || v === undefined ? '' : String(v);
  }
  return el.content ?? '';
}

/**
 *
 * @param {Object} layout 
 * @param {Object} data   
 * @returns {Object}      
 *                         
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
