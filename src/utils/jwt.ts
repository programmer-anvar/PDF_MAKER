/**
 * JWT – kefa-dev-front bilan bir xil: exp tekshirish.
 */
function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=')
  return atob(padded)
}

export function getJwtExpiresAtMs(jwt: string | null | undefined): number | null {
  if (!jwt || typeof jwt !== 'string') return null
  try {
    const parts = jwt.split('.')
    if (parts.length < 2) return null
    const payload = decodeBase64Url(parts[1])
    const jsonPayload = decodeURIComponent(
      payload
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    const data = JSON.parse(jsonPayload) as { exp?: number }
    const exp = data?.exp
    if (typeof exp !== 'number') return null
    return exp * 1000
  } catch {
    return null
  }
}

export function isJwtExpired(token: string | null | undefined, leewaySeconds = 10): boolean {
  if (!token) return true
  const expMs = getJwtExpiresAtMs(token)
  if (expMs == null) return true
  return Date.now() >= expMs - leewaySeconds * 1000
}
