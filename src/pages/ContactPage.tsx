import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function ContactPage () {
    const [ isLoading, setIsLoading ] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            toast.success('Message sent successfully! We will get back to you soon.');
            const form = e.target as HTMLFormElement;
            form.reset();
        }, 1500);
    };

    return (
        <div className="py-16 bg-background">
            <Container>
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
                        <p className="text-text-secondary text-lg">
                            Have questions or feedback? We'd love to hear from you.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Contact Info */ }
                        <div className="lg:col-span-1 space-y-8">
                            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-border">
                                <h3 className="text-xl font-bold mb-8">Contact Information</h3>

                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 bg-primary-muted rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                                            <Mail size={ 20 } />
                                        </div>
                                        <div>
                                            <p className="text-xs text-text-muted uppercase font-bold tracking-wider mb-1">Email Us</p>
                                            <p className="font-medium">support@zenroom.com</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 bg-accent-muted rounded-xl flex items-center justify-center text-accent flex-shrink-0">
                                            <Phone size={ 20 } />
                                        </div>
                                        <div>
                                            <p className="text-xs text-text-muted uppercase font-bold tracking-wider mb-1">Call Us</p>
                                            <p className="font-medium">+91 98765 43210</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center text-warning flex-shrink-0">
                                            <MapPin size={ 20 } />
                                        </div>
                                        <div>
                                            <p className="text-xs text-text-muted uppercase font-bold tracking-wider mb-1">Visit Us</p>
                                            <p className="font-medium">123 Tech Park, HSR Layout, Bangalore, India</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-primary text-white p-8 rounded-[2rem] shadow-lg">
                                <h4 className="font-bold mb-4">Business Inquiries</h4>
                                <p className="text-primary-muted text-sm leading-relaxed">
                                    Interested in partnering with ZenRoom? Reach out to our business development team at biz@zenroom.com
                                </p>
                            </div>
                        </div>

                        {/* Contact Form */ }
                        <div className="lg:col-span-2">
                            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-border">
                                <form onSubmit={ handleSubmit } className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input label="Full Name" placeholder="John Doe" required />
                                        <Input label="Email Address" type="email" placeholder="john@example.com" required />
                                    </div>
                                    <Input label="Subject" placeholder="How can we help?" required />
                                    <div className="w-full">
                                        <label className="block text-sm font-medium text-text-secondary mb-1.5 ml-1">
                                            Message
                                        </label>
                                        <textarea
                                            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[150px]"
                                            placeholder="Your message here..."
                                            required
                                        ></textarea>
                                    </div>
                                    <Button variant="gradient" className="w-full py-4 text-lg gap-2" isLoading={ isLoading }>
                                        <Send size={ 20 } />
                                        Send Message
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}
