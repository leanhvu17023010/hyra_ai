import api from './api';

const swapService = {
    // Tạo một phiên swap mới, trả về taskId
    createSwapTask: async () => {
        const response = await api.post('/swap/tasks');
        return response.data;
    },

    // Tải file lên và gắn vào taskId tương ứng
    uploadMediaToTask: async (file, taskId) => {
        const formData = new FormData();
        formData.append('file', file);
        if (taskId) {
            formData.append('taskId', taskId);
        }

        const response = await api.post('/media/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};

export default swapService;
