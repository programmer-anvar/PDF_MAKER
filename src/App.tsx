import { useCallback, useEffect, useState } from 'react'
import { useEditorStore } from './store/editorStore'
import { useToastStore } from './store/toastStore'
import { Canvas } from './components/Canvas'
import { DataSidebar } from './components/DataSidebar'
import { RightPanel } from './components/RightPanel'
import { Toast } from './components/Toast'
import { exportPageToPdf } from './utils/exportPdf'
import { saveToServer, loadFromServer } from './utils/saveLoad'
import { getAccessToken, setAccessToken, initAuth, handleLogout } from './api/auth'
import { LoginView } from './components/LoginView'
import './App.css'

function App() {
  const toast = useToastStore((s) => s.show)
  const { undo, redo, deleteElement, setSelected, getSelected } = useEditorStore()
  const [loading, setLoading] = useState(true)
  const [tokenInput, setTokenInput] = useState('')
  const [showTokenInput, setShowTokenInput] = useState(false)
  const [, setAuthVersion] = useState(0)
  const hasToken = !!getAccessToken()

  useEffect(() => {
    const onAuthChange = () => setAuthVersion((v) => v + 1)
    window.addEventListener('authLogout', onAuthChange)
    window.addEventListener('storage', onAuthChange)
    return () => {
      window.removeEventListener('authLogout', onAuthChange)
      window.removeEventListener('storage', onAuthChange)
    }
  }, [])

  useEffect(() => {
    if (!hasToken) return
    setLoading(true)
    const load = () => {
      loadFromServer() 
        .then((ok) => {
          if (!ok) toast('Serverdan yuklash mumkin emas.', 'error')
        })
        .finally(() => setLoading(false))
    }
    initAuth()
      .then(load)
      .catch(() => {
        toast('Auth xatosi', 'error')
        load()
      })
  }, [hasToken])

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
    const pages = useEditorStore.getState().pages
    const selectors = pages.map((p) => `#a4-page-${p.id}`)
    exportPageToPdf(selectors, `document-${Date.now()}.pdf`)
    toast('PDF yuklandi', 'success')
  }, [toast])

  const handleSave = useCallback(async () => {
    const result = await saveToServer()
    if (result.ok) toast('Serverga saqlandi', 'success')
    else toast(result.error ?? 'Serverga saqlashda xatolik', 'error')
  }, [toast])

  const handleSaveToken = useCallback(() => {
    const t = tokenInput.trim()
    if (t) {
      setAccessToken(t)
      setTokenInput('')
      setShowTokenInput(false)
      toast('Token saqlandi', 'success')
      setAuthVersion((v) => v + 1)
    }
  }, [tokenInput, toast])

  const onLogout = useCallback(() => {
    handleLogout()
    setShowTokenInput(true)
    setAuthVersion((v) => v + 1)
    toast('Chiqildi', 'info')
  }, [toast])

  const canUndo = useEditorStore((s) => s.historyIndex > 0)
  const canRedo = useEditorStore((s) => s.history.length > 0 && s.historyIndex < s.history.length - 1)
  const canvasScale = useEditorStore((s) => s.canvasScale)
  const setCanvasScale = useEditorStore((s) => s.setCanvasScale)

  if (!hasToken) {
    return (
      <>
        <LoginView onSuccess={() => setAuthVersion((v) => v + 1)} />
        <Toast />
      </>
    )
  }

  if (loading) {
    return (
      <div className="app editor-app app-loading">
        <div className="loading-message">불러오는 중…</div>
        <Toast />
      </div>
    )
  }

  return (
    <div className="app editor-app">
      <Toast />
      <header className="editor-header">
        <h1>PDF 디자이너</h1>
        <div className="toolbar">
          {/* {!hasToken || showTokenInput ? (
            <span className="toolbar-token-wrap">
              <input
                type="password"
                className="toolbar-token-input"
                placeholder="Bearer token (kefa-dev dan nusxalang)"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveToken()}
              />
              <button type="button" className="btn primary small" onClick={handleSaveToken}>
                토큰 저장
              </button>
              {hasToken && (
                <button type="button" className="btn small" onClick={() => setShowTokenInput(false)}>
                  닫기
                </button>
              )}
            </span>
          ) : ( */}
            <>
              <button type="button" className="btn small" onClick={() => setShowTokenInput(true)} title="Token yangilash">
                토큰 ✓
              </button>
              <button type="button" className="btn small danger" onClick={onLogout} title="Chiqish">
                로그아웃
              </button>
            </>
          {/* )} */}
          <span className="toolbar-sep" />
          <button type="button" className="btn" onClick={undo} disabled={!canUndo} title="Bekor qilish (Ctrl+Z)">
            ↩ 취소
          </button>
          <button type="button" className="btn" onClick={redo} disabled={!canRedo} title="Qayta (Ctrl+Y)">
            ↪ 다시
          </button>
          <span className="toolbar-sep" />
          <button type="button" className="btn primary" onClick={handleExportPdf}>
            PDF 
          </button>
          <button type="button" className="btn" onClick={handleSave}>
            저장
          </button>
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
          <div className="canvas-area-inner">
            <Canvas />
          </div>
        </div>
        <RightPanel />
      </div>
    </div>
  )
}

export default App
