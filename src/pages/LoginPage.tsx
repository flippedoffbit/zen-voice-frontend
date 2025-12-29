import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Mic2, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { requestOtp, verifyOtp } from '../api/auth';
import { useAuth } from '../auth/AuthContext';

export default function LoginPage () {
    const [ step, setStep ] = useState<'phone' | 'otp'>('phone');
    const [ mode, setMode ] = useState<'phone' | 'email'>('phone');
    const [ phone, setPhone ] = useState('');
    const [ email, setEmail ] = useState('');
    const [ otp, setOtp ] = useState('');
    const [ isLoading, setIsLoading ] = useState(false);
    const [ cooldown, setCooldown ] = useState<number>(0);
    const { login } = useAuth();
    const location = useLocation();

    const next = (location.state as any)?.next as string | undefined;
    const preservedSelectedId = (location.state as any)?.selectedId as string | undefined;
    const preservedAction = (location.state as any)?.action as string | undefined;

    const [ identifierError, setIdentifierError ] = useState<string | null>(null);
    const [ otpError, setOtpError ] = useState<string | null>(null);

    // Cooldown timer for resend button
    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setInterval(() => setCooldown(c => Math.max(0, c - 1)), 1000);
        return () => clearInterval(t);
    }, [ cooldown ]);

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setIdentifierError(null);

        // validate identifier
        if (mode === 'phone') {
            const digits = phone.replace(/\D/g, '');
            if (!digits || digits.length < 4) {
                setIdentifierError('Please enter a valid phone number');
                toast.error('Please enter a valid phone number');
                return;
            }
        } else {
            const value = email.trim();
            if (!value || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
                setIdentifierError('Please enter a valid email address');
                toast.error('Please enter a valid email address');
                return;
            }
        }

        setIsLoading(true);
        try {
            if (mode === 'phone') {
                await requestOtp({ phone: phone.replace(/\D/g, '') });
                toast.success('OTP sent to your phone — check it');
            } else {
                await requestOtp({ email: email.trim() });
                toast.success('OTP sent to your email — check it');
            }
            setStep('otp');
            setCooldown(30); // 30s cooldown
        } catch (err: any) {
            const code = err?.response?.data?.error?.code;
            const msg = err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || 'Failed to send OTP';
            if (code === 'RATE_LIMITED') {
                setIdentifierError('Too many OTP requests. Please wait and try again.');
                toast.error('Too many OTP requests. Please wait and try again.');
            } else {
                setIdentifierError(msg);
                toast.error(msg);
            }
        } finally {
            setIsLoading(false);
        }
    };


    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        const digits = otp.replace(/\D/g, '');
        if (digits.length < 4) {
            setOtpError('Please enter a valid 4-digit OTP');
            toast.error('Please enter a valid OTP');
            return;
        }
        setOtpError(null);
        setIsLoading(true);
        try {
            const identifier = mode === 'phone' ? { phone: phone.replace(/\D/g, '') } : { email: email.trim() };
            const data = await verifyOtp(identifier, digits);
            const token = data?.token;
            const user = data?.user ?? { id: 'server-user', phone: mode === 'phone' ? phone : undefined, email: mode === 'email' ? email : undefined };
            if (token) {
                login(token, user, next, { selectedId: preservedSelectedId, action: preservedAction });
                toast.success('Logged in successfully!');
            } else {
                // Fallback if backend didn't return a token
                toast.success('Logged in successfully!');
                login('local-demo-token', user, next, { selectedId: preservedSelectedId, action: preservedAction });
            }
        } catch (err: any) {
            const code = err?.response?.data?.error?.code;
            const msg = err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || 'Failed to verify OTP';
            if (code === 'INVALID_OTP') {
                setOtpError('Incorrect code. Please try again.');
                toast.error('Incorrect code. Please try again.');
            } else if (code === 'RATE_LIMITED') {
                setOtpError('Too many attempts. Please try again later.');
                toast.error('Too many attempts. Please try again later.');
            } else {
                setOtpError(msg);
                toast.error(msg);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleModeChange = (m: 'phone' | 'email') => {
        setMode(m);
        // reset identifier and errors when switching
        setPhone('');
        setEmail('');
        setIdentifierError(null);
        setOtp('');
        setStep('phone');
    };


    return (
        <div className="min-h-screen bg-background flex flex-col">
            <div className="p-4">
                <Link to={ ROUTES.HOME } className="inline-flex items-center gap-1 text-text-secondary hover:text-primary transition-colors">
                    <ChevronLeft size={ 20 } />
                    <span>Back to Home</span>
                </Link>
            </div>

            <div className="flex-grow flex items-center justify-center p-4">
                <motion.div
                    initial={ { opacity: 0, y: 20 } }
                    animate={ { opacity: 1, y: 0 } }
                    className="w-full max-w-md bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-border"
                >
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-accent-gradient-start to-accent-gradient-end rounded-2xl flex items-center justify-center text-white mb-6 shadow-glow-magenta">
                            <Mic2 size={ 32 } />
                        </div>
                        <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                        <p className="text-text-secondary">
                            { step === 'phone' ? (mode === 'phone' ? 'Enter your phone number to continue' : 'Enter your email to continue') : `Enter the OTP sent to ${ mode === 'phone' ? phone : email }` }
                        </p>
                    </div>

                    <form onSubmit={ step === 'phone' ? handleSendOTP : handleVerifyOTP } className="space-y-6">
                        { step === 'phone' ? (
                            <div className="space-y-4">
                                <div role="tablist" aria-label="Login method" className="flex gap-2">
                                    <button type="button" role="tab" aria-selected={ mode === 'phone' } onClick={ () => handleModeChange('phone') } className={ `px-4 py-2 rounded-full ${ mode === 'phone' ? 'bg-primary text-white' : 'bg-gray-100' }` }>
                                        Phone
                                    </button>
                                    <button type="button" role="tab" aria-selected={ mode === 'email' } onClick={ () => handleModeChange('email') } className={ `px-4 py-2 rounded-full ${ mode === 'email' ? 'bg-primary text-white' : 'bg-gray-100' }` }>
                                        Email
                                    </button>
                                </div>

                                { mode === 'phone' ? (
                                    <Input
                                        label="Phone Number"
                                        placeholder="Enter 10 digit number"
                                        type="tel"
                                        value={ phone }
                                        onChange={ (e) => setPhone(e.target.value) }
                                        required
                                        error={ identifierError ?? undefined }
                                    />
                                ) : (
                                    <Input
                                        label="Email Address"
                                        placeholder="you@domain.com"
                                        type="email"
                                        value={ email }
                                        onChange={ (e) => setEmail(e.target.value) }
                                        required
                                        error={ identifierError ?? undefined }
                                    />
                                ) }

                                <Button variant="gradient" className="w-full py-4 text-lg" isLoading={ isLoading } disabled={ cooldown > 0 }>
                                    { cooldown > 0 ? `Wait ${ cooldown }s to resend` : 'Send OTP' }
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <Input
                                    label="OTP Code"
                                    placeholder="Enter 4-digit OTP"
                                    type="text"
                                    maxLength={ 4 }
                                    value={ otp }
                                    onChange={ (e) => setOtp(e.target.value) }
                                    required
                                    error={ otpError ?? undefined }
                                />

                                <div className="flex gap-2 items-center">
                                    <Button variant="gradient" className="flex-1 py-4 text-lg" isLoading={ isLoading }>
                                        Verify & Login
                                    </Button>
                                    <Button variant="outline" onClick={ handleSendOTP } disabled={ cooldown > 0 }>
                                        { cooldown > 0 ? `Resend (${ cooldown }s)` : 'Resend' }
                                    </Button>
                                </div>
                            </div>
                        ) }
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-text-secondary text-sm">
                            Don't have an account?{ ' ' }
                            <Link to={ ROUTES.SIGNUP } className="text-primary font-bold hover:underline">
                                Sign Up
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
