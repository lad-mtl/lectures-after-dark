/**
 * Percentage of viewport height to scroll before showing the navbar.
 * Used in Navbar.tsx for scroll-triggered visibility.
 */
export const NAVBAR_SCROLL_THRESHOLD_PERCENT = 0.2;

/**
 * Maximum file upload size in bytes (5MB).
 * Used in ImageUploadField.tsx for file validation.
 */
export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Maximum file upload size in megabytes.
 * Used for display in error messages.
 */
export const MAX_UPLOAD_SIZE_MB = 5;

/**
 * Allowed image MIME types for upload.
 */
export const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
];

/**
 * Minimum height for the CraftJS editor canvas.
 * Used in Admin.tsx for consistent editor layout.
 */
export const EDITOR_CANVAS_MIN_HEIGHT = '800px';
