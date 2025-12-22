import React, { useEffect, useState } from 'react';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { WalletModal } from '../components/wallet/WalletModal';
import { getWallet, getTransactions, creditWallet, debitWallet, Wallet, Transaction } from '../api/wallet';
import { useAuth } from '../auth/AuthContext';

const WalletPage: React.FC = () => {
    const { user } = useAuth();
    const [ wallet, setWallet ] = useState<Wallet | null>(null);
    const [ transactions, setTransactions ] = useState<Transaction[]>([]);
    const [ loading, setLoading ] = useState(true);
    const [ modalConfig, setModalConfig ] = useState<{ type: 'credit' | 'debit'; isOpen: boolean; } | null>(null);

    const fetchData = async () => {
        try {
            const [ walletData, transData ] = await Promise.all([
                getWallet(),
                getTransactions()
            ]);
            setWallet(walletData.wallet);
            setTransactions(transData.transactions);
            console.log('Transactions:', transData.transactions);
        } catch (err) {
            console.error('Failed to fetch wallet data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Update wallet balance when user balance changes (from socket events)
    useEffect(() => {
        if (user?.balance !== undefined && wallet) {
            setWallet(prev => prev ? { ...prev, balance: user.balance! } : null);
        }
    }, [ user?.balance ]);

    const handleCredit = async (amount: number, description: string) => {
        // Optimistic update
        if (wallet) {
            const oldBalance = wallet.balance;
            setWallet({ ...wallet, balance: oldBalance + amount });
            try {
                const data = await creditWallet(amount, description);
                setWallet(data.wallet);
                // Refresh transactions
                const transData = await getTransactions();
                setTransactions(transData.transactions);
            } catch (err) {
                setWallet({ ...wallet, balance: oldBalance });
                throw err;
            }
        }
    };

    const handleDebit = async (amount: number, description: string) => {
        // Optimistic update
        if (wallet) {
            const oldBalance = wallet.balance;
            setWallet({ ...wallet, balance: oldBalance - amount });
            try {
                const data = await debitWallet(amount, description);
                setWallet(data.wallet);
                // Refresh transactions
                const transData = await getTransactions();
                setTransactions(transData.transactions);
            } catch (err) {
                setWallet({ ...wallet, balance: oldBalance });
                throw err;
            }
        }
    };

    const canCredit = user?.role === 'SYSTEM_ADMIN' || user?.canManageWallets;

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <Container className="py-8">
            <div className="mb-8 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-indigo-100">Available Balance</p>
                        <h1 className="text-5xl font-extrabold tracking-tight">
                            { wallet?.balance ?? 0 } <span className="text-2xl font-normal text-indigo-200">Points</span>
                        </h1>
                    </div>
                    <div className="mt-6 flex space-x-4 md:mt-0">
                        { canCredit && (
                            <Button
                                onClick={ () => setModalConfig({ type: 'credit', isOpen: true }) }
                                className="bg-white text-indigo-600 hover:bg-indigo-50"
                            >
                                Add Points
                            </Button>
                        ) }
                        <Button
                            onClick={ () => setModalConfig({ type: 'debit', isOpen: true }) }
                            variant="outline"
                            className="border-white text-white hover:bg-white hover:text-indigo-600"
                        >
                            Use Points
                        </Button>
                    </div>
                </div>
            </div>

            <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
                </div>
                <div className="divide-y divide-gray-100">
                    { transactions.length === 0 ? (
                        <div className="px-6 py-12 text-center text-gray-500">
                            No transactions yet.
                        </div>
                    ) : (
                        transactions.map((t) => (
                            <div key={ t.id } className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className={ `flex h-10 w-10 items-center justify-center rounded-full ${ t.type.toUpperCase() === 'CREDIT' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                        }` }>
                                        { t.type.toUpperCase() === 'CREDIT' ? '+' : '-' }
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{ t.description || (t.type.toUpperCase() === 'CREDIT' ? 'Points Added' : 'Points Used') }</p>
                                        <p className="text-xs text-gray-500">{ new Date(t.createdAt).toLocaleString() }</p>
                                    </div>
                                </div>
                                <div className={ `text-lg font-bold ${ t.type.toUpperCase() === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                                    }` }>
                                    { t.type.toUpperCase() === 'CREDIT' ? '+' : '-' }{ t.amount }
                                </div>
                            </div>
                        ))
                    ) }
                </div>
            </div>

            { modalConfig && (
                <WalletModal
                    isOpen={ modalConfig.isOpen }
                    onClose={ () => setModalConfig(null) }
                    onConfirm={ modalConfig.type === 'credit' ? handleCredit : handleDebit }
                    title={ modalConfig.type === 'credit' ? 'Add Points' : 'Use Points' }
                    confirmText={ modalConfig.type === 'credit' ? 'Add Points' : 'Use Points' }
                    type={ modalConfig.type }
                    currentBalance={ wallet?.balance ?? 0 }
                />
            ) }
        </Container>
    );
};

export default WalletPage;
