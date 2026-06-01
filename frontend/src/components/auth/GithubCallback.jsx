import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import authService from "../../services/authService";
import useAuthStore from "../../store/authStore";

function GithubCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");

    if (code) {
      const handleGithubLogin = async () => {
        try {
          // Gửi code lên Backend để trao đổi JWT
          const result = await authService.loginWithGithub(code);

          if (result.result.authenticated) {
            // Lấy thông tin user và chuyển hướng dựa theo Role
            const user = await useAuthStore.getState().fetchUser();
            if (user && user.role && user.role.name === 'ADMIN') {
              window.location.href = '/admin';
            } else {
              window.location.href = '/';
            }
          } else {
            setError("Xác thực GitHub thất bại.");
          }
        } catch (err) {
          console.error("Lỗi đăng nhập GitHub:", err);
          setError(err.response?.data?.message || "Đăng nhập bằng GitHub thất bại. Vui lòng thử lại.");
        }
      };

      handleGithubLogin();
    } else {
      setError("Không tìm thấy mã code xác thực từ GitHub.");
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
      {error ? (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-6 rounded-2xl max-w-md shadow-lg border border-red-200 dark:border-red-800">
          <h3 className="text-xl font-bold mb-2">Lỗi Đăng Nhập</h3>
          <p>{error}</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="mt-4 px-6 py-2 bg-blue-800 text-white rounded-xl hover:bg-blue-700 transition"
          >
            Quay lại trang chủ
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-800"></div>
          <p className="text-lg font-medium text-zinc-600 dark:text-zinc-400">
            Đang xử lý đăng nhập bằng GitHub, vui lòng chờ trong giây lát...
          </p>
        </div>
      )}
    </div>
  );
}

export default GithubCallback;
