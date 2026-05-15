import api from './api';

/** @typedef {{ status?: string, progress?: number | null, resultUrl?: string | null }} SwapTaskStatus */

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
    },

    /**
     * Lấy trạng thái task (status, progress 0–100) do BE cập nhật từ máy AI.
     * @returns {Promise<{ result?: SwapTaskStatus }>}
     */
    getTaskStatus: async (taskId) => {
        const response = await api.get(`/swap/tasks/${taskId}/status`);
        return response.data;
    },

    getResultBlobUrlFromPath: async (resultUrl) => {
        const response = await api.get(resultUrl, { responseType: 'blob' });
        return URL.createObjectURL(response.data);
    },
};

export default swapService;
