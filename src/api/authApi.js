import { apiRequest } from "./client"

async function login(payload) {
  return apiRequest("/auth/token", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export { login }
