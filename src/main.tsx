import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ErrorBoundary from '@/components/ErrorBoundary';
import ErrorModalManager from '@/components/ErrorModalManager';
import AuthProvider from '@/auth/AuthContext';

const queryClient = new QueryClient();

// Global error handlers to catch errors that might not be caught by React
if (typeof window !== 'undefined') {
    window.addEventListener('error', (ev) => {
        // eslint-disable-next-line no-console
        console.error('Window error:', ev.error || ev.message);
        import('./utils/logger').then(({ logger }) => {
            logger.reportError({ message: ev?.error?.message || String(ev?.message), stack: ev?.error?.stack, level: 'error' });
        }).catch(() => {});
        import('./utils/errorModal').then(({ showError }) => {
            showError({ title: 'An unexpected error occurred', message: String(ev?.message || ev?.error?.message) });
        }).catch(() => {});
    });

    window.addEventListener('unhandledrejection', (ev) => {
        // eslint-disable-next-line no-console
        console.error('Unhandled promise rejection:', ev.reason);
        import('./utils/logger').then(({ logger }) => {
            logger.reportError({ message: String(ev?.reason?.message || ev?.reason), meta: ev?.reason, level: 'error' });
        }).catch(() => {});
    });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ErrorBoundary>
            <QueryClientProvider client={ queryClient }>
                <BrowserRouter future={ { v7_startTransition: true, v7_relativeSplatPath: true } }>
                    <AuthProvider>
                        <App />
                        {/* Global error modal manager */ }
                        <ErrorModalManager />
                    </AuthProvider>
                </BrowserRouter>
            </QueryClientProvider>
        </ErrorBoundary>
    </React.StrictMode>,
);
