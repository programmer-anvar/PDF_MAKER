import { useCallback, useEffect, useState } from 'react'
import { useEditorStore } from './store/editorStore'
import { useToastStore } from './store/toastStore'
import { Canvas } from './components/Canvas'
import { DataSidebar } from './components/DataSidebar'
import { RightPanel } from './components/RightPanel'
import { Toast } from './components/Toast'
import { exportPageToPdf } from './utils/exportPdf'
import { saveToServer, loadFromServer, exportLayoutJson, importLayoutJson } from './utils/saveLoad'
import './App.css'

function App() {
  const toast = useToastStore((s) => s.show)
  const { undo, redo, deleteElement, setSelected, getSelected } = useEditorStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    loadFromServer()
      .then((ok) => {
        if (!ok) toast('Serverdan yuklash mumkin emas. Avval "npm run server" ishga tushiring.', 'error')
      })
      .catch(() => toast('Server xatosi', 'error'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelected(null)
        return
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const el = getSelected()
        if (el && !(e.target as HTMLElement).closest('input, textarea, select')) {
          e.preventDefault()
          deleteElement(el.id)
          setSelected(null)
          toast('Element o‘chirildi', 'info')
        }
        return
      }
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault()
          if (e.shiftKey) redo()
          else undo()
        } else if (e.key === 'y') {
          e.preventDefault()
          redo()
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [undo, redo, deleteElement, setSelected, getSelected])

  const handleExportPdf = useCallback(() => {
    exportPageToPdf('#a4-page', `document-${Date.now()}.pdf`)
    toast('PDF yuklandi', 'success')
  }, [toast])

  const handleSave = useCallback(async () => {
    const ok = await saveToServer()
    if (ok) toast('Serverga saqlandi', 'success')
    else toast('Serverga saqlashda xatolik', 'error')
  }, [toast])

  const handleLoad = useCallback(async () => {
    const ok = await loadFromServer()
    if (ok) toast('Serverdan yuklandi', 'success')
    else toast('Serverdan yuklash mumkin emas', 'error')
  }, [toast])

  const handleExportJson = useCallback(() => {
    const json = exportLayoutJson()
    const blob = new Blob([json], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'layout.json'
    a.click()
    URL.revokeObjectURL(a.href)
    toast('JSON yuklandi', 'success')
  }, [toast])

  const handleImportJson = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (importLayoutJson(reader.result as string)) toast('Import qilindi', 'success')
      else toast('JSON formati noto‘g‘ri', 'error')
    }
    reader.readAsText(file)
    e.target.value = ''
  }, [toast])

  const canUndo = useEditorStore((s) => s.historyIndex > 0)
  const canRedo = useEditorStore((s) => s.history.length > 0 && s.historyIndex < s.history.length - 1)
  const canvasScale = useEditorStore((s) => s.canvasScale)
  const setCanvasScale = useEditorStore((s) => s.setCanvasScale)

  if (loading) {
    return (
      <div className="app editor-app app-loading">
        <div className="loading-message">Yuklanmoqda…</div>
        <Toast />
      </div>
    )
  }

  return (
    <div className="app editor-app">
      <Toast />
      <header className="editor-header">
        <h1>PDF Designer</h1>
        <p>Elementlarni sahifaga qo‘shing, joylashtiring. <span className="kbd-hint">Ctrl+Z</span> bekor qilish, <span className="kbd-hint">Delete</span> o‘chirish.</p>
        <div className="toolbar">
          <button type="button" className="btn" onClick={undo} disabled={!canUndo} title="Bekor qilish (Ctrl+Z)">
            ↩ Bekor
          </button>
          <button type="button" className="btn" onClick={redo} disabled={!canRedo} title="Qayta (Ctrl+Y)">
            ↪ Qayta
          </button>
          <span className="toolbar-sep" />
          <button type="button" className="btn primary" onClick={handleExportPdf}>
            PDF yuklab olish
          </button>
          <button type="button" className="btn" onClick={handleSave}>
            Saqlash
          </button>
          <button type="button" className="btn" onClick={handleLoad}>
            Serverdan yuklash
          </button>
          <button type="button" className="btn" onClick={handleExportJson}>
            JSON
          </button>
          <label className="btn">
            Import
            <input type="file" accept=".json" onChange={handleImportJson} hidden />
          </label>
          <span className="toolbar-sep" />
          <span className="zoom-label">Zoom</span>
          {[0.5, 0.65, 0.8, 1].map((s) => (
            <button
              key={s}
              type="button"
              className={`btn small ${canvasScale === s ? 'primary' : ''}`}
              onClick={() => setCanvasScale(s)}
            >
              {Math.round(s * 100)}%
            </button>
          ))}
        </div>
      </header>

      <div className="editor-body">
        <DataSidebar />
        <div className="canvas-area">
          <Canvas />
        </div>
        <RightPanel />
      </div>
    </div>
  )
}

export default App
