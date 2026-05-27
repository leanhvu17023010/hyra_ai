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

    getAllUsers: async () => {
        const response = await api.get('/users');
        return response.data;
    },

    deleteUser: async (userId) => {
        const response = await api.delete(`/users/${userId}`);
        return response.data;
    },

    updateUser: async (userId, data) => {
        const response = await api.put(`/users/${userId}`, data);
        return response.data;
    },

    getRoles: async () => {
        const response = await api.get('/users/roles');
        return response.data;
    },
};

export default userService;
