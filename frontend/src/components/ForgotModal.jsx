import { useState } from "react"
import { FiMail, FiX, FiArrowLeft } from "react-icons/fi"
import authService from "../services/authService"
import { forgotSchema, validate } from "../utils/validation"

function ForgotModal({ onClose, onSwitch }) {
  const [email, setEmail] = useState("")
  const [errors, setErrors] = useState({})
  const [globalError, setGlobalError] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleResetPassword = async () => {
    setErrors({})
    setGlobalError("")

    const validation = await validate(forgotSchema, { email })
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }
    
    setLoading(true)
    try {
      const response = await authService.sendOtp(email, 'forgot')
      if (response.code === 200) {
        onSwitch('verify', { email, mode: 'forgot' })
      } else if (response.code === 400 && response.message?.includes("không tồn tại")) {
        // Email không tồn tại -> hiện ngay dưới ô email
        setErrors({ email: response.message })
      } else {
        setGlobalError(response.message || "Không thể gửi mã OTP")
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message
      if (errorMsg?.includes("không tồn tại")) {
        setErrors({ email: errorMsg })
      } else {
        setGlobalError(errorMsg || "Đã có lỗi xảy ra. Vui lòng thử lại sau.")
      }
      console.error(err)
    } finally {
      setLoading(false)
    }
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
          dark:bg-gray-800
          dark:text-white
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

        <button
          onClick={() => onSwitch('login')}
          className="
            absolute
            top-5
            left-5
            text-xl
            text-zinc-400
            hover:text-black
            flex items-center gap-2
            transition-all
            duration-300
            cursor-pointer
          "
        >
          <FiArrowLeft />
          <span className="text-sm font-medium">Quay lại</span>
        </button>

        <h2 className="text-4xl font-bold text-center py-5 mb-5 mt-4 text-gray-900 dark:text-white">
          Quên mật khẩu?
        </h2>
        <p className="text-center text-zinc-500 mb-10">
          Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
        </p>

        {globalError && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-xl text-sm text-center">
            {globalError}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-green-100 text-green-600 rounded-xl text-sm text-center">
            {message}
          </div>
        )}

        {!message && (
          <>
            <div className="relative mb-8 py-2">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-zinc-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Địa chỉ email của bạn"
                className={`
                  w-full
                  pl-12
                  pr-4
                  py-4
                  rounded-2xl
                  border
                  ${errors.email ? 'border-red-500' : 'border-zinc-300'}
                  dark:border-zinc-700
                  bg-white
                  dark:bg-gray-700
                  dark:text-white
                  outline-none
                  focus:ring-2
                  focus:ring-indigo-300
                  transition-all
                `}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-2">{errors.email}</p>
              )}
            </div>

            <button
              onClick={handleResetPassword}
              disabled={loading}
              className={`w-full py-4 rounded-2xl bg-blue-800 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-lg font-semibold hover:scale-[1.02] cursor-pointer transition-all duration-300 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading ? "Đang xử lý..." : "Gửi yêu cầu"}
            </button>
          </>
        )}

        <div className="text-center mt-8 py-2">
            <span
                onClick={() => onSwitch('login')}
                className="text-blue-800 dark:text-blue-400 font-semibold cursor-pointer hover:underline "
            >
                Quay lại Đăng nhập
            </span>
        </div>
      </div>
    </div>
  )
}

export default ForgotModal
