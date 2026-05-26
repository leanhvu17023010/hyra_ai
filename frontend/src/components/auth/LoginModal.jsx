import { useState } from "react"
import { FcGoogle } from "react-icons/fc"
import { useGoogleLogin } from "@react-oauth/google"
import axios from "axios"
import authService from "../../services/authService"
import { loginSchema, validate } from "../../utils/validation"
import {
  FiX,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff
} from "react-icons/fi"
import { motion } from "framer-motion"

function LoginModal({ onClose, onSwitch }) {
  const [showPass, setShowPass] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [globalError, setGlobalError] = useState("")


  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true)
      setGlobalError("")
      setErrors({})
      try {
        // Lấy thông tin user từ Google bằng access_token
        const res = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        })

        const { email, name, sub } = res.data
        const result = await authService.loginWithGoogle(sub, email, name)

        if (result.result.authenticated) {
          onClose()
          window.location.reload() // Hoặc chuyển hướng
        }
      } catch (err) {
        console.error("Lỗi đăng nhập Google:", err)
        setGlobalError("Đăng nhập Google thất bại. Vui lòng thử lại.")
      } finally {
        setLoading(false)
      }
    },
    onError: () => {
      setGlobalError("Đăng nhập Google thất bại.")
    },
  });

  const handleLogin = async () => {
    setErrors({})
    setGlobalError("")

    const validation = await validate(loginSchema, { email, password })
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    setLoading(true)
    try {
      const result = await authService.login(email, password)
      if (result.result.authenticated) {
        onClose()
        window.location.reload()
      }
    } catch (err) {
      console.error("Lỗi đăng nhập:", err)
      setGlobalError(err.response?.data?.message || "Email hoặc mật khẩu không chính xác.")
    } finally {
      setLoading(false)
    }
  }

  // Không cần kiểm tra !open ở đây vì modal được render có điều kiện từ MainLayout

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
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
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
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

        <h2
          className="text-4xl font-bold text-center py-5 mb-10 text-gray-900 dark:text-white">
          Đăng nhập
        </h2>


        {/* GOOGLE */}
        <button
          onClick={() => login()}
          className="
            w-full
            py-4
            
            rounded-2xl

            border
            border-zinc-300
            dark:border-zinc-700
            flex
            items-center
            justify-center
            gap-3
            text-lg
            font-medium
            hover:bg-zinc-100
            dark:hover:bg-zinc-700
            dark:text-white
            transition-all
            duration-300
            cursor-pointer
          "
        >
          <FcGoogle className="w-6 h-6"></FcGoogle>
          Đăng nhập bằng Google
        </button>

        <div className=" flex items-center gap-4 my-8 ">

          <div className="flex-1 h-px bg-zinc-300 dark:bg-zinc-700" />
          <span className="text-zinc-400 text-lg">
            hoặc
          </span>
          <div className="flex-1 h-px bg-zinc-300 dark:bg-zinc-700" />

        </div>

        {globalError && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-xl text-sm text-center">
            {globalError}
          </div>
        )}

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
              dark:bg-gray-700
              dark:text-white
              outline-none
              focus:ring-2
              focus:ring-indigo-300
              dark:focus:ring-indigo-500/20
              transition-all
            `}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-2">{errors.email}</p>
          )}
        </div>

          <div className="relative mb-8 py-5">

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
            type= {showPass ? "text": "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mật khẩu của bạn"
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
              dark:bg-gray-700
              dark:text-white
              outline-none
              focus:ring-2
              focus:ring-indigo-300
              dark:focus:ring-indigo-500/20
              transition-all
            `}
          />
          <button onClick={()=> setShowPass(!showPass)} 
          className="absolute top-1/2 -translate-y-1/2 right-4 text-zinc-400 hover:text-zinc-600 transition-all">
            {showPass ? <FiEyeOff /> : <FiEye />}
          </button>
          {errors.password && (
            <p className="text-red-500 text-sm mt-2">{errors.password}</p>
          )}
        </div>

        {/* OPTIONS */}
        <div
          className="
            flex
            items-center
            justify-between
            py-3
            mb-8
          "
        >

          <label
            className="
              flex
              items-center
              gap-2

              text-zinc-500
            "
          >

            <input type="checkbox" />

            Ghi nhớ tôi

          </label>

          <button
            onClick={() => onSwitch('forgot')}
            className="
              text-blue-800
              dark:text-blue-400
              hover:underline
              cursor-pointer
            "
          >
            Quên mật khẩu?
          </button>

        </div>

        {/* LOGIN */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className={`
            w-full
            py-4
            rounded-2xl
            bg-blue-800
            hover:bg-blue-600
            dark:bg-blue-600
            dark:hover:bg-blue-500
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
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </button>

        {/* REGISTER */}
        <p
          className="
            text-center
            py-3
            text-zinc-500
            mt-4

          "
        >
          Chưa có tài khoản?

          <span
            onClick={() => onSwitch('register')}
            className="
              text-blue-800
              dark:text-blue-400
              font-semibold
              ml-5
              cursor-pointer

              hover:underline
            "
          >
            Đăng ký ngay
          </span>
        </p>

      </motion.div>
    </motion.div>
  )
}

export default LoginModal