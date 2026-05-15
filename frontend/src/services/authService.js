import api from './api';

const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/token', { email, password });
        if (response.data.result.token) {
            localStorage.setItem('token', response.data.result.token);
        }
        return response.data;
    },

    loginWithGoogle: async (idToken, email, userName) => {
        const response = await api.post('/auth/google', { idToken, email, userName });
        if (response.data.resslt.token) {
            localStorage.setItem('token', response.data.result.token);
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
    },

    sendOtp: async (email, mode = '') => {
        const response = await api.post(`/auth/send-otp?email=${email}&mode=${mode}`);
        return response.data;
    },

    verifyOtp: async (email, otp) => {
        const response = await api.post('/auth/verify-otp', { email, otp });
        return response.data;
    },

    register: async (email, password, userName) => {
        const response = await api.post('/users', {
            email,
            password,
            userName,
            roleName: 'USER'
        });
        return response.data;
    },

    resetPassword: async (email, otp, newPassword) => {
        const response = await api.post('/auth/reset-password', {
            email,
            otp,
            newPassword
        });
        return response.data;
    }
};

export default authService;
