import { socketClient } from '../socket/client';
import { mediasoupClient } from '../mediasoup/client';
import { ConsumeRequest, ConsumedResponse } from './types';
import { toast } from 'react-hot-toast';

type AnyRtcStats = any;

function statsValues (stats: AnyRtcStats): any[] {
    try {
        const out: any[] = [];
        if (!stats) return out;
        if (typeof stats.forEach === 'function') {
            stats.forEach((v: any) => out.push(v));
            return out;
        }
        // Some polyfills return iterable of [id, stat]
        if (typeof (stats as any)[ Symbol.iterator ] === 'function') {
            for (const entry of stats as any) {
                if (Array.isArray(entry) && entry.length >= 2) out.push(entry[ 1 ]);
                else out.push(entry);
            }
        }
        return out;
    } catch (e) {
        return [];
    }
}

function summarizeIceServers (iceServers: any) {
    if (!Array.isArray(iceServers)) return iceServers;
    return iceServers.map((s) => ({
        urls: s?.urls,
        username: s?.username ? '[redacted]' : undefined,
        credential: s?.credential ? '[redacted]' : undefined
    }));
}

function summarizeIceCandidates (candidates: any) {
    if (!Array.isArray(candidates)) return candidates;
    return candidates.map((c) => ({
        foundation: c?.foundation,
        ip: c?.ip,
        address: c?.address,
        port: c?.port,
        protocol: c?.protocol,
        priority: c?.priority,
        type: c?.type,
        candidateType: c?.candidateType,
        tcpType: c?.tcpType
    }));
}

function summarizeDtls (dtlsParameters: any) {
    const fp = Array.isArray(dtlsParameters?.fingerprints) ? dtlsParameters.fingerprints[ 0 ] : undefined;
    return {
        role: dtlsParameters?.role,
        fingerprint: fp ? { algorithm: fp.algorithm, value: fp.value } : undefined
    };
}

function safeStringify (value: any, space: number | undefined = undefined, maxLen = 12000) {
    const seen = new WeakSet<object>();
    let str = '';
    try {
        str = JSON.stringify(
            value,
            (_k, v) => {
                if (typeof v === 'bigint') return v.toString();
                if (v && typeof v === 'object') {
                    if (seen.has(v)) return '[Circular]';
                    seen.add(v);
                }
                return v;
            },
            space
        );
    } catch (e) {
        try {
            str = String(value);
        } catch (e2) {
            str = '[unstringifiable]';
        }
    }
    if (typeof str === 'string' && str.length > maxLen) {
        return str.slice(0, maxLen) + `…(truncated ${ str.length - maxLen } chars)`;
    }
    return str;
}

function dumpRtcStatsSummary (label: string, stats: AnyRtcStats) {
    const values = statsValues(stats);
    const outboundAudio = values.find((s) => s?.type === 'outbound-rtp' && (s.kind === 'audio' || s.mediaType === 'audio'));
    const candidatePairs = values.filter((s) => s?.type === 'candidate-pair');
    const selectedPair = candidatePairs.find((p) => p?.selected) || candidatePairs.find((p) => p?.nominated) || candidatePairs.find((p) => p?.state === 'succeeded');

    let localCand: any;
    let remoteCand: any;
    if (selectedPair?.localCandidateId) localCand = values.find((s) => s?.id === selectedPair.localCandidateId);
    if (selectedPair?.remoteCandidateId) remoteCand = values.find((s) => s?.id === selectedPair.remoteCandidateId);

    console.log(label, {
        outboundRtp: outboundAudio
            ? {
                bytesSent: outboundAudio.bytesSent,
                packetsSent: outboundAudio.packetsSent,
                ssrc: outboundAudio.ssrc,
                active: outboundAudio.active,
                roundTripTime: outboundAudio.roundTripTime
            }
            : undefined,
        selectedCandidatePair: selectedPair
            ? {
                state: selectedPair.state,
                nominated: selectedPair.nominated,
                selected: selectedPair.selected,
                writable: selectedPair.writable,
                currentRoundTripTime: selectedPair.currentRoundTripTime,
                totalRoundTripTime: selectedPair.totalRoundTripTime,
                availableOutgoingBitrate: selectedPair.availableOutgoingBitrate,
                bytesSent: selectedPair.bytesSent,
                bytesReceived: selectedPair.bytesReceived,
                localCandidateId: selectedPair.localCandidateId,
                remoteCandidateId: selectedPair.remoteCandidateId
            }
            : undefined,
        localCandidate: localCand
            ? {
                candidateType: localCand.candidateType,
                protocol: localCand.protocol,
                ip: localCand.ip ?? localCand.address,
                port: localCand.port,
                networkType: localCand.networkType,
                relayProtocol: localCand.relayProtocol
            }
            : undefined,
        remoteCandidate: remoteCand
            ? {
                candidateType: remoteCand.candidateType,
                protocol: remoteCand.protocol,
                ip: remoteCand.ip ?? remoteCand.address,
                port: remoteCand.port,
                relayProtocol: remoteCand.relayProtocol
            }
            : undefined
    });

    // Compact line for copy/paste (DevTools often collapses objects)
    try {
        console.log(`${ label } compact`, {
            outboundBytesSent: outboundAudio?.bytesSent,
            outboundPacketsSent: outboundAudio?.packetsSent,
            candidatePairState: selectedPair?.state,
            candidatePairSelected: selectedPair?.selected,
            candidatePairNominated: selectedPair?.nominated,
            localCandidateType: localCand?.candidateType,
            localIp: localCand?.ip ?? localCand?.address,
            localPort: localCand?.port,
            remoteCandidateType: remoteCand?.candidateType,
            remoteIp: remoteCand?.ip ?? remoteCand?.address,
            remotePort: remoteCand?.port
        });
    } catch (e) {}
}

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

