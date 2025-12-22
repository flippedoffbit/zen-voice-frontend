import { useState } from 'react';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { User, Camera, LogOut, Shield, Bell, CreditCard } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

export default function ProfilePage () {
    const [ isLoading, setIsLoading ] = useState(false);
    const navigate = useNavigate();
    const [ name, setName ] = useState('Hridyansh');

    const handleUpdateProfile = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            toast.success('Profile updated successfully!');
        }, 1000);
    };

    const handleLogout = () => {
        toast.success('Logged out successfully');
        navigate(ROUTES.HOME);
    };

    return (
        <div className="py-12 bg-background">
            <Container className="max-w-4xl">
                <h1 className="text-3xl font-bold mb-8">My Profile</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Sidebar */ }
                    <div className="md:col-span-1 space-y-4">
                        <div className="bg-white p-6 rounded-3xl border border-border shadow-sm">
                            <div className="flex flex-col items-center text-center mb-6">
                                <div className="relative mb-4">
                                    <div className="w-24 h-24 bg-primary-muted rounded-full flex items-center justify-center text-primary">
                                        <User size={ 48 } />
                                    </div>
                                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full border border-border shadow-sm flex items-center justify-center text-text-secondary hover:text-primary transition-colors">
                                        <Camera size={ 16 } />
                                    </button>
                                </div>
                                <h3 className="font-bold text-lg">{ name }</h3>
                                <p className="text-sm text-text-secondary">+91 98765 43210</p>
                            </div>

                            <div className="space-y-1">
                                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-muted text-primary font-bold text-sm">
                                    <User size={ 18 } />
                                    Personal Info
                                </button>
                                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-background font-medium text-sm transition-colors">
                                    <CreditCard size={ 18 } />
                                    My Balance
                                </button>
                                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-background font-medium text-sm transition-colors">
                                    <Bell size={ 18 } />
                                    Notifications
                                </button>
                                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-background font-medium text-sm transition-colors">
                                    <Shield size={ 18 } />
                                    Security
                                </button>
                            </div>

                            <div className="border-t border-border mt-6 pt-6">
                                <button
                                    onClick={ handleLogout }
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-error hover:bg-error/5 font-bold text-sm transition-colors"
                                >
                                    <LogOut size={ 18 } />
                                    Logout
                                </button>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-6 rounded-3xl shadow-lg">
                            <p className="text-xs text-primary-muted uppercase font-bold tracking-wider mb-2">Current Balance</p>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-2xl">🪙</span>
                                <span className="text-3xl font-bold">3,450</span>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                                onClick={ () => navigate(ROUTES.RECHARGE) }
                            >
                                Recharge Now
                            </Button>
                        </div>
                    </div>

                    {/* Main Content */ }
                    <div className="md:col-span-2">
                        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-border shadow-sm">
                            <h2 className="text-xl font-bold mb-8">Personal Information</h2>

                            <form onSubmit={ handleUpdateProfile } className="space-y-6">
                                <Input
                                    label="Display Name"
                                    value={ name }
                                    onChange={ (e) => setName(e.target.value) }
                                    placeholder="Your name"
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Phone Number"
                                        value="+91 98765 43210"
                                        disabled
                                        className="bg-surface-elevated cursor-not-allowed"
                                    />
                                    <Input
                                        label="Email Address"
                                        placeholder="Add your email"
                                    />
                                </div>

                                <div className="w-full">
                                    <label className="block text-sm font-medium text-text-secondary mb-1.5 ml-1">
                                        Bio
                                    </label>
                                    <textarea
                                        className="w-full px-4 py-3 rounded-xl border border-border bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[100px]"
                                        placeholder="Tell us about yourself..."
                                    ></textarea>
                                </div>

                                <div className="pt-4">
                                    <Button variant="primary" className="px-10" isLoading={ isLoading }>
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}
