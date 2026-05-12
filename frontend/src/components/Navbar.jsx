import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="flex items-center justify-between bg-white px-8 py-4 text-black shadow-sm">
      <Link to="/" className="text-2xl font-bold">
        Example AI
      </Link>
      <div className="flex items-center gap-4 text-base font-medium">
        {loading ? (
          <span className="text-gray-500">…</span>
        ) : user ? (
          <>
            <span className="hidden text-gray-700 sm:inline">{user.email}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50"
            >
              Đăng xuất
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="rounded-lg bg-[#5b6ef7] px-6 py-2 text-white transition-colors hover:bg-[#4a5ce6]"
            >
              Đăng nhập
            </Link>
            <Link to="/register" className="text-[#5b6ef7] hover:underline">
              Đăng ký
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
export default Navbar