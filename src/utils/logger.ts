type ErrorPayload = {
    message: string;
    stack?: string | null;
    meta?: any;
    level?: 'error' | 'warn' | 'info' | 'debug';
};

export const logger = {
    info: (...args: any[]) => console.info('[app] ', ...args),
    warn: (...args: any[]) => console.warn('[app] ', ...args),
    debug: (...args: any[]) => console.debug('[app] ', ...args),
    error: (...args: any[]) => console.error('[app] ', ...args),

    async reportError (payload: ErrorPayload) {
        // Log locally only
        console.error('[report] ', payload);
    }
};

export default logger;
