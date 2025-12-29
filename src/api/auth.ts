import api, { setAuthToken } from './client';

type Identifier = string | { phone?: string; email?: string; };

export async function requestOtp (id: Identifier) {
    const body = typeof id === 'string' ? { phone: id } : id;
    return api.post('/auth/request-otp', body);
}

export async function verifyOtp (id: Identifier, otp: string) {
    const body = typeof id === 'string' ? { phone: id, otp } : { ...id, otp };
    const res = await api.post('/auth/verify-otp', body);
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
