import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../socket/client', () => ({
    socketClient: {
        emit: vi.fn(),
        once: vi.fn(),
        off: vi.fn(),
        on: vi.fn(),
    }
}));

vi.mock('../mediasoup/client', () => ({
    mediasoupClient: {
        loadDevice: vi.fn(),
        createSendTransport: vi.fn(() => ({
            on: vi.fn(),
            produce: vi.fn(async () => 'producer-1')
        })),
        createRecvTransport: vi.fn(() => ({ on: vi.fn() })),
    }
}));

import { initMediasoupForRoom } from '../signal/mediasoup';
import { socketClient } from '../socket/client';
import { mediasoupClient } from '../mediasoup/client';

describe('signal/mediasoup normalization', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('handles transport-created payloads with `id` and `producer.id` shapes', async () => {
        // Arrange: socket.once should return different payloads depending on event
        (socketClient.once as any).mockImplementation((event: string, cb: any) => {
            // simulate server emitting the payload by invoking the callback
            if (event === 'router-rtp-capabilities') return setTimeout(() => cb({ capabilities: {} }), 0) as any;
            if (event === 'transport-created') {
                if (!(socketClient.once as any).__sendReturned) {
                    (socketClient.once as any).__sendReturned = true;
                    return setTimeout(() => cb({ id: 'send-transport-1' }), 0) as any;
                }
                return setTimeout(() => cb({ id: 'recv-transport-1' }), 0) as any;
            }
            if (event === 'transport-connected') return setTimeout(() => cb({ success: true }), 0) as any;
            if (event === 'produced') return setTimeout(() => cb({ id: 'producer-1' }), 0) as any;
            return setTimeout(() => cb({}), 0) as any;
        });

        (mediasoupClient.loadDevice as any).mockResolvedValue(true);

        // Act
        const r = await initMediasoupForRoom('room-x');

        // Assert
        expect(mediasoupClient.loadDevice).toHaveBeenCalled();
        expect(mediasoupClient.createSendTransport).toHaveBeenCalled();
        expect(mediasoupClient.createRecvTransport).toHaveBeenCalled();
        expect(r.sendTransport).toBeTruthy();
        expect(r.recvTransport).toBeTruthy();
    });
});
