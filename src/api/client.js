import { API_BASE_URL } from "../config/api"

async function apiRequest(path, options = {}) {
  const url = `${API_BASE_URL}${path}`
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  const text = await response.text()
  let data = null

  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { message: text }
    }
  }

  if (!response.ok) {
    const message = data?.message || `HTTP ${response.status}`
    throw new Error(message)
  }

  return data
}

export { apiRequest }
