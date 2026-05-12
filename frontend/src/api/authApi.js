import { apiFetch, clearTokens, setTokens } from './client'

export async function login({ email, password }) {
  const data = await apiFetch(
    '/auth/token',
    {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    },
    { skipAuth: true },
  )
  const { token, refreshToken } = data.result || {}
  setTokens(token, refreshToken)
  return data.result
}

export async function register(payload) {
  const body = {
    email: payload.email,
    password: payload.password,
    fullName: payload.fullName || payload.email.split('@')[0],
    phoneNumber: payload.phoneNumber ?? '',
    address: payload.address ?? '',
    roleName: 'CUSTOMER',
  }
  const data = await apiFetch('/users', { method: 'POST', body: JSON.stringify(body) }, { skipAuth: true })
  return data.result
}

export async function fetchMyProfile() {
  const data = await apiFetch('/users/my-info', { method: 'GET' })
  return data.result
}

export async function logout() {
  const access = localStorage.getItem('nb_access_token')
  if (access) {
    try {
      await apiFetch(
        '/auth/logout',
        { method: 'POST', body: JSON.stringify({ token: access }) },
        { skipAuth: true },
      )
    } catch {
      // vẫn xóa token phía client
    }
  }
  clearTokens()
}
