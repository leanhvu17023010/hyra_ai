import { useState } from "react"
import { FiEye, FiEyeOff, FiLock, FiMail, FiX } from "react-icons/fi"

function RegisterModal({ onClose, onSwitch }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin.")
      return
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.")
      return
    }
    
    setLoading(true)
    setError("")
    
    // Giả lập đăng ký thành công
    setTimeout(() => {
      setLoading(false)
      onSwitch('verify')
    }, 1500)
  }

  return (
    <div
      className="
        fixed
        inset-0
        bg-black/50
        backdrop-blur-sm
        flex
        items-center
        justify-center
        z-50
      "
    >
      <div
        className="
          w-140
          bg-white
          backdrop-blur-xl
          rounded-3xl
          p-10
          relative
          shadow-[0_20px_80px_rgba(0,0,0,0.25)]
          transition-all
          duration-300
        "
      >
        <button
          onClick={onClose}
          className="
            absolute
            top-5
            right-5
            text-2xl
            text-zinc-400
            hover:text-black
            dark:hover:text-white
            transition-all
            duration-300
          "
        >
          <FiX />
        </button>

        <h2 className="text-4xl font-bold text-center py-5 mb-10">
          Đăng ký
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-xl text-sm text-center">
            {error}
          </div>
        )}

        <div className="relative mb-6 py-2">
          <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-zinc-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Địa chỉ email của bạn"
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
          />
        </div>

        <div className="relative mb-6 py-2">
          <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-zinc-400" />
          <input
            type={showPass ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mật khẩu"
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
          />
          <button onClick={() => setShowPass(!showPass)} className="absolute top-1/2 -translate-y-1/2 right-4 text-zinc-400 hover:text-zinc-600">
            {showPass ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>

        <div className="relative mb-8 py-2">
          <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-zinc-400" />
          <input
            type={showPass ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Xác nhận mật khẩu"
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
          />
        </div>

        <button
          onClick={handleRegister}
          disabled={loading}
          className={`w-full py-4 rounded-2xl bg-blue-800 hover:bg-blue-600 text-white text-lg font-semibold hover:scale-[1.02] cursor-pointer transition-all duration-300 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {loading ? "Đang xử lý..." : "Đăng ký"}
        </button>

        <p className="text-center py-3 text-zinc-500 mt-4">
          Đã có tài khoản?
          <span
            onClick={() => onSwitch('login')}
            className="text-blue-800 font-semibold ml-5 cursor-pointer hover:underline"
          >
            Đăng nhập ngay
          </span>
        </p>
      </div>
    </div>
  )
}

export default RegisterModal