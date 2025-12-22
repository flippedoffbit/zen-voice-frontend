import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../utils/logger', () => ({ logger: { reportError: vi.fn(), info: vi.fn() } }));

import appEvents from '../utils/appEvents';

let lastSocket: any = null;
vi.mock('socket.io-client', () => {
    const ioFn = vi.fn((url: string, opts: any) => {
        const handlers: Record<string, Function> = {};
        const s = {
            connected: false,
            on: (ev: string, h: Function) => { handlers[ ev ] = h; },
            off: () => {},
            once: (ev: string, h: Function) => { handlers[ ev ] = h; },
            emit: vi.fn(),
            disconnect: () => {},
            _handlers: handlers
        };
        lastSocket = s;
        return s;
    });
    return {
        io: ioFn,
        default: { io: ioFn }
    };
});

import { socketClient } from '../socket/client';

it('reports connect_error via logger and emits auth event on auth errors', async () => {
    // spy on appEvents.emit
    const emitSpy = vi.spyOn(appEvents, 'emit');

    // Simulate generic connect_error by calling handler directly
    const err = new Error('connect_err');
    const { handleSocketConnectError } = await import('../socket/client');
    await handleSocketConnectError(err);

    // dynamic import is async; wait a tick for the .then handler
    await Promise.resolve();
    const { logger } = await import('../utils/logger');
    expect(logger.reportError).toHaveBeenCalled();

    // Simulate auth-related connect_error
    const authErr = new Error('AUTH_REQUIRED');
    await handleSocketConnectError(authErr);

    expect(emitSpy).toHaveBeenCalledWith('socket:auth_error', expect.objectContaining({ reason: expect.any(String) }));
});

