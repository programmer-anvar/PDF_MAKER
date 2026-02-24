import { Rnd } from 'react-rnd'
import { useEditorStore } from '../store/editorStore'
import { ElementRenderer } from './elements'
import { PX_PER_MM, GRID_SNAP_MM, A4_WIDTH_MM, A4_HEIGHT_MM } from '../types/editor'

export function Canvas() {
  const pages = useEditorStore((s) => s.pages)
  const activePageIndex = useEditorStore((s) => s.activePageIndex)
  const selectedId = useEditorStore((s) => s.selectedId)
  const setSelected = useEditorStore((s) => s.setSelected)
  const setActivePageIndex = useEditorStore((s) => s.setActivePageIndex)
  const updateElementPosition = useEditorStore((s) => s.updateElementPosition)
  const addElement = useEditorStore((s) => s.addElement)
  const addPage = useEditorStore((s) => s.addPage)
  const isDraggingFromSidebar = useEditorStore((s) => s.isDraggingFromSidebar)
  const setDraggingFromSidebar = useEditorStore((s) => s.setDraggingFromSidebar)
  const canvasScale = useEditorStore((s) => s.canvasScale)

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  function handleDrop(e: React.DragEvent, pageIndex: number) {
    e.preventDefault()
    setDraggingFromSidebar(false)
    const raw = e.dataTransfer.getData('application/json')
    if (!raw) return
    let text: string
    let dataKey: string | undefined
    try {
      const data = JSON.parse(raw) as { text?: string; label?: string; value?: string; dataKey?: string }
      text = data.text ?? (data.value ? `${data.label}: ${data.value}` : data.label ?? '')
      dataKey = data.dataKey ?? data.label
    } catch {
      return
    }
    const pageEl = document.getElementById(`a4-page-${pages[pageIndex]?.id}`)
    if (!pageEl) return
    setActivePageIndex(pageIndex)
    const rect = pageEl.getBoundingClientRect()
    const page = pages[pageIndex]
    if (!page) return
    const xMm = ((e.clientX - rect.left) / rect.width) * page.pageWidth
    const yMm = ((e.clientY - rect.top) / rect.height) * page.pageHeight
    addElement('text', xMm, yMm, text, undefined, dataKey)
  }

  return (
    <div className="canvas-wrap" style={{ transform: `scale(${canvasScale})`, transformOrigin: 'top center' }}>
      {pages.map((page, index) => {
        const isActive = index === activePageIndex
        const elements = page.elements
        return (
          <div key={page.id} className="canvas-page-block" style={{ marginBottom: index < pages.length - 1 ? 24 : 0 }}>
            <div
              id={`a4-page-${page.id}`}
              className={`a4-page ${isActive ? 'a4-page-active' : ''}`}
              role="presentation"
              style={{
                width: `${A4_WIDTH_MM}mm`,
                height: `${A4_HEIGHT_MM}mm`,
                position: 'relative',
                background: '#fff',
                boxShadow: '0 2px 20px rgba(0,0,0,0.15)',
              }}
              onMouseDown={(e) => {
                if ((e.target as HTMLElement).id === `a4-page-${page.id}`) {
                  setSelected(null)
                  setActivePageIndex(index)
                }
              }}
            >
              {/* Drop zone: faqat aktiv sahifada */}
              {isActive && (
                <>
                  <div
                    className={`canvas-drop-overlay ${isDraggingFromSidebar ? 'canvas-drop-overlay-active' : ''}`}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      zIndex: 9999,
                      pointerEvents: isDraggingFromSidebar ? 'auto' : 'none',
                    }}
                    onDragOver={handleDragOver}
                    onDrop={(ev) => handleDrop(ev, index)}
                  />
                  {isDraggingFromSidebar && (
                    <div className="canvas-drop-hint" aria-hidden>
                      Sahifaga tushiring
                    </div>
                  )}
                </>
              )}
              {[...elements]
                .sort((a, b) => (a.isContainer ? 0 : 1) - (b.isContainer ? 0 : 1))
                .map((el) => (
                  <Rnd
                    key={`${el.id}-${el.w}-${el.h}`}
                    size={{ width: el.w * PX_PER_MM, height: el.h * PX_PER_MM }}
                    position={{ x: el.x * PX_PER_MM, y: el.y * PX_PER_MM }}
                    scale={canvasScale}
                    onDragStop={(_e, d) => {
                      const dx = Math.abs(d.x - el.x * PX_PER_MM)
                      const dy = Math.abs(d.y - el.y * PX_PER_MM)
                      if (dx > 8 || dy > 8)
                        updateElementPosition(el.id, d.x / PX_PER_MM, d.y / PX_PER_MM, el.w, el.h)
                    }}
                    onResizeStop={(_e, _dir, ref, _delta, pos) => {
                      updateElementPosition(
                        el.id,
                        pos.x / PX_PER_MM,
                        pos.y / PX_PER_MM,
                        ref.offsetWidth / PX_PER_MM,
                        ref.offsetHeight / PX_PER_MM
                      )
                    }}
                    dragGrid={[GRID_SNAP_MM * PX_PER_MM, GRID_SNAP_MM * PX_PER_MM]}
                    resizeGrid={[GRID_SNAP_MM * PX_PER_MM, GRID_SNAP_MM * PX_PER_MM]}
                    bounds="parent"
                    enableResizing={selectedId === el.id}
                    disableDragging={false}
                    onMouseDown={(e) => {
                      e.stopPropagation()
                      setActivePageIndex(index)
                      setSelected(el.id)
                    }}
                    style={{
                      zIndex: el.isContainer ? 0 : (selectedId === el.id ? 1000 : 1),
                      border: 'none',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  >
                    <div style={{ width: '100%', height: '100%', minHeight: 0, overflow: 'visible', transform: el.rotate ? `rotate(${el.rotate}deg)` : undefined }}>
                      <ElementRenderer element={el} isSelected={selectedId === el.id} />
                    </div>
                  </Rnd>
                ))}
            </div>
          </div>
        )
      })}
      <div className="canvas-add-page-wrap">
        <button type="button" className="btn canvas-add-page-btn" onClick={() => addPage()}>
          + Yangi sahifa (A4)
        </button>
      </div>
    </div>
  )
}
