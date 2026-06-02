const STORAGE_PREFIX = 'hyra_swap_history';
const MAX_ITEMS = 50;

/** JWT `sub` = email đăng nhập (backend). Mỗi tài khoản một bucket lịch sử. */
export function getSwapAccountKeyFromToken() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return null;
        const parts = token.split('.');
        if (parts.length < 2) return null;
        let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const pad = b64.length % 4;
        if (pad) b64 += '='.repeat(4 - pad);
        const payload = JSON.parse(atob(b64));
        const sub = payload.sub;
        return typeof sub === 'string' && sub.length > 0 ? sub : null;
    } catch {
        return null;
    }
}

function storageKeyForAccount(accountKey) {
    if (!accountKey) return null;
    return `${STORAGE_PREFIX}:${accountKey}`;
}

export function getSwapHistoryLocal(accountKey = getSwapAccountKeyFromToken()) {
    const key = storageKeyForAccount(accountKey);
    if (!key) return [];
    try {
        const raw = localStorage.getItem(key);
        const list = raw ? JSON.parse(raw) : [];
        return Array.isArray(list) ? list : [];
    } catch {
        return [];
    }
}

export function addSwapHistoryEntry(entry, accountKey = getSwapAccountKeyFromToken()) {
    const key = storageKeyForAccount(accountKey);
    if (!key) return;
    const list = getSwapHistoryLocal(accountKey).filter((item) => item.id !== entry.id);
    list.unshift({
        ...entry,
        createdAt: entry.createdAt || new Date().toISOString(),
    });
    localStorage.setItem(key, JSON.stringify(list.slice(0, MAX_ITEMS)));
}

export function computeStatsFromHistory(history) {
    return history.reduce(
        (acc, item) => {
            if (item.mediaType === 'video') {
                acc.videoSwapCount += 1;
            } else if (item.mediaType === 'audio') {
                acc.audioCount += 1;
            } else if (item.mediaType === 'subtitle') {
                acc.subtitleCount += 1;
            } else {
                acc.imageSwapCount += 1;
            }
            return acc;
        },
        { imageSwapCount: 0, videoSwapCount: 0, audioCount: 0, subtitleCount: 0 }
    );
}
