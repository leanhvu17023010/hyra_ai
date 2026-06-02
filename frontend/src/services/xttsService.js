import api from './api';

const xttsService = {
    // Tạo một task XTTS mới
    createTtsTask: async () => {
        const response = await api.post('/xtts/tasks');
        return response.data;
    },

    // Tải tệp giọng mẫu lên cho task XTTS
    uploadVoiceToTtsTask: async (file, taskId) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('taskId', taskId);
        formData.append('role', 'audio');

        const response = await api.post('/media/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Bắt đầu xử lý XTTS (gửi văn bản)
    processTtsTask: async (taskId, text, language = 'vi') => {
        const formData = new FormData();
        formData.append('text', text);
        formData.append('language', language);

        const response = await api.post(`/xtts/tasks/${taskId}/process`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Lấy trạng thái của task XTTS
    getTtsTaskStatus: async (taskId) => {
        const response = await api.get(`/xtts/tasks/${taskId}/status`);
        return response.data;
    },
};

export default xttsService;
