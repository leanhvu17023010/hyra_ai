import api from './api';

const userService = {
    getMyInfo: async () => {
        const response = await api.get('/users/my-info');
        return response.data;
    },

    changePassword: async (oldPassword, newPassword) => {
        const response = await api.post('/users/change-password', {
            oldPassword,
            newPassword
        });
        return response.data;
    }
};

export default userService;
