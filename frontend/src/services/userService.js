import api from './api';

const userService = {
    getMyInfo: async () => {
        const response = await api.get('/users/my-info');
        return response.data;
    }
};

export default userService;
