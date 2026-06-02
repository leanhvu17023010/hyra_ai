import api from './api';

const megaWorkflowService = {
    /**
     * Khởi tạo Mega Workflow bằng cách tải trực tiếp các tệp tin lên.
     * @param {File} targetVideo - Video gốc cần xử lý
     * @param {File} voiceSample - File ghi âm giọng mẫu để clone
     * @param {File} sourceFace - Ảnh khuôn mặt để swap (Tùy chọn)
     * @param {string} inputText - Nội dung kịch bản cần đọc
     */
    uploadAndStart: async (targetVideo, voiceSample, sourceFace, inputText) => {
        const formData = new FormData();
        formData.append('targetVideo', targetVideo);
        formData.append('voiceSample', voiceSample);
        if (sourceFace) {
            formData.append('sourceFace', sourceFace);
        }
        formData.append('inputText', inputText);

        const response = await api.post('/mega-workflow/upload-and-start', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data; // Trả về { code, message, result: taskId }
    },

    /**
     * Khởi tạo Mega Workflow từ các file đã có trong thư viện media
     */
    start: async (sourceFaceId, targetVideoId, voiceSampleId, inputText) => {
        const response = await api.post('/mega-workflow/start', {
            sourceFaceId,
            targetVideoId,
            voiceSampleId,
            inputText
        });
        return response.data;
    },

    /**
     * Lấy trạng thái xử lý chi tiết của MegaTask
     */
    getTaskStatus: async (taskId) => {
        const response = await api.get(`/mega-workflow/tasks/${taskId}/status`);
        return response.data;
    }
};

export default megaWorkflowService;
