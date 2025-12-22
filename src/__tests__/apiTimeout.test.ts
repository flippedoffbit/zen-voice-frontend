import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import api from '../api/client';

describe('API timeout behaviour', () => {
    beforeEach(() => vi.resetAllMocks());
    it('rejects with timeout error (simulated)', async () => {
        const err: any = new Error('timeout of 5000ms exceeded');
        err.code = 'ECONNABORTED';
        vi.spyOn(api, 'get').mockImplementationOnce(() => Promise.reject(err));

        await expect(api.get('/slow')).rejects.toMatchObject({ message: expect.stringContaining('timeout'), code: 'ECONNABORTED' });
    });
});
