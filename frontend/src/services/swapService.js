import api from './api';
import {
    addSwapHistoryEntry,
    computeStatsFromHistory,
    getSwapHistoryLocal,
} from '../utils/swapHistoryStorage';
import { isVideoResultUrl } from '../utils/mediaUrl';

/** @typedef {{ status?: string, progress?: number | null, resultUrl?: string | null }} SwapTaskStatus */
/** @typedef {{ id: string, resultUrl: string, mediaType?: 'image' | 'video', status?: string, createdAt?: string }} SwapHistoryItem */

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

    /** Ghi lịch sử swap vào localStorage (dùng khi BE chưa có API history). */
    saveCompletedTaskToHistory: (taskId, resultUrl, mediaType) => {
        if (!taskId || !resultUrl) return;
        addSwapHistoryEntry({
            id: taskId,
            resultUrl,
            mediaType: mediaType || (isVideoResultUrl(resultUrl) ? 'video' : 'image'),
            status: 'Complete',
        });
    },

    /**
     * Lịch sử swap: ưu tiên BE, fallback localStorage.
     * @returns {Promise<{ result: SwapHistoryItem[] }>}
     */
    getSwapHistory: async () => {
        try {
            const response = await api.get('/swap/tasks/history');
            if (Array.isArray(response.data?.result)) {
                return response.data;
            }
        } catch {
            /* BE chưa có endpoint — dùng local theo tài khoản */
        }
        return { result: getSwapHistoryLocal() };
    },

    getStats: async () => {
        try {
            const response = await api.get('/swap/tasks/stats');
            if (response.data?.result != null && typeof response.data.result === 'object') {
                return response.data;
            }
        } catch {
            /* fallback */
        }
        const history = getSwapHistoryLocal();
        return { result: computeStatsFromHistory(history) };
    },

    downloadResult: async (resultUrl, filename = 'swap-result') => {
        const response = await api.get(resultUrl, { responseType: 'blob' });
        const blobUrl = URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        link.click();
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    },
};

export default swapService;
