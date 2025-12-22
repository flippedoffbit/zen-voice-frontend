import React, { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Spinner from '../ui/Spinner';

interface WalletModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (amount: number, description: string) => Promise<void>;
    title: string;
    confirmText: string;
    type: 'credit' | 'debit';
    currentBalance: number;
}

export const WalletModal: React.FC<WalletModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    confirmText,
    type,
    currentBalance
}) => {
    const [ amount, setAmount ] = useState('');
    const [ description, setDescription ] = useState('');
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState<string | null>(null);
    const [ showConfirmation, setShowConfirmation ] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseInt(amount, 10);

        if (isNaN(numAmount) || numAmount <= 0) {
            setError('Amount must be a positive integer');
            return;
        }

        if (type === 'debit' && numAmount > currentBalance * 0.5 && !showConfirmation) {
            setShowConfirmation(true);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await onConfirm(numAmount, description);
            onClose();
            setAmount('');
            setDescription('');
            setShowConfirmation(false);
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" role="dialog">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                <h2 className="mb-4 text-xl font-bold text-gray-900">{ title }</h2>

                <form onSubmit={ handleSubmit } className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Amount (Points)</label>
                        <Input
                            type="number"
                            value={ amount }
                            onChange={ (e) => setAmount(e.target.value) }
                            placeholder="e.g. 100"
                            disabled={ loading }
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                        <Input
                            type="text"
                            value={ description }
                            onChange={ (e) => setDescription(e.target.value) }
                            placeholder="e.g. Reward"
                            disabled={ loading }
                        />
                    </div>

                    { error && <p className="text-sm text-red-600">{ error }</p> }

                    { showConfirmation && (
                        <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
                            Warning: You are about to use more than 50% of your balance. Are you sure?
                        </div>
                    ) }

                    <div className="flex justify-end space-x-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={ onClose }
                            disabled={ loading }
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={ loading }
                        >
                            { loading ? <Spinner size="sm" className="mr-2" /> : null }
                            { showConfirmation ? 'Yes, Confirm' : confirmText }
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
