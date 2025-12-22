import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import CoinPackage from '../components/recharge/CoinPackage';
import { toast } from 'react-hot-toast';
import { useAuth } from '../auth/AuthContext';
import { ROUTES } from '../constants/routes';
import { creditWallet, getWallet } from '../api/wallet';

const PACKAGES = [
    { id: '1', coins: 100, price: 10 },
    { id: '2', coins: 500, price: 45, bonus: 50 },
    { id: '3', coins: 1000, price: 80, bonus: 150 },
    { id: '4', coins: 2500, price: 190, bonus: 400 },
    { id: '5', coins: 5000, price: 350, bonus: 1000 },
    { id: '6', coins: 10000, price: 650, bonus: 2500 },
];

export default function RechargePage () {
    const [ selectedId, setSelectedId ] = useState<string | null>(null);
    const [ isLoading, setIsLoading ] = useState(false);
    const [ balance, setBalance ] = useState<number | null>(null);
    const navigate = useNavigate();
    const { user, loading } = useAuth();
    const location = useLocation();

    useEffect(() => {
        const preserved = (location.state as any)?.selectedId as string | undefined;
        if (preserved) setSelectedId(preserved);
    }, [ location ]);

    useEffect(() => {
        if (user) {
            getWallet().then(data => setBalance(data.wallet.balance)).catch(() => {});
        }
    }, [ user ]);

    const handleRecharge = async () => {
        if (!selectedId) {
            toast.error('Please select a package');
            return;
        }

        const pkg = PACKAGES.find(p => p.id === selectedId);
        if (!pkg) return;

        if (loading) {
            toast.loading('Checking authentication...');
            return;
        }

        if (!user) {
            toast.error('Please log in to proceed to payment');
            // pass a next parameter so the user can return to recharge after logging in
            // include selected package id so the selection can be restored if needed
            navigate(ROUTES.LOGIN, { state: { next: ROUTES.RECHARGE, selectedId: selectedId } });
            return;
        }

        setIsLoading(true);
        try {
            const totalCoins = pkg.coins + (pkg.bonus || 0);
            const data = await creditWallet(totalCoins, `Recharge: ${ pkg.coins } Coins package`);
            setBalance(data.wallet.balance);
            toast.success('Recharge successful! 🪙');
        } catch (err: any) {
            toast.error(err.response?.data?.error?.message || 'Recharge failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="py-12 bg-background">
            <Container>
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-bold mb-4">Recharge Coins</h1>
                    <p className="text-text-secondary max-w-xl mx-auto">
                        Purchase digital coins to send gifts to your favorite speakers and unlock premium features!
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    { PACKAGES.map((pkg) => (
                        <CoinPackage
                            key={ pkg.id }
                            { ...pkg }
                            isSelected={ selectedId === pkg.id }
                            onClick={ () => setSelectedId(pkg.id) }
                        />
                    )) }
                </div>

                <div className="max-w-md mx-auto bg-white rounded-[2rem] p-8 shadow-xl border border-border">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-text-secondary font-medium">Current Balance</span>
                        <div className="flex items-center gap-1 font-bold text-xl">
                            <span>🪙</span>
                            <span>{ balance !== null ? balance.toLocaleString() : '...' }</span>
                        </div>
                    </div>

                    <div className="border-t border-border pt-6 mb-8">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-text-secondary">Selected Package</span>
                            <span className="font-bold">
                                { selectedId ? `${ PACKAGES.find((p) => p.id === selectedId)?.coins } Coins` : 'None' }
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-text-secondary">Total Amount</span>
                            <span className="text-2xl font-bold text-primary">
                                ₹{ selectedId ? PACKAGES.find((p) => p.id === selectedId)?.price : '0' }
                            </span>
                        </div>
                    </div>

                    <Button variant="gradient" className="w-full py-4 text-lg" onClick={ handleRecharge } isLoading={ isLoading } disabled={ !selectedId }>
                        Proceed to Pay
                    </Button>

                    <p className="mt-4 text-center text-xs text-text-muted">
                        Secure payment powered by Razorpay. By proceeding, you agree to our Terms of Service.
                    </p>
                </div>
            </Container>
        </div>
    );

}
