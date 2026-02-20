import { useState, useCallback } from 'react'
import { login } from '../api/auth'
import './LoginView.css'

interface Props {
  onSuccess: () => void
}

const DEFAULT = {
  username: 'musokhon',
  password: 'Musokhon@2025',
  code: 'kefa',
  rememberMe: true,
}

export function LoginView({ onSuccess }: Props) {
  const [username, setUsername] = useState(DEFAULT.username)
  const [password, setPassword] = useState(DEFAULT.password)
  const [code, setCode] = useState(DEFAULT.code)
  const [rememberMe, setRememberMe] = useState(DEFAULT.rememberMe)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError('')
      setLoading(true)
      try {
        const result = await login({ username, password, code, rememberMe })
        if (result.success) {
          onSuccess()
        } else {
          setError(result.error ?? 'Login failed')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Network error')
      } finally {
        setLoading(false)
      }
    },
    [username, password, code, rememberMe, onSuccess]
  )

  return (
    <div className="login-view">
      <div className="login-card">
        <h1>PDF Maker</h1>
        <p className="login-hint">Kefa-dev API ga kirish</p>
        <form onSubmit={handleSubmit} className="login-form">
          <label>
            <span>Username</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              disabled={loading}
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
            />
          </label>
          <label>
            <span>Code</span>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={loading}
            />
          </label>
          <label className="login-remember">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={loading}
            />
            <span>Remember me</span>
          </label>
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="btn primary login-btn" disabled={loading}>
            {loading ? 'Kirilmoqda…' : 'Kirish'}
          </button>
        </form>
      </div>
    </div>
  )
}
