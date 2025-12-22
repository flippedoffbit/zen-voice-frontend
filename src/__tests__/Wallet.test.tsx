import '../setupTests';
import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import WalletPage from '../pages/WalletPage';
import * as walletApi from '../api/wallet';
import { useAuth } from '../auth/AuthContext';

vi.mock('../api/wallet', () => ({
    getWallet: vi.fn(),
    getTransactions: vi.fn(),
    creditWallet: vi.fn(),
    debitWallet: vi.fn(),
}));

vi.mock('../auth/AuthContext', () => ({
    useAuth: vi.fn(),
}));

describe('WalletPage', () => {
    const mockWallet = {
        id: 'w1',
        userId: 'u1',
        balance: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    const mockTransactions = [
        {
            id: 't1',
            walletId: 'w1',
            amount: 50,
            type: 'CREDIT',
            description: 'Test Credit',
            createdAt: new Date().toISOString(),
        }
    ];

    beforeEach(() => {
        vi.resetAllMocks();
        (useAuth as any).mockReturnValue({
            user: { id: 'u1', role: 'SYSTEM_ADMIN' }
        });
        (walletApi.getWallet as any).mockResolvedValue({ success: true, wallet: mockWallet });
        (walletApi.getTransactions as any).mockResolvedValue({ success: true, transactions: mockTransactions });
    });

    it('renders balance and transactions', async () => {
        render(
            <MemoryRouter>
                <WalletPage />
            </MemoryRouter>
        );

        expect(await screen.findByText('100')).toBeInTheDocument();
        expect(screen.getByText('Test Credit')).toBeInTheDocument();
        expect(screen.getByText('+50')).toBeInTheDocument();
    });

    it('opens credit modal and performs credit', async () => {
        (walletApi.creditWallet as any).mockResolvedValue({
            success: true,
            wallet: { ...mockWallet, balance: 150 }
        });

        render(
            <MemoryRouter>
                <WalletPage />
            </MemoryRouter>
        );

        const addBtn = await screen.findByRole('button', { name: /^Add Points$/i });
        fireEvent.click(addBtn);

        const modal = screen.getByRole('dialog');
        const amountInput = within(modal).getByPlaceholderText(/e.g. 100/i);
        fireEvent.change(amountInput, { target: { value: '50' } });

        const confirmBtn = within(modal).getByRole('button', { name: /^Add Points$/i });
        fireEvent.click(confirmBtn);

        await waitFor(() => expect(walletApi.creditWallet).toHaveBeenCalledWith(50, ''));
        expect(await screen.findByText('150')).toBeInTheDocument();
    });

    it('shows confirmation for large debits', async () => {
        render(
            <MemoryRouter>
                <WalletPage />
            </MemoryRouter>
        );

        const useBtn = await screen.findByRole('button', { name: /Use Points/i });
        fireEvent.click(useBtn);

        const modal = screen.getByRole('dialog');
        const amountInput = within(modal).getByPlaceholderText(/e.g. 100/i);
        fireEvent.change(amountInput, { target: { value: '60' } }); // > 50% of 100

        // First click to trigger warning
        const submitBtn = within(modal).getByRole('button', { name: /Use Points/i });
        fireEvent.click(submitBtn);

        expect(within(modal).getByText(/Warning: You are about to use more than 50%/i)).toBeInTheDocument();

        const confirmBtn = within(modal).getByRole('button', { name: /Yes, Confirm/i });
        (walletApi.debitWallet as any).mockResolvedValue({
            success: true,
            wallet: { ...mockWallet, balance: 40 }
        });

        fireEvent.click(confirmBtn);
        await waitFor(() => expect(walletApi.debitWallet).toHaveBeenCalledWith(60, ''));
        expect(await screen.findByText('40')).toBeInTheDocument();
    });

    it('reverts balance on failure (optimistic UI)', async () => {
        (walletApi.debitWallet as any).mockRejectedValue(new Error('Failed'));

        render(
            <MemoryRouter>
                <WalletPage />
            </MemoryRouter>
        );

        const useBtn = await screen.findByRole('button', { name: /Use Points/i });
        fireEvent.click(useBtn);

        const modal = screen.getByRole('dialog');
        const amountInput = within(modal).getByPlaceholderText(/e.g. 100/i);
        fireEvent.change(amountInput, { target: { value: '10' } });

        const confirmBtn = within(modal).getByRole('button', { name: /Use Points/i });
        fireEvent.click(confirmBtn);

        await waitFor(() => expect(screen.getByText('100')).toBeInTheDocument());
    });
});
