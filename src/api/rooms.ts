import api from './client';

export interface Speaker {
    id: string;
    displayName: string;
    isSpeaking: boolean;
}

export interface Room {
    id: string;
    name: string;
    description: string;
    image?: string;
    listenerCount: number;
    speakers: Speaker[];
    isPrivate?: boolean;
    primaryAdminId?: string;
    isAdmin?: boolean;
    createdAt: string;
}

export async function getRooms () {
    const res = await api.get<{ success: boolean; rooms: Room[]; }>('/rooms');
    return res.data;
}

export async function getRoom (id: string) {
    const res = await api.get<{ success: boolean; room: Room; }>(`/rooms/${ id }`);
    return res.data;
}

export async function uploadRoomImage (roomId: string, file: File) {
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.post<{ success: boolean; imageUrl: string; }>(`/rooms/${ roomId }/image`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
}
