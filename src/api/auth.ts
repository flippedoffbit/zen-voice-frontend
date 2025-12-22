import api, { setAuthToken } from './client';

export async function requestOtp (phone: string) {
    return api.post('/auth/request-otp', { phone });
}

export async function verifyOtp (phone: string, otp: string) {
    const res = await api.post('/auth/verify-otp', { phone, otp });
    const token = res.data?.token;
    if (token) setAuthToken(token);
    return res.data;
}

export async function me () {
    return api.get('/auth/me');
}

export async function setDisplayName (displayName: string) {
    return api.post('/auth/set-display-name', { displayName });
}
