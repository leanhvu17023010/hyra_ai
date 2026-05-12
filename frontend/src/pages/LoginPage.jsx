import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (location.state?.registered) {
      setInfo('Đăng ký thành công. Vui lòng đăng nhập.')
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setPending(true)
    try {
      await login(email.trim(), password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md">
      <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">Đăng nhập</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-[#5b6ef7] focus:ring-1 focus:ring-[#5b6ef7]"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Mật khẩu</label>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-[#5b6ef7] focus:ring-1 focus:ring-[#5b6ef7]"
          />
        </div>
        {info ? <p className="text-sm text-green-700">{info}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[#5b6ef7] py-2.5 font-semibold text-white transition-colors hover:bg-[#4a5ce6] disabled:opacity-60"
        >
          {pending ? 'Đang xử lý…' : 'Đăng nhập'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="font-medium text-[#5b6ef7] hover:underline">
          Đăng ký
        </Link>
      </p>
    </div>
  )
}

export default LoginPage
