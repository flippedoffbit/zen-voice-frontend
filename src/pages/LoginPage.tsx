import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Mic2, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { requestOtp, verifyOtp } from '@/api/auth';
import { useAuth } from '@/auth/AuthContext';

export default function LoginPage () {
    const [ step, setStep ] = useState<'phone' | 'otp'>('phone');
    const [ phone, setPhone ] = useState('');
    const [ otp, setOtp ] = useState('');
    const [ isLoading, setIsLoading ] = useState(false);
    const { login } = useAuth();
    const location = useLocation();

    const next = (location.state as any)?.next as string | undefined;
    const preservedSelectedId = (location.state as any)?.selectedId as string | undefined;
    const preservedAction = (location.state as any)?.action as string | undefined;

    const [ phoneError, setPhoneError ] = useState<string | null>(null);
    const [ otpError, setOtpError ] = useState<string | null>(null);

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        const digits = phone.replace(/\D/g, '');
        if (!digits) {
            setPhoneError('Please enter a phone number');
            toast.error('Please enter a phone number');
            return;
        }
        setPhoneError(null);
        setIsLoading(true);
        try {
            await requestOtp(digits);
            setStep('otp');
            toast.success('OTP sent successfully!');
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Failed to send OTP';
            setPhoneError(msg);
            toast.error(msg);
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
            const data = await verifyOtp(phone.replace(/\D/g, ''), digits);
            const token = data?.token;
            const user = data?.user ?? { id: 'server-user', phone };
            if (token) {
                login(token, user, next, { selectedId: preservedSelectedId, action: preservedAction });
                toast.success('Logged in successfully!');
            } else {
                // Fallback if backend didn't return a token
                toast.success('Logged in successfully!');
                login('local-demo-token', user, next, { selectedId: preservedSelectedId, action: preservedAction });
            }
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Failed to verify OTP';
            setOtpError(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
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
                    <div className="flex flex-col items-center text-center mb-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-accent-gradient-start to-accent-gradient-end rounded-2xl flex items-center justify-center text-white mb-6 shadow-glow-magenta">
                            <Mic2 size={ 32 } />
                        </div>
                        <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                        <p className="text-text-secondary">
                            { step === 'phone' ? 'Enter your phone number to continue' : `Enter the OTP sent to ${ phone }` }
                        </p>
                    </div>

                    <form onSubmit={ step === 'phone' ? handleSendOTP : handleVerifyOTP } className="space-y-6">
                        { step === 'phone' ? (
                            <Input
                                label="Phone Number"
                                placeholder="Enter 10 digit number"
                                type="tel"
                                value={ phone }
                                onChange={ (e) => setPhone(e.target.value) }
                                required
                                error={ phoneError ?? undefined }
                            />
                        ) : (
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
                        ) }

                        <Button variant="gradient" className="w-full py-4 text-lg" isLoading={ isLoading }>
                            { step === 'phone' ? 'Send OTP' : 'Verify & Login' }
                        </Button>
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
