import { useEffect, useState } from 'react';
import ErrorModal from './ui/ErrorModal';
import { subscribe, hideError } from '../utils/errorModal';

export default function ErrorModalManager () {
    const [ open, setOpen ] = useState(false);
    const [ payload, setPayload ] = useState<{ title?: string; message?: string; } | null>(null);

    useEffect(() => {
        const unsub = subscribe((p) => { setPayload(p); setOpen(true); }, () => { setOpen(false); setPayload(null); });
        return () => unsub();
    }, []);

    return <ErrorModal open={ open } title={ payload?.title } message={ payload?.message } onClose={ () => { hideError(); setOpen(false); } } />;
}
