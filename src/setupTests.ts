import React from 'react';
import { vi, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Global mock for framer-motion to avoid DOM API issues in test env
vi.mock('framer-motion', () => ({
    motion: new Proxy({}, {
        get: (_, prop) => (props: any) => React.createElement(prop as string, props, props.children),
    }),
}));

// Ensure we clean up DOM between tests to avoid duplicate nodes /
// leftover renders causing `getBy*` multiple matches.
afterEach(() => {
    try { cleanup(); } catch (e) {}
    try { if (globalThis.document && globalThis.document.body) globalThis.document.body.innerHTML = ''; } catch (e) {}
    try { vi.restoreAllMocks(); } catch (e) {}
});

// Provide a simple localStorage polyfill for test environments that don't
// automatically provide one (some CI/test runners may omit it).
if (typeof globalThis.localStorage === 'undefined' || typeof globalThis.localStorage.setItem !== 'function') {
    let _store: Record<string, string> = {};
    // @ts-ignore
    globalThis.localStorage = {
        getItem: (k: string) => (_store[ k ] ?? null),
        setItem: (k: string, v: string) => { _store[ k ] = String(v); },
        removeItem: (k: string) => { delete _store[ k ]; },
        clear: () => { _store = {}; }
    };
}

// Minimal mediaDevices stub (tests can override/remove it as needed).
if (typeof globalThis.navigator !== 'undefined' && typeof globalThis.navigator.mediaDevices === 'undefined') {
    // @ts-ignore
    globalThis.navigator.mediaDevices = undefined;
}

import '@testing-library/jest-dom';
