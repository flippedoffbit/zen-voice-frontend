import api from './client';

export interface Wallet {
    id: string;
    userId: string;
    balance: number;
    createdAt: string;
    updatedAt: string;
}

export interface Transaction {
    id: string;
    walletId: string;
    amount: number;
    type: 'CREDIT' | 'DEBIT';
    description?: string;
    createdAt: string;
}

export async function getWallet () {
    const res = await api.get<{ success: boolean; wallet: Wallet; }>('/wallet');
    return res.data;
}

export async function creditWallet (amount: number, description?: string) {
    const res = await api.post<{ success: boolean; wallet: Wallet; }>('/wallet/credit', { amount, description });
    return res.data;
}

export async function debitWallet (amount: number, description?: string) {
    const res = await api.post<{ success: boolean; wallet: Wallet; }>('/wallet/debit', { amount, description });
    return res.data;
}

export async function getTransactions () {
    const res = await api.get<{ success: boolean; transactions: Transaction[]; }>('/wallet/transactions');
    return res.data;
}
