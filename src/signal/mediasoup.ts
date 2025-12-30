import { socketClient } from '../socket/client';
import { mediasoupClient } from '../mediasoup/client';
import { ConsumeRequest, ConsumedResponse } from './types';

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
    socketClient.emit('consume', consumeRequest);
    console.log('[MediaSoup] Emitted consume for producer:', producerId, 'on transport:', recvTransport.id);

    // Wait for consumer data
    const payload: ConsumedResponse = await socketOnce<ConsumedResponse>('consumed');
    console.log('[MediaSoup] Received consumed:', payload);

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
    const consumer = await recvTransport.consume({
        id: payload.consumerId,
        producerId: payload.producerId, // Use producerId from response
        kind: payload.kind, // Use kind from response
        rtpParameters: rtpParams
    });
    console.log('[MediaSoup] Consumer created:', consumer);
    console.log('[MediaSoup] Consumer paused state:', consumer.paused);

    // CRITICAL: Resume the consumer to start receiving media
    // Consumers are created in paused state by default
    if (consumer.paused) {
        console.log('[MediaSoup] Resuming consumer...');
        await consumer.resume();
        console.log('[MediaSoup] Consumer resumed successfully');
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
