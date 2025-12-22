import axios from 'axios';
import { logger } from '../utils/logger';

const BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:3000';

const api = axios.create({
    baseURL: BASE,
    timeout: 5000, // fail fast so auth checks don't hang the app
    headers: {
        'Content-Type': 'application/json',
    },
});

export function setAuthToken (token: string | null) {
    if (token) {
        api.defaults.headers.common[ 'Authorization' ] = `Bearer ${ token }`;
        localStorage.setItem('authToken', token);
    } else {
        delete api.defaults.headers.common[ 'Authorization' ];
        localStorage.removeItem('authToken');
    }
}

// Initialize auth token from storage when explicitly requested.
// Accessing `localStorage` at module import time can break server-side
// rendering or some test runners. Call `initAuthFromStorage()` from
// application startup (for example in `main.tsx`) to restore any saved token.
export function initAuthFromStorage () {
    try {
        const stored = localStorage.getItem('authToken');
        if (stored) setAuthToken(stored);
    } catch (e) {
        // ignore (no localStorage available)
    }
}

// Optional handler that the app can register to receive auth-failure notifications
let onAuthFailure: (() => void) | null = null;
export function setAuthFailureHandler (fn: (() => void) | null) {
    onAuthFailure = fn;
}

// Axios response interceptor: attempt token refresh on 401, otherwise notify auth failure
api.interceptors.response.use(
    (res) => res,
    (error) => {
        // If the server returns 401, there's no refresh flow in this simple
        // service — notify the application to perform logout/cleanup.
        try {
            if (error?.response?.status === 401 && onAuthFailure) {
                try { onAuthFailure(); } catch (e) {}
            } else {
                // report non-auth errors
                logger.reportError({ message: error?.message || 'API error', meta: { url: error?.config?.url, status: error?.response?.status }, level: 'error' });
            }
        } catch (e) {}
        return Promise.reject(error);
    }
);

export default api;
