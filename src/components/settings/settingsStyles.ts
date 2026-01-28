import type { CSSProperties } from 'react';

/**
 * Shared styles for CraftJS settings panel form inputs.
 * Used across all component settings panels for consistency.
 */
export const settingsStyles = {
    input: {
        width: '100%',
        padding: '8px 10px',
        fontSize: '14px',
        border: '1px solid #cbd5e1',
        borderRadius: '6px',
        background: '#ffffff',
        color: '#1e293b',
        outline: 'none',
        transition: 'border-color 0.2s',
    } as CSSProperties,

    label: {
        display: 'block',
        marginBottom: '6px',
        fontSize: '13px',
        fontWeight: 500,
        color: '#475569',
    } as CSSProperties,

    field: {
        marginBottom: '14px',
    } as CSSProperties,

    textarea: {
        width: '100%',
        padding: '8px 10px',
        fontSize: '14px',
        border: '1px solid #cbd5e1',
        borderRadius: '6px',
        background: '#ffffff',
        color: '#1e293b',
        outline: 'none',
        transition: 'border-color 0.2s',
        minHeight: '80px',
        resize: 'vertical' as const,
    } as CSSProperties,

    row: {
        display: 'flex',
        gap: '10px',
        marginBottom: '14px',
    } as CSSProperties,

    flexItem: {
        flex: 1,
    } as CSSProperties,
};
