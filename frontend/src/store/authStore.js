import { create } from 'zustand';
import userService from '../services/userService';

const useAuthStore = create((set) => ({
    user: null,
    isInitialized: false, // Đánh dấu đã kiểm tra token khi load trang chưa

    fetchUser: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            set({ user: null, isInitialized: true });
            return null;
        }

        try {
            const response = await userService.getMyInfo();
            if (response.result) {
                set({ user: response.result, isInitialized: true });
                return response.result;
            }
        } catch (error) {
            console.error("Lỗi khi tải thông tin user:", error);
            localStorage.removeItem('token');
            set({ user: null, isInitialized: true });
        }
        return null;
    },

    logout: () => {
        localStorage.removeItem('token');
        set({ user: null });
        window.location.href = '/'; // Quay về trang chủ
    },

    setUser: (userData) => set({ user: userData }),
}));

export default useAuthStore;
