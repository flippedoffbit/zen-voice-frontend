import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './ui/Button';
import { subscribe } from '../utils/appEvents';
import { ROUTES } from '../constants/routes';
import { socketClient } from '../socket/client';

export default function SocketAuthHandler () {
    const [ open, setOpen ] = useState(false);
    const [ reason, setReason ] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const off1 = subscribe('socket:auth_error', (p: any) => {
            setReason(p?.reason ?? 'Authentication required');
            setOpen(true);
        });

        // When user logs in, attempt to reconnect socket
        const off2 = subscribe('auth:login', (_token: string) => {
            setReason(null);
            // reconnect using token from storage
            try {
                const token = localStorage.getItem('authToken');
                socketClient.connect(token ?? undefined);
            } catch (e) {}
        });

        return () => {
            if (typeof off1 === 'function') off1();
            if (typeof off2 === 'function') off2();
        };
    }, []);

    if (!open) return null;

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[min(980px,calc(100%-2rem))]">
            <div className="bg-red-600 text-white p-4 rounded-lg flex items-center justify-between shadow-lg">
                <div>
                    <div className="font-bold">Socket authentication required</div>
                    <div className="text-sm opacity-90">{ reason }</div>
                </div>
                <div className="ml-4 flex items-center gap-2">
                    <Button variant="outline" onClick={ () => setOpen(false) }>Dismiss</Button>
                    <Button onClick={ () => navigate(ROUTES.LOGIN) } variant="gradient">Login</Button>
                </div>
            </div>
        </div>
    );
}
