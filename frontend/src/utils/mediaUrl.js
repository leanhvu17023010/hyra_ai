const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

/** URL đầy đủ cho file static từ BE (vd. /uploads/...). */
export function resolveMediaUrl(path) {
    if (!path) return '';
    //Blob giong như URL tạm thời trên trình duyệt, không cần thêm base
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
        return path;
    }
    const base = API_BASE.replace(/\/$/, '');
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${base}${normalized}`;
}

export function isVideoResultUrl(url) {
    return /\.(mp4|webm|mov)(\?|$)/i.test(url || '');
}
