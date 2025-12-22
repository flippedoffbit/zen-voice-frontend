import { MediasoupClient } from '../mediasoup/client';

describe('MediasoupClient', () => {
    it('throws when creating transports before device is loaded', () => {
        const client = new MediasoupClient();
        expect(() => client.createSendTransport({}, { connect: async () => {}, produce: async () => '' })).toThrow('Device not loaded');
        expect(() => client.createRecvTransport({}, { connect: async () => {} })).toThrow('Device not loaded');
    });
});
