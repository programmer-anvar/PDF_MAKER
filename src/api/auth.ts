import { isJwtExpired } from '../utils/jwt'

const USER_KEY = 'user'
const AUTH_UPDATE_EVENT = 'authUpdateEvent'
export interface UserState {
  accessToken?: string
  refreshToken?: string
  id?: string
  [key: string]: unknown
}

function readUserFromStorage(): UserState | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as UserState) : null
  } catch {
    return null
  }
}

function writeUserToStorage(user: UserState | null): void {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
  else localStorage.removeItem(USER_KEY)
}

export function getAccessToken(): string | null {
  const user = readUserFromStorage()
  return user?.accessToken ?? null
}

export function getRefreshToken(): string | null {
  const user = readUserFromStorage()
  return user?.refreshToken ?? null
}

export function getUser(): UserState | null {
  return readUserFromStorage()
}

export function setAccessToken(token: string): void {
  const current = readUserFromStorage() || {}
  writeUserToStorage({ ...current, accessToken: token })
}

export function setAuthState(patch: UserState | null, options?: { allowTokenOverwrite?: boolean }): void {
  if (!patch) {
    writeUserToStorage(null)
    return
  }
  const current = readUserFromStorage() || {}
  const allowTokenOverwrite = options?.allowTokenOverwrite ?? false
  const merged = allowTokenOverwrite
    ? { ...current, ...patch }
    : { ...current, ...patch, accessToken: current.accessToken, refreshToken: current.refreshToken }
  writeUserToStorage(merged)
  window.dispatchEvent(new CustomEvent(AUTH_UPDATE_EVENT, { detail: merged }))
}

export function isTokenExpired(): boolean {
  return isJwtExpired(getAccessToken())
}

const AUTH_BASE = import.meta.env.VITE_BACKEND_URL ?? import.meta.env.VITE_AUTH_URL ?? 'https://kefa-dev.com'

export async function refreshAccessToken(): Promise<{ accessToken: string; refreshToken: string }> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) throw new Error('No refresh token available')

  const url = `${AUTH_BASE.replace(/\/$/, '')}/kefa/v1/auth/refresh-token`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  if (!res.ok) {
    if (res.status === 401) throw new Error('Refresh token invalid or expired')
    throw new Error(`Refresh failed: ${res.status}`)
  }

  const data = (await res.json()) as {
    success?: boolean
    dataSource?: { accessToken?: string; refreshToken?: string }
  }
  if (!data?.success || !data?.dataSource?.accessToken || !data?.dataSource?.refreshToken) {
    throw new Error('Invalid refresh response')
  }

  const newAccessToken = data.dataSource.accessToken
  const newRefreshToken = data.dataSource.refreshToken
  const current = readUserFromStorage() || {}
  setAuthState(
    { ...current, accessToken: newAccessToken, refreshToken: newRefreshToken },
    { allowTokenOverwrite: true }
  )
  return { accessToken: newAccessToken, refreshToken: newRefreshToken }
}

export async function ensureValidToken(): Promise<void> {
  const token = getAccessToken()
  if (!token) return
  if (!isJwtExpired(token)) return
  const refreshToken = getRefreshToken()
  if (!refreshToken) return
  await refreshAccessToken()
}

export async function initAuth(): Promise<void> {
  const user = readUserFromStorage()
  if (!user?.accessToken) return
  if (!user.refreshToken) return
  if (!isJwtExpired(user.accessToken)) return

  try {
    await refreshAccessToken()
  } catch {
    console.warn('Failed to refresh token on init, clearing auth state')
  }
}

export function handleLogout(): void {
  writeUserToStorage(null)
  window.dispatchEvent(new Event('authLogout'))
}

export interface LoginCredentials {
  username: string
  password: string
  code?: string
  rememberMe?: boolean
}

export async function login(credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> {
  const url = `${AUTH_BASE.replace(/\/$/, '')}/kefa/v1/auth/log-in`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: credentials.username,
      password: credentials.password,
      code: credentials.code ?? 'kefa',
      rememberMe: credentials.rememberMe ?? true,
    }),
  })
  const data = (await res.json()) as { success?: boolean; dataSource?: UserState; message?: string }
  if (data?.success && data?.dataSource) {
    setAuthState(data.dataSource, { allowTokenOverwrite: true })
    window.dispatchEvent(new CustomEvent(AUTH_UPDATE_EVENT, { detail: data.dataSource }))
    return { success: true }
  }
  return {
    success: false,
    error: data?.message ?? (res.ok ? 'Login failed' : `Server: ${res.status}`),
  }
}
