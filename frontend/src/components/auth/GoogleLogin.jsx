import { useEffect } from "react"
import authService from "../../services/authService"
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

      const idToken = response.credential;

      // Decode JWT payload để lấy email và userName (hỗ trợ Unicode cho tiếng Việt)
      const base64Url = idToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const payload = JSON.parse(jsonPayload);
      
      console.log("Google User Data:", payload);

      // Gửi về Backend thông qua authService
      await authService.loginWithGoogle(
        idToken,
        payload.email,
        payload.name
      );

      // Thành công thì reload lại trang để cập nhật trạng thái login
      window.location.reload();

    }

    catch (error) {

      console.error("Lỗi đăng nhập Google:", error);

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