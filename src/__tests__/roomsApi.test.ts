import { describe, it, expect, vi } from 'vitest';
import api from '../api/client';
import { uploadRoomImage } from '../api/rooms';

vi.mock('../api/client', () => ({
    default: {
        post: vi.fn(),
    },
}));

describe('rooms api', () => {
    it('uploadRoomImage sends formData with image', async () => {
        const mockFile = new File([ '' ], 'test.png', { type: 'image/png' });
        const mockResponse = { data: { success: true, imageUrl: '/uploads/abc.png' } };
        (api.post as any).mockResolvedValue(mockResponse);

        const result = await uploadRoomImage('room-1', mockFile);

        expect(api.post).toHaveBeenCalledWith(
            '/rooms/room-1/image',
            expect.any(FormData),
            expect.objectContaining({
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
        );
        expect(result).toEqual(mockResponse.data);
    });
});
