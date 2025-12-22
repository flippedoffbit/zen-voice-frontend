import { Device } from 'mediasoup-client';
import { logger } from '../utils/logger';

export class MediasoupClient {
    private device: Device | null = null;
    private sendTransport: any = null;
    private recvTransport: any = null;

    public async loadDevice (routerRtpCapabilities: any) {
        try {
            this.device = new Device();
            await this.device.load({ routerRtpCapabilities });
            return this.device;
        } catch (error) {
            logger.error('Failed to load mediasoup device:', error);
            throw error;
        }
    }

    public getDevice () {
        return this.device;
    }

    public isLoaded () {
        return this.device !== null && (this.device as any).loaded;
    }

    /**
     * Create a send transport from server-provided transport options and wire up events.
     * callbacks.connect should send dtlsParameters to server and resolve when server acknowledges.
     * callbacks.produce should ask server to create a producer and return the produced id.
     */
    public createSendTransport (transportOptions: any, callbacks: {
        connect: (dtlsParameters: any) => Promise<void>;
        produce: (kind: string, rtpParameters: any) => Promise<string>;
    }) {
        if (!this.device) throw new Error('Device not loaded');
        this.sendTransport = (this.device as any).createSendTransport(transportOptions);

        this.sendTransport.on('connect', async ({ dtlsParameters }: any, cb: any, errCb: any) => {
            try {
                await callbacks.connect(dtlsParameters);
                cb();
            } catch (e) {
                errCb(e);
            }
        });

        this.sendTransport.on('produce', async ({ kind, rtpParameters }: any, cb: any, errCb: any) => {
            try {
                const id = await callbacks.produce(kind, rtpParameters);
                cb({ id });
            } catch (e) {
                errCb(e);
            }
        });

        return this.sendTransport;
    }

    /**
     * Create a recv transport and wire up connect handler.
     */
    public createRecvTransport (transportOptions: any, callbacks: { connect: (dtlsParameters: any) => Promise<void>; }) {
        if (!this.device) throw new Error('Device not loaded');
        this.recvTransport = (this.device as any).createRecvTransport(transportOptions);

        this.recvTransport.on('connect', async ({ dtlsParameters }: any, cb: any, errCb: any) => {
            try {
                await callbacks.connect(dtlsParameters);
                cb();
            } catch (e) {
                errCb(e);
            }
        });

        return this.recvTransport;
    }

    public getSendTransport () {
        return this.sendTransport;
    }

    public getRecvTransport () {
        return this.recvTransport;
    }
}

export const mediasoupClient = new MediasoupClient();
