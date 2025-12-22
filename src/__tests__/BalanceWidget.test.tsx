/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BalanceWidget } from '../components/wallet/BalanceWidget';
import * as walletApi from '../api/wallet';
import { useAuth } from '../auth/AuthContext';

vi.mock('../api/wallet', () => ({
    getWallet: vi.fn(),
}));

vi.mock('../auth/AuthContext', () => ({
    useAuth: vi.fn(),
}));

describe('BalanceWidget', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('shows balance when user is logged in', async () => {
        (useAuth as any).mockReturnValue({ user: { id: 'u1' } });
        (walletApi.getWallet as any).mockResolvedValue({ success: true, wallet: { balance: 123 } });

        render(
            <MemoryRouter>
                <BalanceWidget />
            </MemoryRouter>
        );

        expect(await screen.findByText('123 pts')).toBeInTheDocument();
    });

    it('renders nothing when user is logged out', async () => {
        (useAuth as any).mockReturnValue({ user: null });

        render(
            <MemoryRouter>
                <BalanceWidget />
            </MemoryRouter>
        );

        expect(screen.queryByText(/pts/)).not.toBeInTheDocument();
    });
});
