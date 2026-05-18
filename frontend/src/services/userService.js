import api from './api';

const userService = {
    getMyInfo: async () => {
        const response = await api.get('/users/my-info');
        return response.data;
    },

    changePassword: async (currentPassword, newPassword) => {
        const response = await api.post('/auth/change-password', {
            currentPassword,
            newPassword,
        });
        return response.data;
    },
};

export default userService;
