import type { EditorElement } from '../../types/editor'

interface Props {
  element: EditorElement
  isSelected: boolean
}

export function TableElement({ element, isSelected }: Props) {
  const table = element.table ?? { rows: 3, cols: 3, data: [], border: true, cellPadding: 4 }
  const rows = table.rows
  const cols = table.cols
  const data = table.data ?? Array.from({ length: rows }, () => Array(cols).fill(''))
  const padding = table.cellPadding ?? 4

  return (
    <div className={`element-table ${isSelected ? 'selected' : ''}`} style={{ overflow: 'auto' }}>
      <table
        style={{
          width: '100%',
          height: '100%',
          borderCollapse: 'collapse',
          tableLayout: 'fixed',
          fontSize: element.style?.fontSize ?? 12,
        }}
        border={table.border ? 1 : 0}
        cellPadding={padding}
        cellSpacing={0}
      >
        <tbody>
          {data.slice(0, rows).map((row, ri) => (
            <tr key={ri}>
              {row.slice(0, cols).map((cell, ci) => (
                <td key={ci} style={{ border: table.border ? '1px solid #333' : 'none' }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
