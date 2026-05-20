import { useState } from "react"
import { FiLock, FiEye, FiEyeOff, FiX } from "react-icons/fi"
import authService from "../services/authService"
import { resetPasswordSchema, validate } from "../utils/validation"

function ResetPasswordModal({ email, otp, onClose, onSwitch }) {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [globalError, setGlobalError] = useState("")

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setErrors({})
    setGlobalError("")

    const validation = await validate(resetPasswordSchema, { newPassword, confirmPassword })
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    setLoading(true)
    try {
      const response = await authService.resetPassword(email, otp, newPassword)
      if (response.code === 200 || response.result === "OK") {
        alert("Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới.")
        onSwitch('login')
      } else {
        setGlobalError(response.message || "Đặt lại mật khẩu thất bại")
      }
    } catch (err) {
      setGlobalError("Đã có lỗi xảy ra. Vui lòng thử lại sau.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-140 bg-white dark:bg-gray-800 dark:text-white backdrop-blur-xl rounded-3xl p-10 relative shadow-[0_20px_80px_rgba(0,0,0,0.25)] transition-all duration-300">
        <button onClick={onClose} className="absolute top-5 right-5 text-2xl text-zinc-400 hover:text-black transition-all">
          <FiX />
        </button>

        <h2 className="text-4xl font-bold text-center py-5 mb-5 text-gray-900 dark:text-white">Đặt lại mật khẩu</h2>
        <p className="text-center text-zinc-500 mb-10">Nhập mật khẩu mới cho tài khoản {email}</p>

        {globalError && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-xl text-sm text-center">
            {globalError}
          </div>
        )}

        <form onSubmit={handleResetPassword}>
          {/* NEW PASSWORD */}
          <div className="relative mb-6 py-2">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-zinc-400" />
            <input
              type={showPass ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mật khẩu mới"
              className={`w-full pl-12 pr-4 py-4 rounded-2xl border ${errors.newPassword ? 'border-red-500' : 'border-zinc-300'} dark:border-zinc-600 bg-white dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-300 transition-all`}
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute top-1/2 -translate-y-1/2 right-4 text-zinc-400 hover:text-zinc-600">
              {showPass ? <FiEyeOff /> : <FiEye />}
            </button>
            {errors.newPassword && <p className="text-red-500 text-sm mt-2">{errors.newPassword}</p>}
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="relative mb-8 py-2">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-zinc-400" />
            <input
              type={showConfirmPass ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Xác nhận mật khẩu"
              className={`w-full pl-12 pr-4 py-4 rounded-2xl border ${errors.confirmPassword ? 'border-red-500' : 'border-zinc-300'} dark:border-zinc-600 bg-white dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-300 transition-all`}
            />
            <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute top-1/2 -translate-y-1/2 right-4 text-zinc-400 hover:text-zinc-600">
              {showConfirmPass ? <FiEyeOff /> : <FiEye />}
            </button>
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-2">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-2xl bg-blue-800 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-lg font-semibold hover:scale-[1.02] transition-all duration-300 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ResetPasswordModal
