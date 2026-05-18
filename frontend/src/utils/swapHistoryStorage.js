const STORAGE_KEY = 'hyra_swap_history';
const MAX_ITEMS = 50;

export function getSwapHistoryLocal() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const list = raw ? JSON.parse(raw) : [];
        return Array.isArray(list) ? list : [];
    } catch {
        return [];
    }
}

export function addSwapHistoryEntry(entry) {
    const list = getSwapHistoryLocal().filter((item) => item.id !== entry.id);
    list.unshift({
        ...entry,
        createdAt: entry.createdAt || new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_ITEMS)));
}

export function computeStatsFromHistory(history) {
    return history.reduce(
        (acc, item) => {
            if (item.mediaType === 'video') {
                acc.videoSwapCount += 1;
            } else {
                acc.imageSwapCount += 1;
            }
            return acc;
        },
        { imageSwapCount: 0, videoSwapCount: 0 }
    );
}
