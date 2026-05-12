import {
  FiX,
  FiMail,
  FiLock
} from "react-icons/fi"

function LoginModal({ open, setOpen }) {

  if (!open) return null

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

      {/* BOX */}
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
          onClick={() => setOpen(false)}
          className="
            absolute
            top-5
            right-5

            text-2xl
            text-zinc-400

            hover:text-black
            dark:hover:text-white

            hover:rotate-90
            hover:scale-110

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
          Đăng nhập
        </h2>


        {/* GOOGLE */}
        <button
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
            transition-all
            duration-300
          "
        >

          <img
            src="https://www.google.com/favicon.ico"
            alt="google"
            className="w-6 h-6"
          />

          Đăng nhập bằng Google

        </button>

        {/* OR */}
        <div
          className="
            flex
            items-center
            gap-4

            my-8
          "
        >
          <div className="flex-1 h-px bg-zinc-300 dark:bg-zinc-700" />
          <span className="text-zinc-400 text-lg">
            hoặc
          </span>
          <div className="flex-1 h-px bg-zinc-300 dark:bg-zinc-700" />

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
            placeholder="Địa chỉ email của bạn"

            className="
              w-full
              pl-12
              pr-4
              py-4
              rounded-2xl
              border
              border-zinc-300
              dark:border-zinc-700
              bg-white
              outline-none
              focus:ring-4
              focus:ring-orange-200
              dark:focus:ring-orange-500/20
              transition-all
            "
          />

        </div>

        {/* PASSWORD */}
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
            type="password"
            placeholder="Mật khẩu của bạn"

            className="
              w-full

              pl-12
              pr-4
              py-4

              rounded-2xl

              border
              border-zinc-300
              dark:border-zinc-700
              bg-white
              outline-none

              focus:ring-4
              focus:ring-orange-200
              dark:focus:ring-orange-500/20

              transition-all
            "
          />

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
            className="
              text-orange-500
              hover:underline
            "
          >
            Quên mật khẩu?
          </button>

        </div>

        {/* LOGIN */}
        <button
          className="
            w-full

            py-4

            rounded-2xl

            bg-orange-500
            hover:bg-orange-600

            text-white
            text-lg
            font-semibold

            hover:scale-[1.02]

            transition-all
            duration-300
          "
        >
          Đăng nhập
        </button>

        {/* REGISTER */}
        <p
          className="
            text-center
            py-3
            text-zinc-500

            mt-8
          "
        >
          Chưa có tài khoản?

          <span
            className="
              text-orange-500
              font-semibold
              ml-2
              cursor-pointer

              hover:underline
            "
          >
            Đăng ký ngay
          </span>
        </p>

      </div>

    </div>
  )
}

export default LoginModal