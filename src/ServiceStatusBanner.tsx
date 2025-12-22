import { useEffect, useState, useRef } from 'react';
import api from './api/client';

function randInterval () {
    // random between 20s and 40s
    return 20000 + Math.floor(Math.random() * 20000);
}

export default function ServiceStatusBanner () {
    const [ reachable, setReachable ] = useState<boolean>(true);
    const timer = useRef<number | null>(null);

    const check = async () => {
        if (typeof navigator !== 'undefined' && (navigator as any).onLine === false) {
            setReachable(false);
            return;
        }
        try {
            // quick GET to root (server may return 404 but accessible)
            await api.get('/');
            setReachable(true);
        } catch (e) {
            setReachable(false);
        }
    };

    useEffect(() => {
        // initial check
        check();
        let stopped = false;
        const schedule = () => {
            const ms = randInterval();
            timer.current = window.setTimeout(async () => {
                if (stopped) return;
                await check();
                schedule();
            }, ms);
        };
        schedule();

        return () => { stopped = true; if (timer.current) clearTimeout(timer.current); };
    }, []);

    if (reachable) return null;

    return (
        <div className="w-full bg-red-600 text-white text-center py-2">
            <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
                <div>Service unavailable — could not reach API. Some features may be offline.</div>
                <div>
                    <button className="underline" onClick={ () => check() }>Retry</button>
                </div>
            </div>
        </div>
    );
}
