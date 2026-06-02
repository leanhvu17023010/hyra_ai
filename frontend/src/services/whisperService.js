import api from './api';

const whisperService = {
    /**
     * Tạo một task Whisper mới.
     */
    createTask: async () => {
        const response = await api.post('/whisper/tasks');
        return response.data; // Trả về { code, message, result: taskId }
    },

    /**
     * Upload file âm thanh gán vào taskId tương ứng.
     */
    uploadAudio: async (file, taskId) => {
        const formData = new FormData();
        formData.append('file', file);
        if (taskId) {
            formData.append('taskId', taskId);
        }
        formData.append('role', 'audio');

        const response = await api.post('/media/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    /**
     * Kích hoạt xử lý Whisper chuyển đổi âm thanh thành văn bản.
     */
    processTask: async (taskId) => {
        const response = await api.post(`/whisper/tasks/${taskId}/process`);
        return response.data;
    },

    /**
     * Lấy trạng thái của task Whisper.
     */
    getTaskStatus: async (taskId) => {
        const response = await api.get(`/whisper/tasks/${taskId}/status`);
        return response.data;
    },

    /**
     * Lấy danh sách lịch sử Whisper của user.
     */
    getHistory: async () => {
        const response = await api.get('/whisper/tasks/history');
        return response.data; // Trả về { code, message, result: WhisperTaskResponse[] }
    }
};

export default whisperService;
