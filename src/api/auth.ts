/**
 * Auth – kefa-dev-front bilan bir xil: localStorage "user", refresh-token, logout.
 * Bir domain da bo'lsa kefa-dev login dan token avtomatik; standalone da token qo'lda yoki login.
 */
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

/** Token qo'lda qo'yish (faqat accessToken) */
export function setAccessToken(token: string): void {
  const current = readUserFromStorage() || {}
  writeUserToStorage({ ...current, accessToken: token })
}

/**
 * Kefa-dev bilan bir xil: login/refresh dan keyin chaqiriladi.
 * allowTokenOverwrite: true bo'lsa accessToken va refreshToken yangilanadi.
 */
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

/** JWT muddati o'tgan bo'lsa true */
export function isTokenExpired(): boolean {
  return isJwtExpired(getAccessToken())
}

const AUTH_BASE = import.meta.env.VITE_BACKEND_URL ?? import.meta.env.VITE_AUTH_URL ?? 'https://kefa-dev.com'

/**
 * Refresh token – POST .../kefa/v1/auth/refresh-token
 */
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

/**
 * API chaqirishdan oldin: token muddati o'tgan bo'lsa refresh qiladi.
 * So'rovda 401 bo'lmasligi uchun chaqiriladi.
 */
export async function ensureValidToken(): Promise<void> {
  const token = getAccessToken()
  if (!token) return
  if (!isJwtExpired(token)) return
  const refreshToken = getRefreshToken()
  if (!refreshToken) return
  await refreshAccessToken()
}

/**
 * Ilova ishga tushganda: token bor bo'lsa va muddati o'tgan bo'lsa refresh qilish.
 * Kefa-dev initAuth ga o'xshash.
 */
export async function initAuth(): Promise<void> {
  const user = readUserFromStorage()
  if (!user?.accessToken) return
  if (!user.refreshToken) return
  if (!isJwtExpired(user.accessToken)) return

  try {
    await refreshAccessToken()
  } catch {
    // Refresh muvaffaqiyatsiz – token ni o'chirish shart emas, foydalanuvchi qayta login qiladi
  }
}

/**
 * Logout – kefa-dev handleLogout ga o'xshash: localStorage dan user o'chiriladi.
 */
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

/**
 * Login – POST https://kefa-dev.com/kefa/v1/auth/log-in
 */
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
