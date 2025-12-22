import React from 'react';
import { logger } from '../utils/logger';

type State = { hasError: boolean; error?: Error | null; };

export default class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
    constructor(props: React.PropsWithChildren) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError (error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch (error: Error, info: React.ErrorInfo) {
        // Log error to console
        // eslint-disable-next-line no-console
        console.error('Uncaught error in React tree:', error, info);

        // Report to remote error service and show modal to user
        logger.reportError({ message: String(error?.message ?? 'Unknown error'), stack: error?.stack, meta: info, level: 'error' });

        import('../utils/errorModal').then(({ showError }) => {
            showError({ title: 'Something went wrong', message: String(error?.message ?? 'An unexpected error occurred') });
        }).catch(() => {});
    }

    render () {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center p-6 bg-white text-text-primary">
                    <div className="max-w-2xl">
                        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
                        <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-4 rounded-md overflow-auto">
                            { String(this.state.error) }
                        </pre>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
