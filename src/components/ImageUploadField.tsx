import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Upload, Link2 } from 'lucide-react';

interface ImageUploadFieldProps {
    label: string;
    value: string;
    onChange: (newUrl: string) => void;
}

export const ImageUploadField = ({ label, value, onChange }: ImageUploadFieldProps) => {
    const [mode, setMode] = useState<'upload' | 'url'>('url');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>(value);

    const generateUploadUrl = useMutation(api.files.generateUploadUrl);
    const getFileUrl = useMutation(api.files.getFileUrl);

    const validateFile = (file: File): { valid: boolean; error?: string } => {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            return {
                valid: false,
                error: 'Please upload a valid image file (.jpg, .jpeg, .png, .gif, .webp)'
            };
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return {
                valid: false,
                error: 'File size must be under 5MB'
            };
        }

        return { valid: true };
    };

    const handleFileUpload = async (file: File) => {
        setError(null);

        // Validate file
        const validation = validateFile(file);
        if (!validation.valid) {
            setError(validation.error || 'Invalid file');
            return;
        }

        setUploading(true);

        try {
            // Step 1: Generate upload URL
            const uploadUrl = await generateUploadUrl();

            // Step 2: Upload file to generated URL
            const result = await fetch(uploadUrl, {
                method: 'POST',
                headers: { 'Content-Type': file.type },
                body: file,
            });

            if (!result.ok) {
                throw new Error('Upload failed');
            }

            const { storageId } = await result.json();

            // Step 3: Get public URL from storage ID
            const publicUrl = await getFileUrl({ storageId });

            if (publicUrl) {
                // Update parent component and preview
                onChange(publicUrl);
                setPreviewUrl(publicUrl);
            }
        } catch (err) {
            console.error('Upload failed:', err);
            setError('Upload failed. Please check your connection and try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newUrl = e.target.value;
        onChange(newUrl);
        setPreviewUrl(newUrl);
        setError(null);
    };

    // Styles matching existing Settings Panel
    const inputStyle = {
        width: '100%',
        padding: '8px 10px',
        fontSize: '14px',
        border: '1px solid #cbd5e1',
        borderRadius: '6px',
        background: '#ffffff',
        color: '#1e293b',
        outline: 'none',
        transition: 'border-color 0.2s',
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '6px',
        fontSize: '13px',
        fontWeight: 500,
        color: '#475569',
    };

    const fieldStyle = {
        marginBottom: '14px',
    };

    const toggleButtonStyle = (active: boolean) => ({
        flex: 1,
        padding: '6px 12px',
        fontSize: '13px',
        fontWeight: 500,
        border: '1px solid #cbd5e1',
        background: active ? '#3b82f6' : '#ffffff',
        color: active ? '#ffffff' : '#475569',
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
    });

    const toggleContainerStyle = {
        display: 'flex',
        gap: '0',
        marginBottom: '10px',
    };

    return (
        <div style={fieldStyle}>
            <label style={labelStyle}>{label}</label>

            {/* Mode Toggle */}
            <div style={toggleContainerStyle}>
                <button
                    type="button"
                    onClick={() => setMode('url')}
                    style={{
                        ...toggleButtonStyle(mode === 'url'),
                        borderTopLeftRadius: '6px',
                        borderBottomLeftRadius: '6px',
                        borderRight: 'none',
                    }}
                >
                    <Link2 size={14} />
                    Enter URL
                </button>
                <button
                    type="button"
                    onClick={() => setMode('upload')}
                    style={{
                        ...toggleButtonStyle(mode === 'upload'),
                        borderTopRightRadius: '6px',
                        borderBottomRightRadius: '6px',
                    }}
                >
                    <Upload size={14} />
                    Upload File
                </button>
            </div>

            {/* URL Input Mode */}
            {mode === 'url' && (
                <input
                    type="text"
                    value={value || ''}
                    onChange={handleUrlChange}
                    style={inputStyle}
                    placeholder="https://example.com/image.jpg"
                />
            )}

            {/* File Upload Mode */}
            {mode === 'upload' && (
                <div>
                    <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.gif,.webp"
                        onChange={handleFileChange}
                        disabled={uploading}
                        style={{
                            ...inputStyle,
                            cursor: uploading ? 'not-allowed' : 'pointer',
                            opacity: uploading ? 0.6 : 1,
                        }}
                    />
                </div>
            )}

            {/* Upload Progress */}
            {uploading && (
                <div style={{
                    marginTop: '8px',
                    fontSize: '13px',
                    color: '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <div style={{
                        width: '14px',
                        height: '14px',
                        border: '2px solid #3b82f6',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                    }} />
                    Uploading...
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div style={{
                    marginTop: '8px',
                    padding: '8px',
                    background: '#fee2e2',
                    border: '1px solid #fecaca',
                    borderRadius: '4px',
                    fontSize: '13px',
                    color: '#dc2626',
                }}>
                    {error}
                </div>
            )}

            {/* Image Preview */}
            {previewUrl && !uploading && (
                <div style={{ marginTop: '10px' }}>
                    <img
                        src={previewUrl}
                        alt="Preview"
                        style={{
                            width: '100%',
                            maxHeight: '200px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                        }}
                        onError={() => {
                            // Handle broken image URLs silently
                            setPreviewUrl('');
                        }}
                    />
                </div>
            )}

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};
