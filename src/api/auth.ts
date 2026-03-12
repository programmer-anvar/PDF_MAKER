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

const AUTH_BASE = import.meta.env.VITE_BACKEND_URL ?? import.meta.env.VITE_AUTH_URL ?? 'https://nexinsight.kr'

function getTokenFromObj(obj: Record<string, unknown> | undefined, accessKey: 'accessToken' | 'access_token'): string | undefined {
  if (!obj) return undefined
  const v = obj[accessKey] ?? obj[accessKey === 'accessToken' ? 'access_token' : 'accessToken']
  return typeof v === 'string' ? v : undefined
}

function getRefreshFromObj(obj: Record<string, unknown> | undefined): string | undefined {
  if (!obj) return undefined
  const v = obj.refreshToken ?? obj.refresh_token
  return typeof v === 'string' ? v : undefined
}

export async function refreshAccessToken(): Promise<{ accessToken: string; refreshToken: string }> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) throw new Error('No refresh token available')

  const url = `${AUTH_BASE.replace(/\/$/, '')}/kefa/v1/auth/refresh-token`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken, refresh_token: refreshToken }),
  })

  if (!res.ok) {
    if (res.status === 401) throw new Error('Refresh token invalid or expired')
    throw new Error(`Refresh failed: ${res.status}`)
  }

  const data = (await res.json()) as Record<string, unknown>
  const source = (data?.dataSource ?? data?.data ?? data) as Record<string, unknown> | undefined
  const newAccessToken = getTokenFromObj(source, 'accessToken') ?? getTokenFromObj(data as Record<string, unknown>, 'accessToken')
  const newRefreshToken = getRefreshFromObj(source) ?? getRefreshFromObj(data as Record<string, unknown>)
  if (!newAccessToken) {
    throw new Error('Invalid refresh response')
  }
  const current = readUserFromStorage() || {}
  setAuthState(
    {
      ...current,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken ?? current.refreshToken ?? refreshToken,
    },
    { allowTokenOverwrite: true }
  )
  return { accessToken: newAccessToken, refreshToken: newRefreshToken ?? current.refreshToken ?? refreshToken }
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
    handleLogout()
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
  const data = (await res.json()) as Record<string, unknown>
  const source = (data?.dataSource ?? data?.data ?? data) as Record<string, unknown> | undefined
  const accessToken = getTokenFromObj(source, 'accessToken') ?? getTokenFromObj(data, 'accessToken')
  // const refreshToken = getRefreshFromObj(source) ?? getRefreshFromObj(data)
  if (res.ok && accessToken) {
    const userState: UserState = {
      ...(source ?? {}),
      accessToken,
      // refreshToken: refreshToken ?? source?.refreshToken ?? source?.refresh_token,
    }
    setAuthState(userState, { allowTokenOverwrite: true })
    window.dispatchEvent(new CustomEvent(AUTH_UPDATE_EVENT, { detail: userState }))
    return { success: true }
  }
  const message = (data?.message ?? data?.error) as string | undefined
  return {
    success: false,
    error: message ?? (res.ok ? 'Login failed' : `Server: ${res.status}`),
  }
}
