/**
 * Base URL gọi API (không có slash cuối).
 * - Dev: mặc định "/nova_beauty" + proxy Vite → http://localhost:8080
 * - Prod: set VITE_API_BASE=https://host/nova_beauty
 */
const raw = import.meta.env.VITE_API_BASE ?? '/nova_beauty'
export const apiBase = String(raw).replace(/\/$/, '')
