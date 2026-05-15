/** Chuẩn hoá progress từ API (0–100). */
export function parseProgressPercent(value) {
    if (value == null || value === '') {
        return null;
    }
    const n = Number(value);
    if (Number.isNaN(n)) {
        return null;
    }
    if (n >= 0 && n <= 1) {
        return Math.round(n * 100);
    }
    return Math.max(0, Math.min(100, Math.round(n)));
}

export function isTaskComplete(status) {
    const s = String(status || '').toUpperCase();
    return s === 'COMPLETE' || s === 'COMPLETED';
}

export function isTaskFailed(status) {
    const s = String(status || '').toUpperCase();
    return s === 'FAILED' || s === 'ERROR';
}
