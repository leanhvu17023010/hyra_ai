import { apiBase } from '../config/api'

const ACCESS = 'nb_access_token'
const REFRESH = 'nb_refresh_token'

export function getAccessToken() {
  return localStorage.getItem(ACCESS)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH)
}

export function setTokens(access, refresh) {
  if (access) localStorage.setItem(ACCESS, access)
  if (refresh) localStorage.setItem(REFRESH, refresh)
}

export function clearTokens() {
  localStorage.removeItem(ACCESS)
  localStorage.removeItem(REFRESH)
}

function parseJson(text) {
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    return { message: text }
  }
}

async function refreshAccessToken() {
  const rt = getRefreshToken()
  if (!rt) throw new Error('No refresh token')
  const url = `${apiBase}/auth/refresh`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: rt }),
  })
  const data = parseJson(await res.text())
  if (!res.ok || data.code !== 1000 || !data.result) {
    throw new Error(data.message || 'Refresh failed')
  }
  const { token, refreshToken } = data.result
  setTokens(token, refreshToken || rt)
}

/**
 * @param {string} path — ví dụ `/auth/token`
 * @param {RequestInit} options
 * @param {{ skipAuth?: boolean, _didRefresh?: boolean }} meta
 */
export async function apiFetch(path, options = {}, meta = {}) {
  const { skipAuth = false, _didRefresh = false } = meta
  const url = `${apiBase}${path.startsWith('/') ? path : `/${path}`}`
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }
  if (!skipAuth) {
    const t = getAccessToken()
    if (t) headers.Authorization = `Bearer ${t}`
  }

  const res = await fetch(url, { ...options, headers })
  const data = parseJson(await res.text())

  if (res.status === 401 && !skipAuth && !_didRefresh && getRefreshToken()) {
    try {
      await refreshAccessToken()
      return apiFetch(path, options, { ...meta, _didRefresh: true })
    } catch {
      clearTokens()
    }
  }

  const okEnvelope = data && typeof data.code === 'number' && data.code === 1000
  if (!res.ok || !okEnvelope) {
    const err = new Error(data.message || res.statusText || 'Request failed')
    err.status = res.status
    err.body = data
    throw err
  }
  return data
}
