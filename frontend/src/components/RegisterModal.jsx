import { useState } from "react"
import {
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiUser,
  FiX
} from "react-icons/fi"

import authService from "../services/authService"
import { registerSchema, validate } from "../utils/validation"

function RegisterModal({ onClose, onSwitch }) {

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [showPass, setShowPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [agree, setAgree] = useState(false)
  const [loading, setLoading] = useState(false)


  const [errors, setErrors] = useState({})
  const [globalError, setGlobalError] = useState("")

  const handleRegister = async (e) => {
    e.preventDefault()

    // RESET ERRORS
    setErrors({})
    setGlobalError("")

    // VALIDATION - Sử dụng logic đã tách ra file riêng
    const validation = await validate(registerSchema, {
      username,
      email,
      password,
      confirmPassword,
      agree
    })

    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    setLoading(true)

    try {
      const response = await authService.sendOtp(email, "register")

      if (response.code === 200) {
        onSwitch("verify", {
          email,
          username,
          password,
          mode: "register"
        })
      } else {
        setGlobalError(response.message || "Không thể gửi mã OTP")
      }
    } catch (err) {
      console.error(err)
      setGlobalError("Đã có lỗi xảy ra. Vui lòng thử lại sau.")
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
          backdrop-blur-xl
          rounded-3xl
          p-10
          relative
          shadow-[0_20px_80px_rgba(0,0,0,0.25)]
          transition-all
          duration-300
        "
      >
        {/* CLOSE */}
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

        {/* TITLE */}
        <h2
          className="
            text-4xl
            font-bold
            text-center
            py-5
            mb-10
          "
        >
          Đăng ký
        </h2>

        {/* GLOBAL ERROR */}
        {globalError && (
          <div
            className="
              mb-4
              p-3
              bg-red-100
              text-red-600
              rounded-xl
              text-sm
              text-center
            "
          >
            {globalError}
          </div>
        )}

        {/* USERNAME */}
        <div className="relative mb-6 py-2">
          <FiUser
            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-xl
              text-zinc-400
            "
          />

          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Tên hiển thị"
            className={`
              w-full
              pl-12
              pr-4
              py-4
              rounded-2xl
              border
              ${errors.username ? 'border-red-500' : 'border-zinc-300'}
              dark:border-zinc-700
              bg-white
              outline-none
              focus:ring-2
              focus:ring-indigo-300
              transition-all
            `}
          />

          {errors.username && (
            <p className="text-red-500 text-sm mt-2">{errors.username}</p>
          )}
        </div>

        {/* EMAIL */}
        <div className="relative mb-6 py-2">
          <FiMail
            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-xl
              text-zinc-400
            "
          />

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

        {/* PASSWORD */}
        <div className="relative mb-6 py-2">
          <FiLock
            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-xl
              text-zinc-400
            "
          />

          <input
            type={showPass ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mật khẩu"
            className={`
              w-full
              pl-12
              pr-4
              py-4
              rounded-2xl
              border
              ${errors.password ? 'border-red-500' : 'border-zinc-300'}
              dark:border-zinc-700
              bg-white
              outline-none
              focus:ring-2
              focus:ring-indigo-300
              transition-all
            `}
          />

          <button
            onClick={() => setShowPass(!showPass)}
            type="button"
            className="
              absolute
              top-1/2
              -translate-y-1/2
              right-4
              text-zinc-400
              hover:text-zinc-600
            "
          >
            {showPass ? <FiEyeOff /> : <FiEye />}
          </button>

          {errors.password && (
            <p className="text-red-500 text-sm mt-2">{errors.password}</p>
          )}
        </div>

        {/* CONFIRM PASSWORD */}
        <div className="relative mb-6 py-2">
          <FiLock
            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-xl
              text-zinc-400
            "
          />

          <input
            type={showConfirmPass ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Xác nhận mật khẩu"
            className={`
              w-full
              pl-12
              pr-4
              py-4
              rounded-2xl
              border
              ${errors.confirmPassword ? 'border-red-500' : 'border-zinc-300'}
              dark:border-zinc-700
              bg-white
              outline-none
              focus:ring-2
              focus:ring-indigo-300
              transition-all
            `}
          />

          <button
            type="button"
            onClick={() => setShowConfirmPass(!showConfirmPass)}
            className="
              absolute
              top-1/2
              -translate-y-1/2
              right-4
              text-zinc-400
              hover:text-zinc-600
            "
          >
            {showConfirmPass ? <FiEyeOff /> : <FiEye />}
          </button>

          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-2">{errors.confirmPassword}</p>
          )}
        </div>

        {/* AGREE */}
        <div className="mb-6">
          <label
            className={`
              flex
              items-center
              gap-2
              ${errors.agree ? 'text-red-500' : 'text-zinc-500'}
            `}
          >
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            Tôi đồng ý với điều khoản
          </label>

          {errors.agree && (
            <p className="text-red-500 text-sm mt-2">{errors.agree}</p>
          )}
        </div>

        {/* REGISTER BUTTON */}
        <button
          onClick={handleRegister}
          disabled={loading}
          className={`
            w-full
            py-4
            rounded-2xl
            bg-blue-800
            hover:bg-blue-600
            text-white
            text-lg
            font-semibold
            hover:scale-[1.02]
            cursor-pointer
            transition-all
            duration-300
            ${loading ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          {loading ? "Đang xử lý..." : "Đăng ký"}
        </button>

        {/* LOGIN */}
        <p className="text-center py-3 text-zinc-500 mt-4">
          Đã có tài khoản?
          <span
            onClick={() => onSwitch("login")}
            className="
              text-blue-800
              font-semibold
              ml-5
              cursor-pointer
              hover:underline
            "
          >
            Đăng nhập ngay
          </span>
        </p>
      </div>
    </div>
  )
}

export default RegisterModal