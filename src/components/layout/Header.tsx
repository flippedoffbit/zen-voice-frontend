import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { Menu, X, Mic2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { BalanceWidget } from '../wallet/BalanceWidget';
import clsx from 'clsx';

const NAV_LINKS = [
    { label: 'Home', path: ROUTES.HOME },
    { label: 'Voice', path: ROUTES.VOICE },
    { label: 'About Us', path: ROUTES.ABOUT },
    { label: 'Compliance', path: ROUTES.COMPLIANCE },
    { label: 'Recharge', path: ROUTES.RECHARGE },
];

export default function Header () {
    const [ isMenuOpen, setIsMenuOpen ] = useState(false);
    const location = useLocation();

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-border">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */ }
                <Link to={ ROUTES.HOME } className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-accent-gradient-start to-accent-gradient-end rounded-lg flex items-center justify-center text-white">
                        <Mic2 size={ 20 } />
                    </div>
                    <span className="text-xl font-bold font-display text-primary">ZenRoom</span>
                </Link>

                {/* Desktop Nav */ }
                <nav className="hidden md:flex items-center gap-8">
                    { NAV_LINKS.map((link) => (
                        <Link
                            key={ link.path }
                            to={ link.path }
                            className={ clsx(
                                'text-sm font-medium transition-colors hover:text-navy',
                                location.pathname === link.path ? 'text-primary' : 'text-text-secondary'
                            ) }
                        >
                            { link.label }
                            { location.pathname === link.path && (
                                <div className="h-0.5 bg-navy mt-0.5 rounded-full" />
                            ) }
                        </Link>
                    )) }
                </nav>

                {/* Right Side */ }
                <div className="hidden md:flex items-center gap-4">
                    {/* Show login link when unauthenticated, otherwise show logout */ }
                    {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */ }
                    { (() => {
                        try {
                            // try using auth; keep header resilient if auth not wired
                            // @ts-ignore
                            const { user, logout } = useAuth();
                            if (user) {
                                return (
                                    <div className="flex items-center gap-4">
                                        <BalanceWidget />
                                        <button onClick={ logout } className="text-sm px-3 py-1 rounded-md border">
                                            Logout
                                        </button>
                                    </div>
                                );
                            }
                        } catch (e) {}
                        return (
                            <Link to={ ROUTES.LOGIN } className="btn-primary-gradient text-sm">
                                Sign up/Login
                            </Link>
                        );
                    })() }
                </div>

                {/* Mobile Menu Toggle */ }
                <button
                    className="md:hidden p-2 text-text-secondary"
                    onClick={ () => setIsMenuOpen(!isMenuOpen) }
                >
                    { isMenuOpen ? <X /> : <Menu /> }
                </button>
            </div>

            {/* Mobile Nav */ }
            { isMenuOpen && (
                <div className="md:hidden bg-white border-b border-border py-4 px-4 flex flex-col gap-4">
                    { NAV_LINKS.map((link) => (
                        <Link
                            key={ link.path }
                            to={ link.path }
                            className={ clsx(
                                'text-base font-medium',
                                location.pathname === link.path ? 'text-primary' : 'text-text-secondary'
                            ) }
                            onClick={ () => setIsMenuOpen(false) }
                        >
                            { link.label }
                        </Link>
                    )) }
                    <Link
                        to={ ROUTES.LOGIN }
                        className="btn-primary-gradient text-center"
                        onClick={ () => setIsMenuOpen(false) }
                    >
                        Sign up/Login
                    </Link>
                </div>
            ) }
        </header>
    );
}
