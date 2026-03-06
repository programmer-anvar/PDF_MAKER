import { useEditorStore } from '../store/editorStore'
import type { ElementType } from '../types/editor'

const ELEMENTS: { type: ElementType; label: string; icon: string }[] = [
  { type: 'text', label: '텍스트', icon: 'T' },
  { type: 'textTemplate', label: '텍스트 + 키 (Text${key})', icon: 'T$' },
  { type: 'parentheses', label: '괄호 (…)', icon: '( )' },
  { type: 'textSplit', label: 'Text (o\'rtada chiziq)', icon: '|T' },
  { type: 'image', label: '이미지', icon: '🖼' },
  { type: 'rect', label: '사각형', icon: '▢' },
  { type: 'line', label: '선', icon: '—' },
  // { type: 'table', label: '표', icon: '▦' },
]

export function LeftPanel() {
  const addElement = useEditorStore((s) => s.addElement)

  return (
    <aside className="panel left-panel">
      <h3>요소 목록</h3>
      <p className="panel-hint">클릭하여 추가</p>
      <ul className="element-list">
        {ELEMENTS.map(({ type, label, icon }) => (
          <li key={type}>
            <button
              type="button"
              className="element-btn"
              onClick={() => addElement(type)}
              title={label}
            >
              <span className="element-icon">{icon}</span>
              <span>{label}</span>
            </button>
          </li>
        ))}
        <li>
          <button
            type="button"
            className="element-btn"
            onClick={() => addElement('image', undefined, undefined, undefined, { w: 20, h: 10 }, '__sign1Img__')}
            title="PDF의 meaSignature1"
          >
            <span className="element-icon">✍</span>
            <span>1</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            className="element-btn"
            onClick={() => addElement('image', undefined, undefined, undefined, { w: 20, h: 10 }, '__sign2Img__')}
            title="PDF의 meaSignature2"
          >
            <span className="element-icon">✍</span>
            <span>2</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            className="element-btn"
            onClick={() => addElement('image', undefined, undefined, undefined, { w: 28, h: 25 }, '__shapeImage__')}
            title="PDF의 도형 이미지 (너비/높이 조절 가능)"
          >
            <span className="element-icon">▢</span>
            <span>Shape</span>
          </button>
        </li>
      </ul>
    </aside>
  )
}
