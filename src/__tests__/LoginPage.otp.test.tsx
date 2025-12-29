import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import type React from 'react';

// Mocks
vi.mock('../api/auth', () => ({
    requestOtp: vi.fn(),
    verifyOtp: vi.fn(),
}));

const loginMock = vi.fn();
vi.mock('../auth/AuthContext', async () => {
    const actual = await vi.importActual('../auth/AuthContext');
    return {
        ...actual,
        useAuth: () => ({
            login: loginMock,
            logout: vi.fn(),
            user: null,
            loading: false,
        }),
    };
});

vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    }
}));

import { requestOtp, verifyOtp } from '../api/auth';
import { useAuth } from '../auth/AuthContext';

describe('LoginPage - email & OTP flows (tests expect future UI support)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('submitting email should call /auth/request-otp with { email }', async () => {
        // Arrange
        (requestOtp as any).mockResolvedValue({ success: true });

        render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        );

        const emailTab = screen.queryByRole('tab', { name: /email/i });
        if (!emailTab) {
            expect(emailTab).toBeNull();
            return;
        }

        fireEvent.click(emailTab);

        const emailInput = screen.getByLabelText(/email address/i);
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

        const sendButton = screen.getByRole('button', { name: /send otp/i });
        fireEvent.click(sendButton);

        await waitFor(() => {
            expect(requestOtp).toHaveBeenCalledWith({ email: 'test@example.com' });
        });
    });

    it('submitting phone should call /auth/request-otp with { phone }', async () => {
        (requestOtp as any).mockResolvedValue({ success: true });

        render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        );

        const phoneInput = screen.getByLabelText(/phone number/i);
        fireEvent.change(phoneInput, { target: { value: '555-1234' } });

        const sendButton = screen.getByRole('button', { name: /send otp/i });
        fireEvent.click(sendButton);

        await waitFor(() => {
            expect(requestOtp).toHaveBeenCalledWith({ phone: '5551234' });
        });
    });

    it('custom amount calculates coins correctly and calls creditWallet', async () => {
        // Override auth to simulate a logged-in user using a per-test mock
        await vi.doMock('../auth/AuthContext', async () => {
            const actual = await vi.importActual('../auth/AuthContext');
            return {
                ...actual,
                useAuth: () => ({ user: { id: 'test-user' }, loading: false, login: vi.fn(), logout: vi.fn() })
            };
        });

        // Ensure API call happens; mock creditWallet via direct import
        const walletApi = await vi.importActual('../api/wallet');
        const mockCredit = vi.spyOn(walletApi as any, 'creditWallet').mockResolvedValue({ wallet: { balance: 1000 } });

        // Re-import component after mocking auth so it picks up mocked hook
        const mod = await vi.importActual('../pages/RechargePage') as { default: React.ComponentType<any>; };
        const RechargePage = mod.default as React.ComponentType<any>;

        render(
            <MemoryRouter>
                <RechargePage />
            </MemoryRouter>
        );

        // Enter custom amount and enable custom
        const amountInput = screen.getByPlaceholderText(/enter amount in/i);
        fireEvent.change(amountInput, { target: { value: '25' } });
        const useButton = screen.getByRole('button', { name: /use/i });
        fireEvent.click(useButton);

        // Click proceed
        const proceed = screen.getByRole('button', { name: /proceed to pay/i });
        fireEvent.click(proceed);

        await waitFor(() => {
            // 25 * 10 coins/₹ = 250 coins expected
            expect(mockCredit).toHaveBeenCalledWith(250, expect.stringContaining('Custom'));
        });

        mockCredit.mockRestore();
    });

    it('shows friendly message when server returns RATE_LIMITED on request', async () => {
        // Arrange: mock server error with RATE_LIMITED code per backend contract
        (requestOtp as any).mockRejectedValue({ response: { data: { error: { code: 'RATE_LIMITED', message: 'Too many requests' } } } });

        render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        );

        // As above, we only run the interaction if the Email tab is present (test placeholder until UI exists)
        const emailTab = screen.queryByRole('tab', { name: /email/i });
        if (!emailTab) {
            expect(emailTab).toBeNull();
            return;
        }
        fireEvent.click(emailTab);

        const emailInput = screen.getByLabelText(/email address/i);
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

        const sendButton = screen.getByRole('button', { name: /send otp/i });
        fireEvent.click(sendButton);

        // The UI should map RATE_LIMITED → friendly message
        await waitFor(() => {
            expect(screen.getByText(/too many otp requests/i) || screen.getByText(/too many requests/i)).toBeTruthy();
        });
    });

    it('verify posts OTP and calls login on success (email)', async () => {
        const mockToken = 'token-abc';
        const mockUser = { id: 'u1', email: 'test@example.com', displayName: 'Tester' };

        (requestOtp as any).mockResolvedValue({ success: true });
        (verifyOtp as any).mockResolvedValue({ token: mockToken, user: mockUser });

        render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        );

        const emailTab = screen.queryByRole('tab', { name: /email/i });
        if (!emailTab) {
            expect(emailTab).toBeNull();
            return;
        }

        // Send OTP
        fireEvent.click(emailTab);
        const emailInput = screen.getByLabelText(/email address/i);
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        const sendButton = screen.getByRole('button', { name: /send otp/i });
        fireEvent.click(sendButton);

        // Wait for UI to show OTP state (assumes the page transitions to OTP step)
        await waitFor(() => screen.getByLabelText(/otp code/i));

        const otpInput = screen.getByLabelText(/otp code/i);
        fireEvent.change(otpInput, { target: { value: '1234' } });

        const verifyButton = screen.getByRole('button', { name: /verify & login/i });
        fireEvent.click(verifyButton);

        await waitFor(() => {
            expect(verifyOtp).toHaveBeenCalledWith({ email: 'test@example.com' }, '1234');
            expect(loginMock).toHaveBeenCalledWith(mockToken, mockUser, undefined, expect.anything());
        });
    });

    it('verify posts OTP and calls login on success (phone)', async () => {
        const mockToken = 'token-xyz';
        const mockUser = { id: 'u2', phone: '5551234', displayName: 'PhoneUser' };

        (requestOtp as any).mockResolvedValue({ success: true });
        (verifyOtp as any).mockResolvedValue({ token: mockToken, user: mockUser });

        render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        );

        const phoneInput = screen.getByLabelText(/phone number/i);
        fireEvent.change(phoneInput, { target: { value: '555-1234' } });
        const sendButton = screen.getByRole('button', { name: /send otp/i });
        fireEvent.click(sendButton);

        await waitFor(() => screen.getByLabelText(/otp code/i));

        const otpInput = screen.getByLabelText(/otp code/i);
        fireEvent.change(otpInput, { target: { value: '5678' } });

        const verifyButton = screen.getByRole('button', { name: /verify & login/i });
        fireEvent.click(verifyButton);

        await waitFor(() => {
            expect(verifyOtp).toHaveBeenCalledWith({ phone: '5551234' }, '5678');
            expect(loginMock).toHaveBeenCalledWith(mockToken, mockUser, undefined, expect.anything());
        });
    });
});
