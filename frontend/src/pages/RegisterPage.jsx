import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setPending(true)
    try {
      await register({ email: email.trim(), password, fullName: fullName.trim() })
      navigate('/login', { state: { registered: true } })
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md">
      <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">Đăng ký</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Họ tên</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-[#5b6ef7] focus:ring-1 focus:ring-[#5b6ef7]"
          />
        </div>
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
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-[#5b6ef7] focus:ring-1 focus:ring-[#5b6ef7]"
          />
          <p className="mt-1 text-xs text-gray-500">
            Ít nhất 8 ký tự, gồm chữ thường, HOA, số và ký tự đặc biệt (theo rule backend).
          </p>
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[#5b6ef7] py-2.5 font-semibold text-white transition-colors hover:bg-[#4a5ce6] disabled:opacity-60"
        >
          {pending ? 'Đang xử lý…' : 'Tạo tài khoản'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">
        Đã có tài khoản?{' '}
        <Link to="/login" className="font-medium text-[#5b6ef7] hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  )
}

export default RegisterPage
