import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Thêm interceptor để gắn token vào request nếu có
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Thêm interceptor để xử lý lỗi response (401)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token hết hạn hoặc không hợp lệ
            localStorage.removeItem('token');
            // Bắn sự kiện mở modal đăng nhập
            window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: 'login' }));
            // Nếu đang ở trang cần bảo vệ (như profile), đẩy về trang chủ
            if (window.location.pathname.includes('/profile')) {
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
