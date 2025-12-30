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
        getDevice: vi.fn(() => ({ rtpCapabilities: { codecs: [] } })),
    }
}));

import { initMediasoupForRoom, consumeProducer } from '../signal/mediasoup';
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
            if (event === 'transport-connected') return setTimeout(() => cb({ success: true }), 0) as any;
            if (event === 'produced') return setTimeout(() => cb({ id: 'producer-1' }), 0) as any;
            return setTimeout(() => cb({}), 0) as any;
        });

        // transport-created is now awaited via socket.on/off (socketOnceMatch)
        (socketClient.on as any).mockImplementation((event: string, cb: any) => {
            if (event === 'transport-created') {
                if (!(socketClient.on as any).__sendReturned) {
                    (socketClient.on as any).__sendReturned = true;
                    return setTimeout(() => cb({ id: 'send-transport-1' }), 0) as any;
                }
                return setTimeout(() => cb({ id: 'recv-transport-1' }), 0) as any;
            }
            return undefined;
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

    it('consumes a producer with server-provided rtpParameters', async () => {
        // Arrange
        const mockTransport = {
            id: 'recv-transport-1',
            consume: vi.fn().mockResolvedValue({ track: { kind: 'audio' } })
        };
        const mockAudio = {
            srcObject: null,
            volume: 1,
            autoplay: false,
            muted: false,
            paused: true,
            readyState: 4,
            currentTime: 0,
            duration: 0,
            controls: false,
            style: { display: '' },
            parentElement: null,
            play: vi.fn().mockResolvedValue(undefined),
            setAttribute: vi.fn()
        };

        // Mock document methods
        global.document = {
            ...global.document,
            createElement: vi.fn((tagName: string) => {
                if (tagName === 'audio') {
                    return mockAudio as any;
                }
                return {} as any;
            }),
            body: {
                appendChild: vi.fn((node: any) => node)
            } as any
        } as any;

        global.Audio = vi.fn().mockImplementation(() => mockAudio);
        global.MediaStream = vi.fn().mockImplementation((tracks) => ({ getTracks: () => tracks }));

        (socketClient.once as any).mockImplementation((event: string, cb: any) => {
            if (event === 'consumed') {
                setTimeout(() => cb({
                    id: 'producer-1', // Normalized producer ID
                    consumerId: 'consumer-1',
                    producerId: 'producer-1',
                    kind: 'audio',
                    rtpParameters: { codecs: [ { mimeType: 'audio/opus' } ], encodings: [ { ssrc: 123 } ] }
                }), 0);
            }
            return Promise.resolve();
        });

        // Act
        const result = await consumeProducer(mockTransport, 'producer-1', 'room-1', { codecs: [] });

        // Assert
        expect(socketClient.emit).toHaveBeenCalledWith('consume', {
            producerId: 'producer-1',
            rtpCapabilities: { codecs: [] },
            transportId: 'recv-transport-1',
            roomId: 'room-1'
        });
        expect(mockTransport.consume).toHaveBeenCalledWith({
            id: 'consumer-1',
            producerId: 'producer-1',
            kind: 'audio',
            rtpParameters: { codecs: [ { mimeType: 'audio/opus' } ], encodings: [ { ssrc: 123 } ] }
        });
        expect(mockAudio.srcObject).toEqual({ getTracks: expect.any(Function) });

        const tracks = mockAudio.srcObject?.getTracks();
        expect(tracks?.[ 0 ]).toEqual({ kind: 'audio', enabled: true });
        expect(mockAudio.play).toHaveBeenCalled();
        expect(result.consumer.track).toEqual({ kind: 'audio', enabled: true });
        expect(result.audio).toBe(mockAudio);
    });

    it('skips consuming when rtpParameters are empty', async () => {
        // Arrange
        const mockTransport = { id: 'recv-transport-1', consume: vi.fn() };
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        (socketClient.once as any).mockImplementation((event: string, cb: any) => {
            if (event === 'consumed') {
                setTimeout(() => cb({
                    id: 'producer-1',
                    consumerId: 'consumer-1',
                    producerId: 'producer-1',
                    kind: 'audio',
                    rtpParameters: {} // Empty
                }), 0);
            }
            return Promise.resolve();
        });

        // Act
        const result = await consumeProducer(mockTransport, 'producer-1', 'room-1', { codecs: [] });

        // Assert
        expect(consoleWarnSpy).toHaveBeenCalledWith('[MediaSoup] Missing rtpParameters; skipping consumer', expect.any(Object));
        expect(mockTransport.consume).not.toHaveBeenCalled();
        expect(result).toBeUndefined();

        consoleWarnSpy.mockRestore();
    });
});
