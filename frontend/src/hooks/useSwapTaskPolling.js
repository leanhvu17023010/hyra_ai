import { useCallback, useEffect, useRef } from 'react';
import swapService from '../services/swapService';
import { isTaskComplete, isTaskFailed, parseProgressPercent } from '../utils/taskProgress';

const DEFAULT_INTERVAL_MS = 2000;
const DEFAULT_MAX_ATTEMPTS = 300;

/**
 * Poll GET /swap/tasks/{id}/status cho đến khi hoàn tất, thất bại hoặc hết thời gian.
 */
export function useSwapTaskPolling({
    onProgress,
    onComplete,
    onFailed,
    onTimeout,
    pollIntervalMs = DEFAULT_INTERVAL_MS,
    maxAttempts = DEFAULT_MAX_ATTEMPTS,
}) {
    const intervalRef = useRef(null);
    const attemptsRef = useRef(0);

    const stopPolling = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        attemptsRef.current = 0;
    }, []);

    const pollOnce = useCallback(
        async (taskId) => {
            const { result: task } = await swapService.getTaskStatus(taskId);

            const pct = parseProgressPercent(task?.progress);
            if (pct != null) {
                onProgress?.(pct, task);
            }

            if (isTaskFailed(task?.status)) {
                stopPolling();
                onFailed?.(task);
                return;
            }

            if (isTaskComplete(task?.status) || task?.resultUrl) {
                stopPolling();
                await onComplete?.(taskId, task);
            }
        },
        [onProgress, onComplete, onFailed, stopPolling]
    );

    const startPolling = useCallback(
        (taskId) => {
            stopPolling();

            const tick = async () => {
                attemptsRef.current += 1;
                if (attemptsRef.current > maxAttempts) {
                    stopPolling();
                    onTimeout?.();
                    return;
                }

                try {
                    await pollOnce(taskId);
                } catch (error) {
                    const status = error?.response?.status;
                    if (status !== 404) {
                        console.warn('Poll task status:', status ?? error?.message);
                    }
                }
            };

            tick();
            intervalRef.current = setInterval(tick, pollIntervalMs);
        },
        [stopPolling, pollOnce, maxAttempts, onTimeout, pollIntervalMs]
    );

    useEffect(() => () => stopPolling(), [stopPolling]);

    return { startPolling, stopPolling };
}
