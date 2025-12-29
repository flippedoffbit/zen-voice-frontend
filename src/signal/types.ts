import { types } from 'mediasoup-client';

/**
 * Data shapes for Backend-Frontend Mediasoup Consumer Flow
 * Based on mediasoup v3.x types
 */

// Incoming Event: 'consume' (Frontend to Backend)
export interface ConsumeRequest {
    producerId: string;        // ID of the producer to consume from
    rtpCapabilities: types.RtpCapabilities;  // Client's RTP capabilities (from device.rtpCapabilities)
    transportId: string;       // ID of the client-side transport
    // Optional: paused?: boolean;  // If true, consumer starts paused
}

// Outgoing Event: 'consumed' (Backend to Frontend)
export interface ConsumedResponse {
    id: string;                // Normalized producer ID (string)
    consumerId: string;        // Unique consumer ID from mediasoup
    rtpParameters: types.RtpParameters;  // Authoritative RTP parameters for the consumer
}

// Additional Types (for Reference) - these come from mediasoup-client
// RtpCapabilities and RtpParameters are imported from 'mediasoup-client'