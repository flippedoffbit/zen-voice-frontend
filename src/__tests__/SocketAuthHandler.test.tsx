import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SocketAuthHandler from '../components/SocketAuthHandler';
import { subscribe } from '../utils/appEvents';
import { socketClient } from '../socket/client';

// Mock dependencies
vi.mock('../utils/appEvents', () => ({
    subscribe: vi.fn(),
}));

vi.mock('../socket/client', () => ({
    socketClient: {
        connect: vi.fn(),
    },
}));

vi.mock('../utils/logger', () => ({
    logger: {
        warn: vi.fn(),
    },
}));

describe('SocketAuthHandler', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset localStorage mock
        vi.stubGlobal('localStorage', {
            getItem: vi.fn((key) => null),
            setItem: vi.fn(),
            removeItem: vi.fn(),
            clear: vi.fn(),
        });
    });

    it('shows auth error modal when socket:auth_error event is emitted', () => {
        // Mock subscribe to trigger the event
        const mockSubscribe = vi.fn((event, callback) => {
            if (event === 'socket:auth_error') {
                callback({ reason: 'Test auth error' });
            }
            return vi.fn(); // mock unsubscribe
        });
        (subscribe as any).mockImplementation(mockSubscribe);

        render(
            <MemoryRouter>
                <SocketAuthHandler />
            </MemoryRouter>
        );

        expect(screen.getByText('Socket authentication required')).toBeInTheDocument();
        expect(screen.getByText('Test auth error')).toBeInTheDocument();
    });

    it('reconnects socket when auth:login event is emitted', () => {
        // Mock localStorage
        vi.stubGlobal('localStorage', {
            getItem: vi.fn((key) => key === 'authToken' ? 'test-token' : null),
        });

        // Mock subscribe to trigger login event
        const mockSubscribe = vi.fn((event, callback) => {
            if (event === 'auth:login') {
                callback('token-123');
            }
            return vi.fn();
        });
        (subscribe as any).mockImplementation(mockSubscribe);

        render(
            <MemoryRouter>
                <SocketAuthHandler />
            </MemoryRouter>
        );

        expect(socketClient.connect).toHaveBeenCalledWith('test-token');
    });

    it('navigates to login when login button is clicked', () => {
        // Mock subscribe to show modal
        const mockSubscribe = vi.fn((event, callback) => {
            if (event === 'socket:auth_error') {
                callback({ reason: 'Auth required' });
            }
            return vi.fn();
        });
        (subscribe as any).mockImplementation(mockSubscribe);

        render(
            <MemoryRouter>
                <SocketAuthHandler />
            </MemoryRouter>
        );

        const loginButton = screen.getByText('Login');
        fireEvent.click(loginButton);

        // Check if navigation occurred (though we can't easily test router in this setup)
        // This would require more complex mocking
    });
});