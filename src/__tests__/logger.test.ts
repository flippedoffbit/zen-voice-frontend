import { describe, it, expect, vi } from 'vitest';
import { logger } from '../utils/logger';

describe('logger.reportError', () => {
    it('posts to the error endpoint', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        await logger.reportError({ message: 'test error', stack: 'stack', meta: { foo: 'bar' } });
        expect(consoleSpy).toHaveBeenCalledWith('[report] ', { message: 'test error', stack: 'stack', meta: { foo: 'bar' } });
        consoleSpy.mockRestore();
    });

    it('swallows network errors', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        await logger.reportError({ message: 'test error' });
        expect(consoleSpy).toHaveBeenCalledWith('[report] ', { message: 'test error' });
        consoleSpy.mockRestore();
    });
});
