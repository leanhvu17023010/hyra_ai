import { useEffect } from "react"
import axios from "axios"

import { FcGoogle } from "react-icons/fc"

function GoogleLogin() {

  useEffect(() => {

    const script = document.createElement("script")
    // Tạo thẻ HTML <script> với src là Google Identity Services
    script.src =
      "https://accounts.google.com/gsi/client"

    script.async = true
    script.defer = true // cách load script không chặn render trang
    

    document.body.appendChild(script)

    script.onload = () => {

      window.google.accounts.id.initialize({

        client_id:
          import.meta.env.VITE_GOOGLE_CLIENT_ID,

        callback: handleGoogleLogin

      })

    }

  }, [])

  const handleGoogleLogin = async (response) => {

    try {

      console.log(response)

      /*
        response.credential
        là Google token
      */

      // GỬI BACKEND

      const res = await axios.post(

        "http://localhost:8080/auth/google",

        {
          token: response.credential
        }

      )

      console.log(res.data)

      // LƯU JWT

      localStorage.setItem(
        "token",
        res.data.token
      )

      // reload hoặc redirect

      window.location.reload()

    }

    catch (error) {

      console.log(error)

    }

  }

  const handleClick = () => {

    window.google.accounts.id.prompt()

  }

  return (

    <button

      onClick={handleClick}
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
            cursor-pointer
          "
        >
          <FcGoogle className="w-6 h-6"></FcGoogle>
          Đăng nhập bằng Google
        </button>
  )

}

export default GoogleLogin