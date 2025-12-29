import { socketClient } from '../socket/client';
import { mediasoupClient } from '../mediasoup/client';

function socketOnce<T = any> (event: string) {
    return new Promise<T>((resolve) => {
        const handler = (payload: T) => {
            // remove listener if underlying socket client still exists
            try { socketClient.off(event, handler as any); } catch (e) {}
            resolve(payload);
        };
        socketClient.once(event, handler as any);
    });
}

export async function initMediasoupForRoom (roomId: string) {
    console.log('[MediaSoup] Initializing for room:', roomId);
    // ask server for router RTP capabilities via socket
    socketClient.emit('get-router-rtp-capabilities', { roomId });
    console.log('[MediaSoup] Emitted get-router-rtp-capabilities for room:', roomId);
    const capsPayload = await socketOnce<{ capabilities: any; }>('router-rtp-capabilities');
    console.log('[MediaSoup] Received router-rtp-capabilities:', capsPayload);

    // load device
    console.log('[MediaSoup] Loading device...');
    await mediasoupClient.loadDevice(capsPayload.capabilities);
    console.log('[MediaSoup] Device loaded successfully');

    // create send transport
    socketClient.emit('create-transport', { roomId, direction: 'send' });
    console.log('[MediaSoup] Emitted create-transport send for room:', roomId);
    const sendTransportOpts = await socketOnce<any>('transport-created');
    console.log('[MediaSoup] Received transport-created for send:', sendTransportOpts);
    // Normalize transport id for compatibility with stub/real payloads
    const sendId = sendTransportOpts.transportId ?? sendTransportOpts.id ?? sendTransportOpts.transport_id;
    sendTransportOpts.transportId = sendId;
    sendTransportOpts.id = sendId;

    const sendTransport = mediasoupClient.createSendTransport(sendTransportOpts, {
        connect: async (dtlsParameters: any) => {
            console.log('[MediaSoup] Connecting send transport with DTLS parameters');
            // inform server to connect transport (use normalized id)
            socketClient.emit('connect-transport', { transportId: sendTransportOpts.transportId, dtlsParameters, roomId });
            console.log('[MediaSoup] Emitted connect-transport for send transport:', sendTransportOpts.transportId);
            await socketOnce<any>('transport-connected');
            console.log('[MediaSoup] Send transport connected successfully');
        },
        produce: async (kind: string, rtpParameters: any) => {
            console.log('[MediaSoup] Producing', kind, 'with RTP parameters');
            socketClient.emit('produce', { transportId: sendTransportOpts.transportId, kind, rtpParameters, roomId });
            console.log('[MediaSoup] Emitted produce for', kind, 'on transport:', sendTransportOpts.transportId);
            const produced = await socketOnce<any>('produced');
            console.log('[MediaSoup] Received produced:', produced);
            // normalize produced id
            const producedId = produced?.producerId ?? produced?.id ?? produced?.producer_id;
            console.log('[MediaSoup] Producer created with ID:', producedId);
            return producedId;
        }
    });

    // create receive transport
    socketClient.emit('create-transport', { roomId, direction: 'recv' });
    console.log('[MediaSoup] Emitted create-transport recv for room:', roomId);
    const recvTransportOpts = await socketOnce<any>('transport-created');
    console.log('[MediaSoup] Received transport-created for recv:', recvTransportOpts);
    // Normalize transport id for compatibility
    const recvId = recvTransportOpts.transportId ?? recvTransportOpts.id ?? recvTransportOpts.transport_id;
    recvTransportOpts.transportId = recvId;
    recvTransportOpts.id = recvId;

    const recvTransport = mediasoupClient.createRecvTransport(recvTransportOpts, {
        connect: async (dtlsParameters: any) => {
            console.log('[MediaSoup] Connecting recv transport with DTLS parameters');
            // inform server to connect transport
            socketClient.emit('connect-transport', { transportId: recvTransportOpts.transportId, dtlsParameters, roomId });
            console.log('[MediaSoup] Emitted connect-transport for recv transport:', recvTransportOpts.transportId);
            await socketOnce<any>('transport-connected');
            console.log('[MediaSoup] Recv transport connected successfully');
        }
    });

    console.log('[MediaSoup] MediaSoup initialization complete');
    return { sendTransport, recvTransport };
}

export async function startProducing (sendTransport: any) {
    console.log('[MediaSoup] Starting audio production...');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('getUserMedia not available');
    console.log('[MediaSoup] Requesting user media (audio)...');
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log('[MediaSoup] Got user media stream:', stream);
    const track = stream.getAudioTracks()[ 0 ];
    if (!track) throw new Error('No audio track');
    console.log('[MediaSoup] Audio track obtained:', track);

    console.log('[MediaSoup] Producing audio track...');
    const producer = await sendTransport.produce({ track });
    console.log('[MediaSoup] Audio producer created:', producer);
    return { producer, stream };
}
