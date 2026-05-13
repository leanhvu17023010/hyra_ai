import api from './api';

const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/token', { email, password });
        if (response.data.result.token) {
            localStorage.setItem('token', response.data.result.token);
        }
        return response.data;
    },

    loginWithGoogle: async (idToken, email, fullName) => {
        const response = await api.post('/auth/google', { idToken, email, fullName });
        if (response.data.result.token) {
            localStorage.setItem('token', response.data.result.token);
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
    }
};

export default authService;
