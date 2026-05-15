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
        const response = await api.get(`/swap/tasks/${taskId}`);
        return response.data;
    },

    // Kiểm tra xem video kết quả đã tồn tại chưa (kèm token)
    pingResultVideo: async (taskId) => {
        const response = await api.head(`/uploads/results/final_result_${taskId}.mp4`);
        return response.status === 200;
    },
    //polling để kiểm tra kết quả video đã sẵn sàng chưa

    // tải video kết quả về dưới dạng Blob URL (kèm token)
    getResultVideoBlobUrl: async (taskId) => {
        const response = await api.get(`/uploads/results/final_result_${taskId}.mp4`, {
            responseType: 'blob'
            // blob: dữ liệu nhị phân: ảnh, video
        });
        return URL.createObjectURL(response.data);
    },

    pingResultImage: async (taskId) => {
        const response = await api.head(`/uploads/results/final_result_${taskId}.jpg`);
        return response.status === 200;
    },

    getResultImageBlobUrl: async (taskId) => {
        const response = await api.get(`/uploads/results/final_result_${taskId}.jpg`, {
            responseType: 'blob',
        });
        return URL.createObjectURL(response.data);
    },

    getResultBlobUrlFromPath: async (resultUrl) => {
        const response = await api.get(resultUrl, { responseType: 'blob' });
        return URL.createObjectURL(response.data);
    },
};

export default swapService;