function socketOnceMatch<T = any> (
    event: string,
    predicate: (payload: T) => boolean,
    timeoutMs = 10000
) {
    return new Promise<T>((resolve, reject) => {
        let timeout: any;

        const handler = (payload: T) => {
            let matched = false;
            try {
                matched = predicate(payload);
            } catch (e) {
                // predicate errors should not break the listener; treat as non-match
                matched = false;
            }

            if (!matched) return;

            try { socketClient.off(event, handler as any); } catch (e) {}
            if (timeout) clearTimeout(timeout);
            resolve(payload);
        };

        socketClient.on(event, handler as any);

        timeout = setTimeout(() => {
            try { socketClient.off(event, handler as any); } catch (e) {}
            reject(new Error(`[MediaSoup] Timeout waiting for ${ event }`));
        }, timeoutMs);
    });
}

function createRequestId (prefix: string) {
    return `${ prefix }-${ Date.now() }-${ Math.random().toString(16).slice(2) }`;
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
    const device = mediasoupClient.getDevice();
    console.log('[MediaSoup] Device loaded successfully', {
        canProduceAudio: device?.canProduce ? device.canProduce('audio') : false,
        rtpCapabilities: device?.rtpCapabilities
    });

    // Ensure device has rtpCapabilities populated for consumption flows
    if (!device || !device.rtpCapabilities) {
        console.warn('[MediaSoup] Device or rtpCapabilities missing after load - consumption may fail');
    }

    // create send transport
    const sendTransportRequestId = createRequestId('create-transport-send');
    socketClient.emit('create-transport', { roomId, direction: 'send', requestId: sendTransportRequestId });
    console.log('[MediaSoup] Emitted create-transport send for room:', roomId);
    const sendTransportOpts = await socketOnceMatch<any>(
        'transport-created',
        (p) => {
            const payloadRoomId = p?.roomId;
            if (payloadRoomId && String(payloadRoomId) !== String(roomId)) return false;

            const payloadRequestId = p?.requestId ?? p?.reqId;
            if (payloadRequestId) return String(payloadRequestId) === String(sendTransportRequestId);

            const payloadDirection = p?.direction ?? p?.transportDirection ?? p?.dir;
            if (payloadDirection) return String(payloadDirection) === 'send';

            // Fallback: accept the first transport-created event.
            return true;
        },
        10000
    );
    console.log('[MediaSoup] Received transport-created for send:', sendTransportOpts);
    console.log('[MediaSoup] transport-created(send) JSON', safeStringify(sendTransportOpts));
    // Normalize transport id for compatibility with stub/real payloads
    const sendId = sendTransportOpts.transportId ?? sendTransportOpts.id ?? sendTransportOpts.transport_id;
    sendTransportOpts.transportId = sendId;
    sendTransportOpts.id = sendId;

    // Some backends nest iceServers under `_raw.iceServers`; prefer server-provided TURN/STUN when present.
    try {
        const nestedIceServers = sendTransportOpts?._raw?.iceServers ?? sendTransportOpts?.raw?.iceServers;
        if ((!sendTransportOpts.iceServers || (Array.isArray(sendTransportOpts.iceServers) && sendTransportOpts.iceServers.length === 0))
            && Array.isArray(nestedIceServers)
            && nestedIceServers.length > 0) {
            sendTransportOpts.iceServers = nestedIceServers;
            console.log('[MediaSoup] Using server-provided iceServers from _raw for send transport');
        }
    } catch (e) {
        // ignore
    }

    // Ensure ICE servers are present for STUN/TURN
    if (!sendTransportOpts.iceServers || (Array.isArray(sendTransportOpts.iceServers) && sendTransportOpts.iceServers.length === 0)) {
        sendTransportOpts.iceServers = [ { urls: 'stun:stun.l.google.com:19302' } ];
        console.log('[MediaSoup] Injected default ICE servers into send transport options');
    }

    const sendOptsSummary = {
        transportId: sendTransportOpts.transportId,
        iceServers: summarizeIceServers(sendTransportOpts.iceServers),
        iceCandidates: summarizeIceCandidates(sendTransportOpts.iceCandidates),
        iceParameters: sendTransportOpts.iceParameters ? { usernameFragment: sendTransportOpts.iceParameters.usernameFragment ? '[present]' : undefined } : undefined,
        dtlsParameters: sendTransportOpts.dtlsParameters ? summarizeDtls(sendTransportOpts.dtlsParameters) : undefined
    };
    console.log('[MediaSoup] SEND transport options summary', sendOptsSummary);
    console.log('[MediaSoup] SEND transport options summary JSON', safeStringify(sendOptsSummary));

    const sendTransport = mediasoupClient.createSendTransport(sendTransportOpts, {
        connect: async (dtlsParameters: any) => {
            console.log('[MediaSoup] Connecting send transport with DTLS parameters', summarizeDtls(dtlsParameters));
            // inform server to connect transport (use normalized id)
            socketClient.emit('connect-transport', { transportId: sendTransportOpts.transportId, dtlsParameters, roomId });
            console.log('[MediaSoup] Emitted connect-transport for send transport:', sendTransportOpts.transportId);
            try {
                const ack = await socketOnceMatch<any>(
                    'transport-connected',
                    (p) => {
                        const ackId = p?.transportId ?? p?.id ?? p?.transport_id;
                        // If server doesn't include an id, accept the first ack but log a warning.
                        if (!ackId) return true;
                        return String(ackId) === String(sendTransportOpts.transportId);
                    },
                    10000
                );
                const ackId = ack?.transportId ?? ack?.id ?? ack?.transport_id;
                if (!ackId) {
                    console.warn('[MediaSoup] transport-connected ack missing transportId; possible cross-ack risk');
                }
                console.log('[MediaSoup] Send transport connected successfully', { ackId, transportId: sendTransportOpts.transportId });
            } catch (err) {
                console.error('[MediaSoup] Send transport connect error:', err);
                throw err;
            }
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

    // Attach debug info for later stats dumps
    try {
        (sendTransport as any).__debug = {
            roomId,
            direction: 'send',
            transportId: sendTransportOpts.transportId,
            iceServers: summarizeIceServers(sendTransportOpts.iceServers),
            iceCandidates: summarizeIceCandidates(sendTransportOpts.iceCandidates)
        };
    } catch (e) {}

    // Log transport state changes for debugging
    try {
        sendTransport.on('connectionstatechange', async (state: any) => {
            console.log('[MediaSoup] Send transport connection state:', state);
            if (state === 'failed') {
                try {
                    console.log('[MediaSoup] SEND transport failed — debug snapshot', (sendTransport as any).__debug);
                    console.log('[MediaSoup] SEND transport failed — debug snapshot JSON', safeStringify((sendTransport as any).__debug));
                } catch (e) {}
                try {
                    if (typeof (sendTransport as any).getStats === 'function') {
                        const tStats = await (sendTransport as any).getStats();
                        dumpRtcStatsSummary('[MediaSoup] SEND transport getStats()', tStats);
                    } else {
                        console.warn('[MediaSoup] sendTransport.getStats() not available');
                    }
                } catch (e) {
                    console.warn('[MediaSoup] Failed to dump sendTransport stats:', e);
                }
            }
        });
        sendTransport.on('iceconnectionstatechange', (state: any) => console.log('[MediaSoup] Send transport ICE connection state:', state));
        sendTransport.on('icegatheringstatechange', (state: any) => console.log('[MediaSoup] Send transport ICE gathering state:', state));
    } catch (e) {
        console.warn('[MediaSoup] sendTransport state event attach failed:', e);
    }

    // create receive transport
    const recvTransportRequestId = createRequestId('create-transport-recv');
    socketClient.emit('create-transport', { roomId, direction: 'recv', requestId: recvTransportRequestId });
    console.log('[MediaSoup] Emitted create-transport recv for room:', roomId);
    const recvTransportOpts = await socketOnceMatch<any>(
        'transport-created',
        (p) => {
            const payloadRoomId = p?.roomId;
            if (payloadRoomId && String(payloadRoomId) !== String(roomId)) return false;

            const payloadRequestId = p?.requestId ?? p?.reqId;
            if (payloadRequestId) return String(payloadRequestId) === String(recvTransportRequestId);

            const payloadDirection = p?.direction ?? p?.transportDirection ?? p?.dir;
            if (payloadDirection) return String(payloadDirection) === 'recv';

            return true;
        },
        10000
    );
    console.log('[MediaSoup] Received transport-created for recv:', recvTransportOpts);
    console.log('[MediaSoup] transport-created(recv) JSON', safeStringify(recvTransportOpts));
    // Normalize transport id for compatibility
    const recvId = recvTransportOpts.transportId ?? recvTransportOpts.id ?? recvTransportOpts.transport_id;
    recvTransportOpts.transportId = recvId;
    recvTransportOpts.id = recvId;

    // Some backends nest iceServers under `_raw.iceServers`; prefer server-provided TURN/STUN when present.
    try {
        const nestedIceServers = recvTransportOpts?._raw?.iceServers ?? recvTransportOpts?.raw?.iceServers;
        if ((!recvTransportOpts.iceServers || (Array.isArray(recvTransportOpts.iceServers) && recvTransportOpts.iceServers.length === 0))
            && Array.isArray(nestedIceServers)
            && nestedIceServers.length > 0) {
            recvTransportOpts.iceServers = nestedIceServers;
            console.log('[MediaSoup] Using server-provided iceServers from _raw for recv transport');
        }
    } catch (e) {
        // ignore
    }

    // Ensure ICE servers are present for STUN/TURN
    if (!recvTransportOpts.iceServers || (Array.isArray(recvTransportOpts.iceServers) && recvTransportOpts.iceServers.length === 0)) {
        recvTransportOpts.iceServers = [ { urls: 'stun:stun.l.google.com:19302' } ];
        console.log('[MediaSoup] Injected default ICE servers into recv transport options');
    }

    const recvOptsSummary = {
        transportId: recvTransportOpts.transportId,
        iceServers: summarizeIceServers(recvTransportOpts.iceServers),
        iceCandidates: summarizeIceCandidates(recvTransportOpts.iceCandidates),
        iceParameters: recvTransportOpts.iceParameters ? { usernameFragment: recvTransportOpts.iceParameters.usernameFragment ? '[present]' : undefined } : undefined,
        dtlsParameters: recvTransportOpts.dtlsParameters ? summarizeDtls(recvTransportOpts.dtlsParameters) : undefined
    };
    console.log('[MediaSoup] RECV transport options summary', recvOptsSummary);
    console.log('[MediaSoup] RECV transport options summary JSON', safeStringify(recvOptsSummary));

    const recvTransport = mediasoupClient.createRecvTransport(recvTransportOpts, {
        connect: async (dtlsParameters: any) => {
            console.log('[MediaSoup] Connecting recv transport with DTLS parameters', summarizeDtls(dtlsParameters));
            // inform server to connect transport
            socketClient.emit('connect-transport', { transportId: recvTransportOpts.transportId, dtlsParameters, roomId });
            console.log('[MediaSoup] Emitted connect-transport for recv transport:', recvTransportOpts.transportId);
            try {
                const ack = await socketOnceMatch<any>(
                    'transport-connected',
                    (p) => {
                        const ackId = p?.transportId ?? p?.id ?? p?.transport_id;
                        if (!ackId) return true;
                        return String(ackId) === String(recvTransportOpts.transportId);
                    },
                    10000
                );
                const ackId = ack?.transportId ?? ack?.id ?? ack?.transport_id;
                if (!ackId) {
                    console.warn('[MediaSoup] transport-connected ack missing transportId; possible cross-ack risk');
                }
                console.log('[MediaSoup] Recv transport connected successfully', { ackId, transportId: recvTransportOpts.transportId });
            } catch (err) {
                console.error('[MediaSoup] Recv transport connect error:', err);
                throw err;
            }
        }
    });

    try {
        (recvTransport as any).__debug = {
            roomId,
            direction: 'recv',
            transportId: recvTransportOpts.transportId,
            iceServers: summarizeIceServers(recvTransportOpts.iceServers),
            iceCandidates: summarizeIceCandidates(recvTransportOpts.iceCandidates)
        };
    } catch (e) {}

    // Log transport state changes for debugging
    try {
        recvTransport.on('connectionstatechange', (state: any) => console.log('[MediaSoup] Recv transport connection state:', state));
        recvTransport.on('iceconnectionstatechange', (state: any) => console.log('[MediaSoup] Recv transport ICE connection state:', state));
        recvTransport.on('icegatheringstatechange', (state: any) => console.log('[MediaSoup] Recv transport ICE gathering state:', state));
    } catch (e) {
        console.warn('[MediaSoup] recvTransport state event attach failed:', e);
    }

    console.log('[MediaSoup] MediaSoup initialization complete');
    return { sendTransport, recvTransport, device: mediasoupClient.getDevice() };
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
    console.log('[MediaSoup] Audio track details:', {
        id: track.id,
        kind: track.kind,
        enabled: track.enabled,
        muted: track.muted,
        readyState: track.readyState,
        label: track.label
    });

    // Monitor outgoing audio levels to verify we're sending data
    try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        console.log('[MediaSoup] Producer AudioContext created:', {
            state: audioContext.state,
            sampleRate: audioContext.sampleRate
        });

        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        source.connect(analyser);

        console.log('[MediaSoup] Producer audio monitoring established');

        // Monitor audio levels from microphone
        let checkCount = 0;
        const monitorProducerAudioLevel = () => {
            if (checkCount >= 20) return; // Stop after 20 checks

            analyser.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
            const max = Math.max(...Array.from(dataArray));

            console.log(`[MediaSoup] PRODUCER audio level check ${ checkCount + 1 }/20:`, {
                average: average.toFixed(2),
                max: max,
                hasSignal: max > 0,
                isSpeaking: max > 10, // Threshold for speech detection
                trackEnabled: track.enabled,
                trackMuted: track.muted,
                trackReadyState: track.readyState
            });

            checkCount++;
            setTimeout(monitorProducerAudioLevel, 500);
        };

        // Start monitoring immediately
        setTimeout(monitorProducerAudioLevel, 100);
    } catch (error) {
        console.error('[MediaSoup] Failed to setup producer audio monitoring:', error);
    }

    console.log('[MediaSoup] Producing audio track...');
    const producer = await sendTransport.produce({ track });
    console.log('[MediaSoup] Audio producer created:', producer);

    // Periodically dump sender-side RTP stats so the user can share a single block of evidence.
    try {
        let dumpCount = 0;
        const MAX_DUMPS = 10;
        const intervalMs = 1500;
        const timer = setInterval(async () => {
            dumpCount++;
            try {
                const dbg = (sendTransport as any).__debug;
                console.log('[MediaSoup] SENDER STATS DUMP', {
                    dump: `${ dumpCount }/${ MAX_DUMPS }`,
                    transport: dbg,
                    producerId: producer?.id,
                    transportConnectionState: (sendTransport as any).connectionState,
                    t: Date.now()
                });
                if (producer && typeof (producer as any).getStats === 'function') {
                    const pStats = await (producer as any).getStats();
                    dumpRtcStatsSummary('[MediaSoup] producer.getStats()', pStats);
                } else {
                    console.warn('[MediaSoup] producer.getStats() not available');
                }
            } catch (e) {
                console.warn('[MediaSoup] Failed to dump producer stats:', e);
            }

            if (dumpCount >= MAX_DUMPS) {
                clearInterval(timer);
            }
        }, intervalMs);
    } catch (e) {
        console.warn('[MediaSoup] Failed to start sender stats dump interval:', e);
    }

    // Listen for server-side reports that consumers are receiving 0 bytes for this producer
    const onConsumerZeroBytes = (payload: any) => {
        try {
            if (payload && payload.producerId && String(payload.producerId) === String(producer.id)) {
                console.warn('[MediaSoup] (Sending side) Consumer reports 0 bytes received — likely server-side routing issue', payload);

                // UI notification for sending user
                try {
                    toast.error('A listener reports no audio. Attempting to fix routing...');
                } catch (tErr) {
                    console.warn('[MediaSoup] Failed to show toast for consumer-zero-bytes:', tErr);
                }

                // Emit a server-side probe to attempt to refresh routing (server may optionally handle this)
                try {
                    socketClient.emit('producer-check-route', { producerId: producer.id, timestamp: Date.now() });
                    console.log('[MediaSoup] Emitted producer-check-route for producer:', producer.id);
                } catch (emitErr) {
                    console.warn('[MediaSoup] Failed to emit producer-check-route:', emitErr);
                }
            }
        } catch (e) {
            console.warn('[MediaSoup] consumer-zero-bytes handler failed:', e);
        }
    };
    socketClient.on('consumer-zero-bytes', onConsumerZeroBytes as any);

    // Cleanup when producer stops
    try {
        (producer as any).on('transportclose', () => {
            try { socketClient.off('consumer-zero-bytes', onConsumerZeroBytes as any); } catch (e) {}
        });
        (producer as any).on('close', () => {
            try { socketClient.off('consumer-zero-bytes', onConsumerZeroBytes as any); } catch (e) {}
        });
    } catch (e) {
        // Older mocks may not support .on
    }

    return { producer, stream };
}

export async function consumeProducer (recvTransport: any, producerId: string, roomId: string, rtpCapabilities: any) {
    console.log('[MediaSoup] Consuming producer:', producerId);
    console.log('[MediaSoup] RTP Capabilities:', JSON.stringify(rtpCapabilities, null, 2));
    // Request consumer creation from server
    const consumeRequest: ConsumeRequest = {
        producerId,
        rtpCapabilities,
        transportId: recvTransport.id,
        roomId
    };
    const flowStart = Date.now();
    console.log('[MediaSoup] Consume flow start', { producerId, roomId, transportId: recvTransport.id, t: flowStart });

    socketClient.emit('consume', consumeRequest);
    console.log('[MediaSoup] Emitted consume for producer:', producerId, 'on transport:', recvTransport.id, 'at', Date.now());

    // Wait for consumer data
    const payload: ConsumedResponse = await socketOnce<ConsumedResponse>('consumed');
    const consumedAt = Date.now();
    console.log('[MediaSoup] Received consumed:', payload, { consumedAt, elapsedMs: consumedAt - flowStart });

    // Validate response
    if (!payload.consumerId || !payload.id || !payload.producerId) {
        console.error('[MediaSoup] Missing consumerId, id, or producerId', payload);
        throw new Error('Invalid consumer payload');
    }

    const rtpParams = payload.rtpParameters;
    if (!rtpParams || Object.keys(rtpParams).length === 0) {
        console.warn('[MediaSoup] Missing rtpParameters; skipping consumer', payload);
        return; // Skip consuming, don't throw
    }

    // Consume the stream
    console.log('[MediaSoup] Calling recvTransport.consume()', { ts: Date.now() });
    const consumeStart = Date.now();
    let consumer: any = await recvTransport.consume({
        id: payload.consumerId,
        producerId: payload.producerId, // Use producerId from response
        kind: payload.kind, // Use kind from response
        rtpParameters: rtpParams
    });
    const consumeResolved = Date.now();
    console.log('[MediaSoup] recvTransport.consume() resolved', { elapsedMs: consumeResolved - consumeStart, ts: consumeResolved });
    console.log('[MediaSoup] Consumer created:', consumer);

    // helper for re-consuming in case 0-bytes detected
    let reconsumeInProgress = false;
    let reconsumeAttempts = 0;
    const MAX_RECONSUME = 2;
    const reconsume = async () => {
        if (reconsumeInProgress) return;
        if (reconsumeAttempts >= MAX_RECONSUME) return;
        reconsumeAttempts++;
        reconsumeInProgress = true;
        console.log('[MediaSoup] Attempting re-consume attempt', reconsumeAttempts);
        try {
            try { consumer.close && consumer.close(); } catch (e) {}
        } catch (e) {}

        try {
            // Emit a fresh consume request to server
            socketClient.emit('consume', consumeRequest);
            console.log('[MediaSoup] Re-emitted consume for producer:', producerId, 'attempt:', reconsumeAttempts);
            const newPayload: ConsumedResponse = await socketOnce<ConsumedResponse>('consumed');
            if (!newPayload || !newPayload.rtpParameters) {
                console.warn('[MediaSoup] reconsume: server did not return valid consumed payload', newPayload);
                reconsumeInProgress = false;
                return;
            }

            const newRtp = newPayload.rtpParameters;
            const newConsumer = await recvTransport.consume({
                id: newPayload.consumerId,
                producerId: newPayload.producerId,
                kind: newPayload.kind,
                rtpParameters: newRtp
            });

            consumer = newConsumer;
            console.log('[MediaSoup] reconsume: new consumer created', { id: consumer.id });

            if (consumer.paused) {
                try { await consumer.resume(); } catch (e) { console.warn('[MediaSoup] reconsume resume failed:', e); }
            }

            // swap audio.srcObject to new stream
            try {
                const newStream = new MediaStream([ consumer.track ]);
                audio.srcObject = newStream;
                console.log('[MediaSoup] reconsume: updated audio.srcObject');

                // Try to resume global AudioContext first (may be suspended)
                try {
                    const audioCtx = (window as any).__mediasoupAudioContext;
                    if (audioCtx && audioCtx.state === 'suspended') {
                        console.log('[MediaSoup] reconsume: attempting to resume global AudioContext in user gesture fallback');
                        try {
                            await audioCtx.resume();
                            console.log('[MediaSoup] reconsume: AudioContext resumed:', audioCtx.state);
                        } catch (resumeErr) {
                            console.warn('[MediaSoup] reconsume: AudioContext resume failed:', resumeErr);
                        }
                    }
                } catch (e) {
                    console.warn('[MediaSoup] reconsume: error checking/resuming AudioContext', e);
                }

                // Try to play; if blocked by autoplay policy, attempt a muted play as a fallback
                try {
                    await audio.play();
                    console.log('[MediaSoup] reconsume: audio.play succeeded');
                } catch (playErr: any) {
                    console.warn('[MediaSoup] reconsume: audio.play failed', playErr);
                    if (playErr && (playErr.name === 'NotAllowedError' || playErr.message?.includes('not allowed'))) {
                        // Try muted play to bypass autoplay restriction for diagnostic purposes
                        try {
                            audio.muted = true;
                            await audio.play();
                            console.log('[MediaSoup] reconsume: muted audio.play succeeded; will leave muted until user interaction');
                            // Notify user that audio is muted due to autoplay restrictions
                            try { toast('Audio enabled in muted mode due to autoplay restrictions. Click anywhere to unmute.'); } catch (tErr) {}
                        } catch (mutedErr) {
                            console.warn('[MediaSoup] reconsume: muted audio.play failed:', mutedErr);
                        }
                    }
                }
            } catch (e) {
                console.warn('[MediaSoup] reconsume: failed to attach new stream to audio', e);
            }
        } catch (err) {
            console.warn('[MediaSoup] reconsume attempt failed:', err);
        } finally {
            reconsumeInProgress = false;
        }
    };
    console.log('[MediaSoup] Consumer paused state:', consumer.paused);

    // CRITICAL: Resume the consumer to start receiving media
    // Consumers are created in paused state by default
    if (consumer.paused) {
        console.log('[MediaSoup] Resuming consumer... at', Date.now());
        const resumeStart = Date.now();
        await consumer.resume();
        const resumeDone = Date.now();
        console.log('[MediaSoup] Consumer resumed successfully', { elapsedMs: resumeDone - resumeStart, resumeDone, totalFlowMs: resumeDone - flowStart });
    }

    console.log('[MediaSoup] Consumer track:', consumer.track);
    console.log('[MediaSoup] Consumer track details:', {
        id: consumer.track.id,
        kind: consumer.track.kind,
        enabled: consumer.track.enabled,
        muted: consumer.track.muted,
        readyState: consumer.track.readyState,
        label: consumer.track.label
    });

    // Ensure consumer track is enabled and unmuted
    consumer.track.enabled = true;

    // Create audio element with Safari-specific attributes
    const remoteStream = new MediaStream([ consumer.track ]);

    // CRITICAL: Use Web Audio API for Safari compatibility
    // Safari has issues with HTMLAudioElement for WebRTC streams
    let audioContext: AudioContext | null = null;
    try {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        console.log('[MediaSoup] AudioContext created:', {
            state: audioContext.state,
            sampleRate: audioContext.sampleRate,
            destination: !!audioContext.destination
        });

        // Create source from MediaStream
        const source = audioContext.createMediaStreamSource(remoteStream);

        // Create analyser to monitor audio levels
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        // Create gain node for volume control
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 1.0;

        // Connect source -> analyser -> gain -> destination (speakers)
        source.connect(analyser);
        analyser.connect(gainNode);
        gainNode.connect(audioContext.destination);

        console.log('[MediaSoup] Web Audio API routing established:', {
            sourceConnected: true,
            gainValue: gainNode.gain.value,
            contextState: audioContext.state,
            streamActive: remoteStream.active,
            trackEnabled: consumer.track.enabled,
            trackMuted: consumer.track.muted
        });

        // Resume audio context if suspended (Safari requirement)
        // Note: This may not succeed without user interaction, but we try anyway
        if (audioContext.state === 'suspended') {
            console.log('[MediaSoup] AudioContext suspended, attempting to resume...');
            console.log('[MediaSoup] Note: If this hangs, user interaction is required. Click anywhere on the page.');

            // Don't await - resume asynchronously without blocking
            // The user interaction handler will retry if this fails
            const ctx = audioContext; // Capture for closure
            ctx.resume()
                .then(() => {
                    console.log('[MediaSoup] AudioContext resumed successfully. New state:', ctx.state);
                })
                .catch((resumeError) => {
                    console.error('[MediaSoup] Failed to resume AudioContext:', resumeError);
                    console.log('[MediaSoup] User interaction required. Click anywhere on the page to enable audio.');
                });
        } else {
            console.log('[MediaSoup] AudioContext already running:', audioContext.state);
        }

        // Store reference globally for later resume attempts
        (window as any).__mediasoupAudioContext = audioContext;
        let checkCount = 0;
        const monitorAudioLevel = () => {
            if (checkCount >= 20) return; // Stop after 20 checks
            if (!audioContext) {
                console.warn('[MediaSoup] AudioContext unavailable, stopping audio monitor');
                return;
            }

            analyser.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
            const max = Math.max(...Array.from(dataArray));

            console.log(`[MediaSoup] Audio level check ${ checkCount + 1 }/20:`, {
                average: average.toFixed(2),
                max: max,
                hasSignal: max > 0,
                contextState: audioContext?.state || 'unknown',
                trackEnabled: consumer.track.enabled,
                trackMuted: consumer.track.muted,
                trackReadyState: consumer.track.readyState
            });

            checkCount++;
            setTimeout(monitorAudioLevel, 500);
        };

        // Start monitoring after a brief delay
        setTimeout(monitorAudioLevel, 500);

    } catch (webAudioError) {
        console.error('[MediaSoup] Web Audio API failed, falling back to HTMLAudioElement:', webAudioError);
    }

    // Also create HTMLAudioElement as fallback/additional output
    const audio = document.createElement('audio');
    audio.srcObject = remoteStream;
    audio.volume = 1.0;
    audio.autoplay = true;
    audio.controls = false; // Hide controls but keep in DOM
    audio.setAttribute('playsinline', 'true'); // Important for iOS Safari
    audio.muted = false;
    audio.style.display = 'none'; // Hide but keep in DOM

    // Append to body (required for Safari to actually play)
    document.body.appendChild(audio);

    console.log('[MediaSoup] Audio element created and attached to DOM:', {
        srcObject: !!audio.srcObject,
        volume: audio.volume,
        muted: audio.muted,
        paused: audio.paused,
        readyState: audio.readyState,
        parentElement: audio.parentElement?.tagName,
        tracks: remoteStream.getTracks().map(t => ({
            id: t.id,
            kind: t.kind,
            enabled: t.enabled,
            muted: t.muted,
            readyState: t.readyState,
            label: t.label
        }))
    });

    // Attach diagnostic handlers to the consumer track to detect when data starts flowing
    try {
        const track = consumer.track;
        track.addEventListener('unmute', () => {
            console.log('[MediaSoup] Consumer track unmuted — media is being received');
        });
        track.addEventListener('mute', () => {
            console.warn('[MediaSoup] Consumer track muted — no media is currently being received');
        });
        track.addEventListener('ended', () => {
            console.warn('[MediaSoup] Consumer track ended');
        });

        // Try to read RTC stats if available (mediasoup-client may expose getStats)
        try {
            const maybeGetStats = (consumer as any).getStats;
            if (typeof maybeGetStats === 'function') {
                (consumer as any).getStats().then((stats: any) => {
                    console.log('[MediaSoup] Consumer getStats result:', stats);
                    try {
                        // Parse RTCStatsReport or plain object to extract useful metrics
                        let totalBytesReceived = 0;
                        if (typeof stats?.forEach === 'function') {
                            stats.forEach((stat: any) => {
                                // inbound-rtp entries carry bytesReceived in modern browsers
                                if (stat.type === 'inbound-rtp' || stat.type === 'inbound-rtp' /* keep both for clarity */) {
                                    const bytes = Number(stat.bytesReceived ?? stat.bytes_received ?? 0) || 0;
                                    totalBytesReceived += bytes;
                                    console.log('[MediaSoup] inbound-rtp stat:', { id: stat.id, bytesReceived: bytes, packetsReceived: stat.packetsReceived ?? stat.packets_received });
                                }
                                // Older / different stats may surface track or transport entries
                                if (stat.type === 'track' || stat.type === 'inbound-rtp') {
                                    // log relevant track fields for debugging
                                    console.log('[MediaSoup] track/rtp stat debug:', stat.type, stat);
                                }
                            });
                        } else if (stats && typeof stats === 'object') {
                            // Try to extract common fields
                            const maybeBytes = stats?.bytesReceived ?? stats?.bytes_received ?? null;
                            totalBytesReceived = Number(maybeBytes ?? 0) || 0;
                        }
                        console.log('[MediaSoup] Consumer totalBytesReceived:', totalBytesReceived);
                    } catch (parseErr) {
                        console.warn('[MediaSoup] Failed to parse consumer stats:', parseErr);
                    }
                }).catch((err: any) => {
                    console.warn('[MediaSoup] Consumer getStats failed:', err);
                });
            } else {
                console.debug('[MediaSoup] consumer.getStats not available on this client build');
            }
        } catch (statsErr) {
            console.warn('[MediaSoup] Error while attempting to get consumer stats:', statsErr);
        }
    } catch (trackErr) {
        console.warn('[MediaSoup] Failed to attach track event listeners:', trackErr);
    }

    // Try to play audio, but handle browser autoplay restrictions
    try {
        const playPromise = audio.play();
        console.log('[MediaSoup] Play promise initiated');
        await playPromise;
        console.log('[MediaSoup] Audio playing successfully. State:', {
            paused: audio.paused,
            currentTime: audio.currentTime,
            volume: audio.volume,
            muted: audio.muted,
            duration: audio.duration
        });
    } catch (error) {
        if (error instanceof DOMException && error.name === 'NotAllowedError') {
            console.warn('[MediaSoup] Audio play blocked by browser autoplay policy. Audio will play after user interaction.');
            // Audio element is created and ready, but won't play until user interacts
            // This is expected behavior - browsers block autoplay without user interaction
        } else {
            console.error('[MediaSoup] Failed to play audio:', error);
            throw error;
        }
    }

    // Add periodic diagnostics to confirm whether we are receiving audio frames
    let diagnosticCount = 0;
    let zeroReported = false;
    const diagnosticInterval = setInterval(async () => {
        try {
            diagnosticCount++;
            const track = consumer.track;
            const statsAvailable = typeof (consumer as any).getStats === 'function';

            console.log('[MediaSoup] Consumer diagnostic check', diagnosticCount, {
                trackReadyState: track.readyState,
                trackEnabled: track.enabled,
                trackMuted: track.muted,
                streamActive: remoteStream.active,
                audioElementPaused: audio.paused,
                audioElementReadyState: audio.readyState,
                audioContextState: (window as any).__mediasoupAudioContext?.state || 'unknown',
                statsAvailable
            });

            if (statsAvailable) {
                const stats = await (consumer as any).getStats();
                console.log('[MediaSoup] Consumer stats:', stats);

                // Parse stats to detect inbound bytes
                try {
                    let totalBytes = 0;
                    if (typeof stats?.forEach === 'function') {
                        stats.forEach((s: any) => {
                            if (s.type === 'inbound-rtp') {
                                const b = Number(s.bytesReceived ?? s.bytes_received ?? 0) || 0;
                                totalBytes += b;
                                console.log('[MediaSoup] Diagnostic inbound-rtp stat:', { id: s.id, bytesReceived: b, packetsReceived: s.packetsReceived ?? s.packets_received });
                            }
                        });
                    } else if (stats && typeof stats === 'object') {
                        totalBytes = Number(stats?.bytesReceived ?? stats?.bytes_received ?? 0) || 0;
                    }

                    if (totalBytes === 0) {
                        console.warn('[MediaSoup] Consumer reports 0 bytes received — likely server-side routing issue');

                        // Notify server so it can alert the producer/sender side (or log centrally)
                        if (!zeroReported) {
                            zeroReported = true;
                            try {
                                socketClient.emit('consumer-zero-bytes', {
                                    roomId,
                                    producerId: consumer.producerId,
                                    consumerId: consumer.id,
                                    timestamp: Date.now(),
                                    totalBytes
                                });
                                console.log('[MediaSoup] Emitted consumer-zero-bytes to server for producer:', consumer.producerId);
                            } catch (emitErr) {
                                console.warn('[MediaSoup] Failed to emit consumer-zero-bytes:', emitErr);
                            }
                        }

                        // Attempt local reconsume flow (try to recreate consumer)
                        try {
                            if (reconsumeAttempts < MAX_RECONSUME && !reconsumeInProgress) {
                                console.log('[MediaSoup] Starting local reconsume attempt');
                                setTimeout(() => { void reconsume(); }, 500);
                            } else {
                                console.log('[MediaSoup] Reconsume attempts exhausted or already in progress');
                            }
                        } catch (reErr) {
                            console.warn('[MediaSoup] Failed to start reconsume:', reErr);
                        }
                    } else {
                        console.log('[MediaSoup] Consumer reports bytes received:', totalBytes);
                    }
                } catch (parseErr) {
                    console.warn('[MediaSoup] Failed to parse diagnostic stats:', parseErr);
                }
            }

            if (diagnosticCount >= 10) {
                clearInterval(diagnosticInterval);
            }
        } catch (diagErr) {
            console.error('[MediaSoup] Diagnostic interval failed:', diagErr);
            clearInterval(diagnosticInterval);
        }
    }, 1000);

    return { consumer, audio };
}
