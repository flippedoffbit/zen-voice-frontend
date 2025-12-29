import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import SpeakerCircle from '../components/room/SpeakerCircle';
import { socketClient } from '../socket/client';
import { initMediasoupForRoom, startProducing } from '../signal/mediasoup';
import { ChevronLeft, MoreVertical, Users, Mic, LogOut, Shield } from 'lucide-react';
import { ROUTES } from '../constants/routes';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-hot-toast';
import { getRoom, Room } from '@/api/rooms';
import RoomImageUpload from '@/components/room/RoomImageUpload';
import { logger } from '../utils/logger';
import { subscribe } from '../utils/appEvents';

export default function RoomPage () {
    const navigate = useNavigate();
    const { id } = useParams();
    const roomId = id || 'room-uuid';
    const [ room, setRoom ] = useState<Room | null>(null);
    const [ roomLoading, setRoomLoading ] = useState(true);
    const [ roomError, setRoomError ] = useState<string | null>(null);
    const [ listenerCount, setListenerCount ] = useState(0);
    const [ isSpeaking, setIsSpeaking ] = useState(false);
    const [ requestPending, setRequestPending ] = useState(false);
    const [ isAdmin, setIsAdmin ] = useState(false);
    const [ pendingRequests, setPendingRequests ] = useState<Array<{ id: string; userId: string; displayName?: string; }>>([]);
    const [ sendTransport, setSendTransport ] = useState<any>(null);
    const [ recvTransport, setRecvTransport ] = useState<any>(null);
    const [ localStream, setLocalStream ] = useState<MediaStream | null>(null);
    const [ joined, setJoined ] = useState(false);
    const connectedByThisPage = useRef(false);
    const location = useLocation();
    const { user, loading } = useAuth();

    // Keep isAdmin state in sync with latest room + user data. Use string compare to be robust.
    useEffect(() => {
        console.log('[Room] Admin check triggered', { user, room });
        const admin = room?.isAdmin || Boolean(user && room && String(user.id) === String(room.primaryAdminId));
        setIsAdmin(admin);
        if (process.env.NODE_ENV === 'development') console.log('[Room] admin check', { userId: user?.id, primaryAdminId: room?.primaryAdminId, roomIsAdmin: room?.isAdmin, calculatedAdmin: Boolean(user && room && String(user.id) === String(room.primaryAdminId)), finalIsAdmin: admin });
    }, [ user, room ]);

    useEffect(() => {
        const fetchRoom = async () => {
            setRoomLoading(true);
            setRoomError(null);
            try {
                const data = await getRoom(roomId);
                console.log('[Room] API response for getRoom:', data);
                if (data.success) {
                    setRoom(data.room);
                    setListenerCount(data.room.listenerCount);
                    console.log('[Room] Room set:', data.room);
                    // We will set isAdmin from a dedicated effect to handle timing/type issues
                    if (process.env.NODE_ENV === 'development') console.log('[Room] fetched room', { roomId: data.room.id, primaryAdminId: data.room.primaryAdminId, name: data.room.name });
                } else {
                    setRoomError('Failed to load room data');
                }
            } catch (err: any) {
                setRoomError(err.response?.data?.error?.message || err.message || 'Failed to load room');
            } finally {
                setRoomLoading(false);
            }
        };
        if (roomId !== 'room-uuid') {
            fetchRoom();
        } else {
            setRoomLoading(false);
        }
    }, [ roomId, user ]);

    const handleLeave = () => {
        navigate(ROUTES.VOICE);
    };

    const handleRequestToSpeak = async () => {
        if (loading) {
            toast.loading('Checking authentication...');
            return;
        }

        if (!user) {
            toast.error('Please log in to request to speak');
            // include an action so we can resume the request after login
            navigate(ROUTES.LOGIN, { state: { next: location.pathname, action: 'request-speak' } });
            return;
        }

        setRequestPending(true);
        console.log('[Room] Requesting to speak in room:', roomId);

        // register listeners *before* emitting to avoid races
        const onApproved = async () => {
            console.log('[Room] Speak request approved, initializing MediaSoup...');
            try {
                // initialize mediasoup and auto-start producing
                const { sendTransport } = await initMediasoupForRoom(roomId);
                setSendTransport(sendTransport);

                try {
                    const { stream } = await startProducing(sendTransport);
                    setLocalStream(stream);
                    setIsSpeaking(true);
                    logger.info('MediaSoup active: started producing audio');
                    console.log('[Room] Successfully started speaking');
                    setRequestPending(false);
                } catch (err: any) {
                    logger.warn('startProducing failed', err);
                    console.error('[Room] Failed to start producing:', err);
                    const message = (err && (err.message || err))?.toString?.() || '';
                    if (/INSUFFICIENT_FUNDS/i.test(message) && !isAdmin) {
                        toast.error('Low balance! Please recharge to continue speaking.');
                        navigate(ROUTES.RECHARGE);
                    }
                    setRequestPending(false);
                }
            } catch (e: any) {
                logger.warn('mediasoup init failed', e);
                const message = (e && (e.message || e))?.toString?.() || '';
                if (/INSUFFICIENT_FUNDS/i.test(message) && !isAdmin) {
                    toast.error('Low balance! Please recharge to continue.');
                    navigate(ROUTES.RECHARGE);
                }
                setRequestPending(false);
            }
        };

        const onRejected = (_payload: any) => {
            setRequestPending(false);
        };

        socketClient.once('speak-request-approved', onApproved as any);
        socketClient.once('speak-request-rejected', onRejected as any);

        // emit after listeners are registered
        socketClient.emit('request-speak', { roomId });
    };

    const handleStopSpeaking = () => {
        console.log('[Room] Stopping speaking');
        setIsSpeaking(false);
        logger.info('MediaSoup inactive: stopped producing audio');
        if (localStream) {
            localStream.getTracks().forEach(t => t.stop());
            setLocalStream(null);
        }
        if (sendTransport) {
            try { sendTransport.close && sendTransport.close(); } catch (e) {}
            setSendTransport(null);
        }
    };

    const handleAdminStartSpeaking = async () => {
        // Ensure admin is joined and then start producing immediately
        try {
            if (!joined) {
                const token = (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function')
                    ? localStorage.getItem('authToken')
                    : null;
                socketClient.connect(token || undefined);
                socketClient.emit('join-room', { roomId });
                connectedByThisPage.current = true;
                setJoined(true);
            }

            const { sendTransport } = await initMediasoupForRoom(roomId);
            setSendTransport(sendTransport);
            const { stream } = await startProducing(sendTransport);
            setLocalStream(stream);
            setIsSpeaking(true);
            toast.success('You are now speaking');
        } catch (e) {
            logger.warn('Admin start speaking failed', e);
            toast.error('Failed to start speaking');
        }
    };
    useEffect(() => {
        // Listen for insufficient funds error
        const offInsufficientFunds = subscribe('socket:insufficient_funds', () => {
            toast.error('Low balance! Please recharge to continue.');
            navigate(ROUTES.VOICE);
        });

        const token = (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function')
            ? localStorage.getItem('authToken')
            : null;

        if (process.env.NODE_ENV === 'development') console.log('[Room] join effect start', { userId: user?.id, roomId, primaryAdminId: room?.primaryAdminId, joined, isAdmin });

        if (!user) {
            // Allow unauthenticated users to view room details but not join
            console.log('[Room] Viewing room as unauthenticated user:', roomId);
            setJoined(false);
            return;
        }

        // user exists => connect and join
        try {
            // Pre-join balance check (skip for room admins)
            if (user && user.balance !== undefined && user.balance < 1 && user.id !== room?.primaryAdminId) {
                toast.error('Insufficient balance! Please recharge to join the room.');
                navigate(ROUTES.RECHARGE);
                return;
            }

            console.log('[Room] Connecting socket and joining room as listener:', roomId);
            socketClient.connect(token || undefined);
            socketClient.emit('join-room', { roomId });
            console.log('[Room] Joined room:', roomId);
            connectedByThisPage.current = true;
            setJoined(true);

            // Listen for real-time listener count updates
            socketClient.on('user-joined', () => {
                setListenerCount(prev => prev + 1);
            });
            socketClient.on('user-left', () => {
                setListenerCount(prev => prev - 1);
            });

            // Admin: listen for speak requests so admin can approve/reject
            // Use string equality to avoid number/string mismatches from backend
            if (user && room && String(user.id) === String(room.primaryAdminId)) {
                const onSpeakRequest = (payload: any) => {
                    // Payload expected: { requestId, userId, displayName }
                    if (process.env.NODE_ENV === 'development') console.log('[Room] speak-request payload received by admin', payload);
                    const req = { id: payload.requestId || payload.id || `${ payload.userId }-${ Date.now() }`, userId: payload.userId, displayName: payload.displayName };
                    setPendingRequests(prev => [ req, ...prev ]);
                };
                socketClient.on('speak-request', onSpeakRequest as any);
                if (process.env.NODE_ENV === 'development') console.log('[Room] admin listeners registered for speak-request and cancellations');

                // Remove pending if cancelled
                const onRequestCancelled = (payload: any) => {
                    setPendingRequests(prev => prev.filter(p => p.userId !== payload.userId && p.id !== payload.requestId));
                };
                socketClient.on('speak-request-cancelled', onRequestCancelled as any);
            }

            // Log pendingRequests changes (dev only) — moved to top-level


            // Initialize MediaSoup for receiving audio
            (async () => {
                try {
                    console.log('[Room] Initializing MediaSoup for listening...');
                    const { sendTransport: st, recvTransport: rt } = await initMediasoupForRoom(roomId);
                    setSendTransport(st);
                    setRecvTransport(rt);
                    console.log('[Room] MediaSoup initialized for listening');

                    // Listen for new producers to consume
                    socketClient.on('new-producer', async (data: any) => {
                        console.log('[Room] New producer to consume:', data);
                        try {
                            // Request consumer creation from server
                            socketClient.emit('consume', {
                                transportId: rt.id,
                                producerId: data.producerId,
                                roomId
                            });

                            // Wait for consumer data
                            const consumerData = await new Promise<any>((resolve) => {
                                const handler = (payload: any) => {
                                    socketClient.off('consumer-created', handler);
                                    resolve(payload);
                                };
                                socketClient.once('consumer-created', handler);
                            });

                            console.log('[Room] Consumer data received:', consumerData);

                            // Consume the stream
                            const consumer = await rt.consume(consumerData);
                            console.log('[Room] Consumer created:', consumer);

                            // Play the audio
                            const stream = new MediaStream([ consumer.track ]);
                            const audio = new Audio();
                            audio.srcObject = stream;
                            audio.volume = 1; // Ensure volume
                            audio.play().catch(e => console.error('Failed to play audio:', e));
                            console.log('[Room] Playing audio from producer');

                        } catch (e) {
                            console.error('[Room] Failed to consume producer:', e);
                        }
                    });

                } catch (e) {
                    console.error('[Room] Failed to init MediaSoup for listening:', e);
                }
            })();

            // If there's an action in location state (for example 'request-speak') attempt to resume it
            const action = (location.state as any)?.action as string | undefined;
            if (action === 'request-speak') {
                // clear the state so we don't re-run on subsequent renders
                navigate(location.pathname, { replace: true, state: {} });
                // async call to request to speak
                setTimeout(() => { handleRequestToSpeak().catch((err) => { console.error('[Room] requestToSpeak resumed failed', err); }); }, 50);
            }
        } catch (e: any) {
            logger.warn('Failed to connect/join room', e);
            // Provide expanded debug info to help capture minified/runtime errors
            try {
                console.error('[Room] Detailed join error:', {
                    message: e?.message,
                    name: e?.name,
                    stack: e?.stack,
                    toString: e?.toString?.(),
                    extra: Object.getOwnPropertyNames(e || {}).reduce((acc: any, k: string) => (acc[ k ] = (e as any)[ k ], acc), {})
                });
                // If React minified error, attempt to fetch decoded message (best-effort; may be blocked by CORS)
                const m = String(e?.message || '');
                const match = m.match(/Minified React error #(\d+)/);
                if (match) {
                    const code = match[ 1 ];
                    (async () => {
                        try {
                            const url = `https://reactjs.org/docs/error-decoder.html?invariant=${ code }`;
                            const resp = await fetch(url);
                            const text = await resp.text();
                            console.error('[Room] React error decoder HTML (first 500 chars):', text.slice(0, 500));
                        } catch (fetchErr) {
                            console.warn('[Room] Failed to fetch React error decoder', fetchErr);
                        }
                    })();
                }
            } catch (err) {
                console.error('[Room] Failed to serialize join error', err);
            }
        }

        return () => {
            console.log('[Room] Leaving room:', roomId);
            try {
                if (connectedByThisPage.current) socketClient.emit('leave-room', { roomId });
            } catch (e) {}
            try { socketClient.disconnect(); } catch (e) {}
            socketClient.off('user-joined');
            socketClient.off('user-left');
            socketClient.off('new-producer');
            // admin listeners
            socketClient.off('speak-request');
            socketClient.off('speak-request-cancelled');
            if (typeof offInsufficientFunds === 'function') offInsufficientFunds();
            // Close MediaSoup transports
            if (sendTransport) {
                try { sendTransport.close && sendTransport.close(); } catch (e) {}
                setSendTransport(null);
            }
            if (recvTransport) {
                try { recvTransport.close && recvTransport.close(); } catch (e) {}
                setRecvTransport(null);
            }
            connectedByThisPage.current = false;
            setJoined(false);
        };
    }, [ roomId, user ]);

    useEffect(() => {
        if (process.env.NODE_ENV === 'development') console.log('[Room] pendingRequests changed', { count: pendingRequests.length, pendingRequests });
    }, [ pendingRequests ]);
    // Render debug: show which bottom control mode will be rendered (dev only)
    if (process.env.NODE_ENV === 'development') {
        const controlMode = isSpeaking ? 'speaking' : requestPending ? 'requestPending' : isAdmin ? 'admin' : !joined ? 'read-only' : 'joiner';
        console.log('[Room] render bottom controls', { controlMode, isAdmin, joined, userId: user?.id, roomAdminId: room?.primaryAdminId });
    }
    const renderContent = () => roomLoading ? (
        <div className="min-h-screen bg-background flex flex-col">
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-text-secondary">Loading room...</p>
                </div>
            </div>
        </div>
    ) : roomError ? (
        <div className="min-h-screen bg-background flex flex-col">
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{ roomError }</p>
                    <button
                        onClick={ () => window.location.reload() }
                        className="text-primary font-semibold hover:underline"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        </div>
    ) : (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Room Header */ }
            <header className="bg-white border-b border-border px-4 py-4 sticky top-0 z-30">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={ handleLeave } className="p-2 hover:bg-background rounded-full transition-colors">
                            <ChevronLeft />
                        </button>
                        { isAdmin ? (
                            <RoomImageUpload
                                roomId={ roomId }
                                currentImage={ room?.image }
                                onUploadSuccess={ (url) => setRoom(prev => prev ? { ...prev, image: url } : null) }
                            />
                        ) : (
                            room?.image && (
                                <div className="w-12 h-12 rounded-xl overflow-hidden">
                                    <img src={ room.image } alt={ room.name } className="w-full h-full object-cover" />
                                </div>
                            )
                        ) }
                        <div>
                            <h1 className="font-bold text-lg leading-tight">{ room?.name || 'Morning Talk' }</h1>
                            <p className="text-xs text-text-secondary truncate max-w-[200px]">{ room?.description || 'Discussing the latest trends in tech...' }</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        { isAdmin && (
                            <button className="p-2 hover:bg-background rounded-full text-primary transition-colors">
                                <Shield size={ 20 } />
                            </button>
                        ) }
                        <button className="p-2 hover:bg-background rounded-full transition-colors">
                            <MoreVertical />
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-grow py-8">
                <Container>
                    {/* Live Indicator */ }
                    <div className="flex justify-center mb-12">
                        <div className="flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full font-bold text-sm">
                            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                            LIVE
                        </div>
                    </div>

                    {/* Speaker Grid */ }
                    <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-card border border-border mb-8">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-12 gap-x-8">
                            { room?.speakers?.map((speaker) => (
                                <SpeakerCircle
                                    key={ speaker.id }
                                    name={ speaker.displayName }
                                    isSpeaking={ speaker.isSpeaking }
                                />
                            )) }
                            { isSpeaking && <SpeakerCircle name="You" isMe isSpeaking /> }
                        </div>
                    </div>

                    {/* Listener Count */ }
                    <div className="flex items-center justify-center gap-2 text-text-secondary mb-12">
                        <Users size={ 18 } />
                        <span className="font-medium">{ listenerCount } listeners</span>
                    </div>
                </Container>
            </main>

            {/* Bottom Controls */ }
            <div className="bg-white border-t border-border p-6 sticky bottom-0 z-30">
                <Container className="max-w-md">
                    <div className="flex flex-col gap-3">
                        { isSpeaking ? (
                            <>
                                <Button variant="primary" className="w-full py-4 rounded-2xl gap-2">
                                    <Mic size={ 20 } />
                                    Mute
                                </Button>
                                <Button variant="outline" onClick={ handleStopSpeaking } className="w-full py-4 rounded-2xl gap-2 text-error border-error/20 hover:bg-error/5">
                                    <LogOut size={ 20 } className="rotate-180" />
                                    Stop Speaking
                                </Button>
                            </>
                        ) : requestPending ? (
                            <div className="bg-warning/10 border border-warning/20 rounded-2xl p-4 text-center">
                                <p className="text-warning font-bold mb-1">⏳ Request pending...</p>
                                <p className="text-xs text-text-secondary mb-3">Waiting for admin to approve your request.</p>
                                <Button variant="outline" size="sm" onClick={ () => setRequestPending(false) } className="text-xs">
                                    Cancel Request
                                </Button>
                            </div>
                        ) : isAdmin ? (
                            // Admin controls (shown even if not joined)
                            <div className="flex flex-col gap-2">
                                <Button variant="gradient" onClick={ handleAdminStartSpeaking } className="w-full py-4 rounded-2xl gap-2">
                                    <Mic size={ 20 } />
                                    Press to Speak
                                </Button>

                                <div className="bg-white border border-border rounded-2xl p-4">
                                    <p className="font-bold mb-3">Pending Speak Requests</p>
                                    { pendingRequests.length === 0 ? (
                                        <p className="text-sm text-text-secondary">No pending requests</p>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            { pendingRequests.map((r) => (
                                                <div key={ r.id } className="flex items-center justify-between gap-2">
                                                    <div>
                                                        <div className="font-medium">{ r.displayName || r.userId }</div>
                                                        <div className="text-xs text-text-secondary">{ r.userId }</div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button variant="primary" size="sm" onClick={ () => {
                                                            // Approve
                                                            socketClient.emit('approve-speak', { roomId, requestId: r.id, userId: r.userId });
                                                            setPendingRequests(prev => prev.filter(p => p.id !== r.id));
                                                        } }>
                                                            Approve
                                                        </Button>
                                                        <Button variant="outline" size="sm" onClick={ () => {
                                                            socketClient.emit('reject-speak', { roomId, requestId: r.id, userId: r.userId });
                                                            setPendingRequests(prev => prev.filter(p => p.id !== r.id));
                                                        } }>
                                                            Reject
                                                        </Button>
                                                    </div>
                                                </div>
                                            )) }
                                        </div>
                                    ) }
                                </div>
                            </div>
                        ) : !joined ? (
                            // User can see the room but cannot join without logging in
                            <div className="bg-white rounded-2xl p-4 border border-border text-center">
                                <p className="text-text-secondary mb-3">You are viewing this room in read-only mode.</p>
                                { loading ? (
                                    <Button variant="outline" className="w-full py-3" disabled>Checking authentication...</Button>
                                ) : !user ? (
                                    <Button variant="gradient" className="w-full py-3" onClick={ () => navigate(ROUTES.LOGIN, { state: { next: location.pathname } }) }>
                                        Log in to Join
                                    </Button>
                                ) : (
                                    <Button variant="gradient" className="w-full py-3" onClick={ async () => {
                                        // If user exists but somehow not joined yet, try to join now
                                        const token = (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function')
                                            ? localStorage.getItem('authToken')
                                            : null;
                                        try {
                                            socketClient.connect(token || undefined);
                                            socketClient.emit('join-room', { roomId });
                                            connectedByThisPage.current = true;
                                            setJoined(true);
                                        } catch (e) {
                                            toast.error('Failed to join room');
                                        }
                                    } }>
                                        Join Room
                                    </Button>
                                ) }
                            </div>
                        ) : (
                            // Non-admin joiner UI
                            <div>
                                <Button variant="gradient" onClick={ handleRequestToSpeak } className="w-full py-4 rounded-2xl gap-2">
                                    <Mic size={ 20 } />
                                    Request to Speak
                                </Button>
                            </div>
                        ) }

                        <Button variant="ghost" onClick={ handleLeave } className="w-full py-4 rounded-2xl gap-2 text-text-secondary">
                            Leave Room
                        </Button>
                    </div>
                </Container>
            </div>
        </div>
    );
    return (renderContent());
}
