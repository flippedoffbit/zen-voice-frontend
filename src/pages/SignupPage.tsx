import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Mic2, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { requestOtp, verifyOtp, setDisplayName } from '@/api/auth';

export default function SignupPage () {
    const [ step, setStep ] = useState<'details' | 'otp'>('details');
    const [ formData, setFormData ] = useState({
        name: '',
        phone: '',
    });
    const [ otp, setOtp ] = useState('');
    const [ isLoading, setIsLoading ] = useState(false);
    const navigate = useNavigate();

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.phone) {
            toast.error('Please enter a phone number');
            return;
        }
        setIsLoading(true);
        try {
            await requestOtp(formData.phone.replace(/\D/g, ''));
            setStep('otp');
            toast.success('OTP sent successfully!');
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Failed to send OTP';
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length < 4) {
            toast.error('Please enter a valid OTP');
            return;
        }
        setIsLoading(true);
        try {
            await verifyOtp(formData.phone.replace(/\D/g, ''), otp.replace(/\D/g, ''));
            // Optionally set display name on signup if provided
            if (formData.name) {
                await setDisplayName(formData.name);
            }
            toast.success('Account created successfully!');
            navigate(ROUTES.HOME);
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Failed to verify OTP';
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
                        <h1 className="text-3xl font-bold mb-2">Create Account</h1>
                        <p className="text-text-secondary">
                            { step === 'details' ? 'Join ZenRoom today!' : `Enter the OTP sent to ${ formData.phone }` }
                        </p>
                    </div>

                    <form onSubmit={ step === 'details' ? handleSendOTP : handleVerifyOTP } className="space-y-6">
                        { step === 'details' ? (
                            <>
                                <Input
                                    label="Display Name"
                                    placeholder="How should we call you?"
                                    value={ formData.name }
                                    onChange={ (e) => setFormData({ ...formData, name: e.target.value }) }
                                    required
                                />
                                <Input
                                    label="Phone Number"
                                    placeholder="Enter 10 digit number"
                                    type="tel"
                                    value={ formData.phone }
                                    onChange={ (e) => setFormData({ ...formData, phone: e.target.value }) }
                                    required
                                />
                            </>
                        ) : (
                            <Input
                                label="OTP Code"
                                placeholder="Enter 4-digit OTP"
                                type="text"
                                maxLength={ 4 }
                                value={ otp }
                                onChange={ (e) => setOtp(e.target.value) }
                                required
                            />
                        ) }

                        <Button variant="gradient" className="w-full py-4 text-lg" isLoading={ isLoading }>
                            { step === 'details' ? 'Create Account' : 'Verify & Join' }
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-text-secondary text-sm">
                            Already have an account?{ ' ' }
                            <Link to={ ROUTES.LOGIN } className="text-primary font-bold hover:underline">
                                Login
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
