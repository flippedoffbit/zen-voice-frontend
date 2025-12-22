import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { getWallet } from '../../api/wallet';
import { useAuth } from '../../auth/AuthContext';

export const BalanceWidget: React.FC = () => {
    const { user } = useAuth();
    const [ balance, setBalance ] = useState<number | null>(null);

    useEffect(() => {
        if (user) {
            getWallet()
                .then(data => setBalance(data.wallet.balance))
                .catch(() => setBalance(null));
        }
    }, [ user ]);

    if (!user) return null;

    return (
        <Link
            to={ ROUTES.WALLET }
            className="flex items-center space-x-2 rounded-full bg-indigo-50 px-3 py-1 transition-colors hover:bg-indigo-100"
        >
            <span className="text-xs font-medium text-indigo-600">Balance:</span>
            <span className="text-sm font-bold text-indigo-700">
                { balance !== null ? `${ balance } pts` : '...' }
            </span>
        </Link>
    );
};
