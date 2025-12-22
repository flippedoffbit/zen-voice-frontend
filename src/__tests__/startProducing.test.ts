import { startProducing } from '../signal/mediasoup';

describe('startProducing', () => {
    it('throws when getUserMedia is not available', async () => {
        // Ensure navigator.mediaDevices is absent for this test
        // @ts-ignore
        const original = global.navigator && (global.navigator as any).mediaDevices;
        // @ts-ignore
        if (global.navigator) delete (global.navigator as any).mediaDevices;

        await expect(startProducing({ produce: async () => {} } as any)).rejects.toThrow('getUserMedia not available');

        // restore
        // @ts-ignore
        if (global.navigator) (global.navigator as any).mediaDevices = original;
    });
});
