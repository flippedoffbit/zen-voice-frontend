import '../setupTests';
import { setAuthToken } from '../api/client';

describe('api client', () => {
    afterEach(() => {
        localStorage.removeItem('authToken');
    });

    it('sets auth token in localStorage and headers', () => {
        setAuthToken('test-token');
        expect(localStorage.getItem('authToken')).toBe('test-token');
    });
});
