import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { Mic2, Instagram, Twitter, Youtube } from 'lucide-react';

export default function Footer () {
    return (
        <footer className="bg-white border-t border-border pt-12 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    {/* Brand */ }
                    <div className="col-span-1 md:col-span-2">
                        <Link to={ ROUTES.HOME } className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-accent-gradient-start to-accent-gradient-end rounded-lg flex items-center justify-center text-white">
                                <Mic2 size={ 20 } />
                            </div>
                            <span className="text-xl font-bold font-display text-primary">ZenRoom</span>
                        </Link>
                        <p className="text-text-secondary max-w-xs">
                            Connect with friends in fun voice chat rooms! Experience unique conversations and expand your circle.
                        </p>
                    </div>

                    {/* Quick Links */ }
                    <div>
                        <h4 className="font-bold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li><Link to={ ROUTES.VOICE } className="text-text-secondary hover:text-primary transition-colors">Voice Rooms</Link></li>
                            <li><Link to={ ROUTES.ABOUT } className="text-text-secondary hover:text-primary transition-colors">About Us</Link></li>
                            <li><Link to={ ROUTES.COMPLIANCE } className="text-text-secondary hover:text-primary transition-colors">Policy</Link></li>
                            <li><Link to={ ROUTES.CONTACT } className="text-text-secondary hover:text-primary transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Social & Company */ }
                    <div>
                        <h4 className="font-bold mb-4">Follow Us</h4>
                        <div className="flex gap-4 mb-6">
                            <a href="#" className="text-text-secondary hover:text-navy transition-colors"><Instagram size={ 20 } /></a>
                            <a href="#" className="text-text-secondary hover:text-navy transition-colors"><Twitter size={ 20 } /></a>
                            <a href="#" className="text-text-secondary hover:text-navy transition-colors"><Youtube size={ 20 } /></a>
                        </div>
                        <p className="text-xs text-text-muted">
                            ZENROOM PRIVATE LIMITED
                        </p>
                    </div>
                </div>

                <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-text-muted">
                        © 2025 ZenRoom All Rights Reserved.
                    </p>
                    <div className="flex gap-6 text-sm text-text-muted">
                        <Link to={ ROUTES.COMPLIANCE_PRIVACY } className="hover:text-primary">Privacy Policy</Link>
                        <Link to={ ROUTES.COMPLIANCE_TERMS } className="hover:text-primary">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
