import { io, Socket } from 'socket.io-client';
import { logger } from '../utils/logger';

const SOCKET_URL = (import.meta as any).env?.VITE_SOCKET_URL || 'http://localhost:3000';

type EventHandler = (...args: any[]) => void;

class SocketClient {
    private static instance: SocketClient;
    public socket: Socket | null = null;

    private constructor() {}

    public static getInstance (): SocketClient {
        if (!SocketClient.instance) {
            SocketClient.instance = new SocketClient();
        }
        return SocketClient.instance;
    }

    public connect (token?: string) {
        if (this.socket && this.socket.connected) return;

        this.socket = io(SOCKET_URL, {
            auth: token ? { token } : undefined,
            transports: [ 'polling', 'websocket' ],
            autoConnect: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        // Deep logging for all socket events
        this.setupLogging();

        this.socket.on('connect', () => {
            logger.info('[socket] connected', this.socket?.id);
        });

        this.socket.on('disconnect', (reason: string) => {
            logger.info('[socket] disconnected', reason);
        });

        this.socket.on('connect_error', (err: any) => {
            // delegate to exported handler (testable)
            void handleSocketConnectError(err);
        });
    }

    private setupLogging () {
        if (!this.socket) return;

        const log = (event: string, ...args: any[]) => {
            logger.debug(`[socket] ${ event }`, ...args);
        };

        this.socket.on('connect', () => log('connect', this.socket?.id));
        this.socket.on('disconnect', (reason) => log('disconnect', reason));
        this.socket.on('connect_error', (err) => log('connect_error', err));
        this.socket.on('reconnect', (attempt) => log('reconnect', `attempt ${ attempt }`));
        this.socket.on('reconnect_attempt', (attempt) => log('reconnect_attempt', attempt));
        this.socket.on('reconnect_error', (err) => log('reconnect_error', err));
        this.socket.on('reconnect_failed', () => log('reconnect_failed'));
        this.socket.on('ping', () => log('ping'));
        this.socket.on('pong', () => log('pong'));
        this.socket.on('error', (err) => log('error', err));

        // Log all received events
        this.socket.onAny((event, ...args) => {
            if (event !== '*') { // avoid infinite loop
                log('receive', event, ...args);
            }
        });

        // Log emitted events (optional, can be verbose)
        const originalEmit = this.socket.emit.bind(this.socket);
        this.socket.emit = (...args: any[]) => {
            log('emit', args[ 0 ], args.slice(1));
            return (originalEmit as any)(...args);
        };

        // Log when listeners are added
        const originalOn = this.socket.on.bind(this.socket);
        this.socket.on = (event: string, handler: any) => {
            log('add_listener', event);
            return originalOn(event, handler);
        };
    }

    public disconnect () {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    public on (event: string, handler: EventHandler) {
        this.socket?.on(event, handler);
    }

    public off (event: string, handler?: EventHandler) {
        if (!this.socket) return;
        if (handler) this.socket.off(event, handler);
        else this.socket.removeAllListeners(event);
    }

    public once (event: string, handler: EventHandler) {
        this.socket?.once(event, handler);
    }

    public emit (event: string, ...args: any[]) {
        this.socket?.emit(event, ...args);
    }

    public isConnected () {
        return !!this.socket && this.socket.connected;
    }
}

export async function handleSocketConnectError (err: any) {
    // eslint-disable-next-line no-console
    console.error('[socket] connect_error', err);
    logger.reportError({ message: 'Socket connect_error', meta: err, level: 'error' });

    // auth failure signal
    const message = (err && (err.message || err))?.toString?.() || '';
    const isAuth = /AUTH_REQUIRED|INVALID_TOKEN|AUTH/i.test(message);
    const isInsufficientFunds = /INSUFFICIENT_FUNDS/i.test(message);
    if (isAuth) {
        try {
            // static dynamic import for correct module instance
            const { default: appEvents } = await import('../utils/appEvents');
            appEvents.emit('socket:auth_error', { reason: message });
        } catch (e) {}
    }
    if (isInsufficientFunds) {
        try {
            const { default: appEvents } = await import('../utils/appEvents');
            appEvents.emit('socket:insufficient_funds', { reason: message });
        } catch (e) {}
    }
}

export const socketClient = SocketClient.getInstance();
