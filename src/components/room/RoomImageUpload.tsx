import React, { useState, useRef } from 'react';
import { Camera, Upload } from 'lucide-react';
import { uploadRoomImage } from '@/api/rooms';
import Spinner from '@/components/ui/Spinner';
import { toast } from 'react-hot-toast';

interface RoomImageUploadProps {
    roomId: string;
    currentImage?: string;
    onUploadSuccess?: (imageUrl: string) => void;
}

export default function RoomImageUpload ({ roomId, currentImage, onUploadSuccess }: RoomImageUploadProps) {
    const [ uploading, setUploading ] = useState(false);
    const [ preview, setPreview ] = useState<string | null>(currentImage || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[ 0 ];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload
        try {
            setUploading(true);
            const result = await uploadRoomImage(roomId, file);
            if (result.success) {
                toast.success('Image uploaded successfully');
                onUploadSuccess?.(result.imageUrl);
            } else {
                toast.error('Failed to upload image');
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.error?.message || 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="relative group">
            <div
                className="w-24 h-24 rounded-2xl bg-surface-light border-2 border-dashed border-divider flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary transition-colors"
                onClick={ triggerFileInput }
            >
                { preview ? (
                    <img src={ preview } alt="Room" className="w-full h-full object-cover" />
                ) : (
                    <Camera className="text-text-muted" size={ 32 } />
                ) }

                { uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Spinner size="sm" />
                    </div>
                ) }

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Upload className="text-white" size={ 24 } />
                </div>
            </div>

            <input
                type="file"
                ref={ fileInputRef }
                onChange={ handleFileChange }
                accept="image/*"
                className="hidden"
            />

            <p className="mt-2 text-xs text-text-muted text-center">
                { uploading ? 'Uploading...' : 'Change Image' }
            </p>
        </div>
    );
}
