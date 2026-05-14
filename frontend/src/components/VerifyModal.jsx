import { useState, useRef, useEffect } from "react"
import { FiX, FiArrowLeft, FiShield } from "react-icons/fi"
import authService from "../services/authService"

function VerifyModal({ email, otpMode, username, password, onClose, onSwitch }) {
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [timer, setTimer] = useState(60)
  const inputRefs = useRef([])

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(countdown)
  }, [])

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newCode = [...code]
    newCode[index] = value.slice(-1)
    setCode(newCode)

    if (value && index < 5) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus()
    }
  }

  const handleVerify = async () => {
    const fullCode = code.join("")
    if (fullCode.length < 6) {
      setError("Vui lòng nhập đầy đủ mã xác thực.")
      return
    }

    setLoading(true)
    setError("")
    
    try {
      const response = await authService.verifyOtp(email, fullCode)
      if (response.code === 200) {

        if (otpMode === 'register') {
          const registerRes = await authService.register(email, password, username);
          if (registerRes.code === 200 || registerRes.result) {
            alert("Đăng ký tài khoản thành công! Vui lòng đăng nhập.");
            onSwitch('login');
          } else {
            setError(registerRes.message || "Đăng ký thất bại");
          }
        } else {
          // Mode khác (ví dụ: quên mật khẩu)
          alert("Xác thực thành công!");
          onClose();
        }
      } else {
        setError(response.message || "Mã xác thực không chính xác")
      }
    } catch (err) {
      setError("Đã có lỗi xảy ra. Vui lòng thử lại sau.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (timer > 0) return
    setLoading(true)
    setError("")
    try {
      const response = await authService.sendOtp(email, otpMode)
      if (response.code === 200) {
        setTimer(60)
        alert("Mã mới đã được gửi!")
      } else {
        setError(response.message || "Không thể gửi lại mã")
      }
    } catch (err) {
      setError("Đã có lỗi xảy ra.")
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
          onClick={() => onSwitch('register')}
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

        <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-800 text-3xl">
                <FiShield />
            </div>
        </div>

        <h2 className="text-4xl font-bold text-center mb-4">
          Xác thực mã
        </h2>
        <p className="text-center text-zinc-500 mb-10 px-10">
          Chúng tôi đã gửi mã xác thực gồm 6 chữ số đến email của bạn.
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-100 text-red-600 rounded-xl text-sm text-center">
            {error}
          </div>
        )}

        <div className="flex justify-between gap-2 mb-10">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="
                w-14
                h-16
                text-center
                text-2xl
                font-bold
                rounded-xl
                border
                border-zinc-300
                focus:border-blue-800
                focus:ring-4
                focus:ring-blue-100
                outline-none
                transition-all
              "
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          disabled={loading}
          className={`w-full py-4 rounded-2xl bg-blue-800 hover:bg-blue-600 text-white text-lg font-semibold hover:scale-[1.02] cursor-pointer transition-all duration-300 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {loading ? "Đang kiểm tra..." : "Xác nhận"}
        </button>

        <div className="text-center mt-8">
            <p className="text-zinc-500">
                Không nhận được mã?{" "}
                <button
                    onClick={handleResend}
                    disabled={timer > 0}
                    className={`font-semibold transition-all ${timer > 0 ? "text-zinc-400" : "text-blue-800 hover:underline cursor-pointer"}`}
                >
                    Gửi lại {timer > 0 && `(${timer}s)`}
                </button>
            </p>
        </div>
      </div>
    </div>
  )
}

export default VerifyModal
