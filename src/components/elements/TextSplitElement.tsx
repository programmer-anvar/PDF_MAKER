import type { EditorElement } from '../../types/editor'

interface Props {
  element: EditorElement
  isSelected: boolean
}

export function TextSplitElement({ element, isSelected }: Props) {
  const style = element.style ?? {}
  const hasContent = element.content != null && String(element.content).trim() !== ''
  const topPlaceholder = element.gaseousKey ? `[${element.gaseousKey}]` : (element.dataKey ?? element.content ?? 'Text')
  const bottomPlaceholder = element.gaseousKeyBottom ? `[${element.gaseousKeyBottom}]` : ''
  const parts = hasContent ? String(element.content).split('\n') : []
  const textTop = hasContent ? (parts[0] ?? '') : topPlaceholder
  const textBottom = hasContent ? (parts[1] ?? '') : bottomPlaceholder

  return (
    <div
      className={`element-text element-text-split ${isSelected ? 'selected' : ''}`}
      data-data-key={element.dataKey ?? undefined}
      data-gaseous-key={element.gaseousKey ?? undefined}
      data-gaseous-row-height={element.gaseousRowHeight ?? undefined}
      data-gaseous-row-count={element.gaseousRowCount ?? undefined}
      style={{
        width: '100%',
        height: '100%',
        minWidth: 0,
        minHeight: 0,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: style.borderLeft,
        borderRight: style.borderRight,
        borderTop: style.borderTop,
        borderBottom: style.borderBottom,
        overflow: 'hidden',
      }}
    >

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: style.fontSize ?? 14,
          fontWeight: style.fontWeight ?? 'normal',
          color: style.color ?? '#000',
          fontFamily: style.fontFamily ?? 'inherit',
          padding: '2px 4px',
          lineHeight: 1.4,
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {textTop}
      </div>

      <span
        aria-hidden
        style={{
          flexShrink: 0,
          width: '100%',
          height: 1,
          backgroundColor: style.color ?? '#000',
          opacity: 0.6,
        }}
      />
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: style.fontSize ?? 14,
          fontWeight: style.fontWeight ?? 'normal',
          color: style.color ?? '#000',
          fontFamily: style.fontFamily ?? 'inherit',
          padding: '2px 4px',
          lineHeight: 1.4,
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {textBottom}
      </div>
    </div>
  )
}
