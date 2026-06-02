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
    uploadMediaToTask: async (file, taskId, role) => {
        const formData = new FormData();
        formData.append('file', file);
        if (taskId) {
            formData.append('taskId', taskId);
        }
        if (role) {
            formData.append('role', role);
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
     * Lịch sử swap: gộp dữ liệu từ BE và localStorage (để hiển thị cả XTTS và Whisper).
     * @returns {Promise<{ result: SwapHistoryItem[] }>}
     */
    getSwapHistory: async () => {
        let beHistory = [];
        try {
            const response = await api.get('/swap/tasks/history');
            if (Array.isArray(response.data?.result)) {
                beHistory = response.data.result;
            }
        } catch {
            /* BE chưa có endpoint hoặc lỗi */
        }

        const localHistory = getSwapHistoryLocal();
        const mergedMap = new Map();

        // 1. Nạp local history
        localHistory.forEach((item) => {
            mergedMap.set(item.id, item);
        });

        // 2. Nạp BE history (ưu tiên BE nếu trùng ID)
        beHistory.forEach((item) => {
            mergedMap.set(item.id, {
                ...item,
                mediaType: item.mediaType || (isVideoResultUrl(item.resultUrl) ? 'video' : 'image'),
            });
        });

        const mergedList = Array.from(mergedMap.values());

        // 3. Sắp xếp theo ngày tạo mới nhất lên đầu
        mergedList.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
        });

        return { result: mergedList };
    },

    getStats: async () => {
        let beStats = { imageSwapCount: 0, videoSwapCount: 0 };
        try {
            const response = await api.get('/swap/tasks/stats');
            if (response.data?.result != null && typeof response.data.result === 'object') {
                beStats = response.data.result;
            }
        } catch {
            /* fallback */
        }

        const historyRes = await swapService.getSwapHistory();
        const mergedHistory = historyRes.result || [];
        const computedStats = computeStatsFromHistory(mergedHistory);

        return {
            result: {
                imageSwapCount: Math.max(beStats.imageSwapCount || 0, computedStats.imageSwapCount || 0),
                videoSwapCount: Math.max(beStats.videoSwapCount || 0, computedStats.videoSwapCount || 0),
                audioCount: computedStats.audioCount || 0,
                subtitleCount: computedStats.subtitleCount || 0,
            },
        };
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
