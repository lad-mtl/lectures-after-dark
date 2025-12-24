import React from 'react';
import { Box, Typography, Popover } from "@mui/material";
import { Palette } from "lucide-react";

interface ColorControlProps {
    label: string;
    value: string;
    onChange: (color: string) => void;
}

const PRESET_COLORS = [
    { name: 'Midnight', value: '#1a1612' },
    { name: 'Warm Brown', value: '#3D2B1F' },
    { name: 'Amber', value: '#D9532E' },
    { name: 'Amber Light', value: '#E67E52' },
    { name: 'Cream', value: '#F5F0E8' },
    { name: 'Cream Dark', value: '#D4C7B8' },
    { name: 'Gold', value: '#CC9966' },
    { name: 'Card BG', value: '#2A1F1A' },
    { name: 'White', value: '#ffffff' },
    { name: 'Black', value: '#000000' },
];

export const ColorControl = ({ label, value, onChange }: ColorControlProps) => {
    const [anchorEl, setAnchorEl] = React.useState<HTMLDivElement | null>(null);

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    return (
        <Box sx={{ mb: 1.5 }}>
            <Typography variant="caption" sx={{ color: '#888', display: 'block', mb: 0.5 }}>{label}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                    onClick={handleClick}
                    sx={{
                        width: '100%',
                        height: 32,
                        borderRadius: 1,
                        bgcolor: value || 'transparent',
                        border: '1px solid #444',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '&:hover': { borderColor: '#666' }
                    }}
                >
                    {!value && <Palette size={16} color="#888" />}
                    {value && (
                        <Typography variant="caption" sx={{ color: (value === '#ffffff' || value === 'white' || value === '#F5F0E8') ? '#000' : '#fff', fontSize: '10px', fontWeight: 600 }}>
                            {value}
                        </Typography>
                    )}
                </Box>
            </Box>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                PaperProps={{
                    sx: { bgcolor: '#1a1a1a', border: '1px solid #333', p: 1.5, width: 200 }
                }}
            >
                <Typography variant="caption" sx={{ color: '#888', display: 'block', mb: 1 }}>Presets</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, mb: 2 }}>
                    {PRESET_COLORS.map((color) => (
                        <Box
                            key={color.value}
                            onClick={() => {
                                onChange(color.value);
                                handleClose();
                            }}
                            title={color.name}
                            sx={{
                                width: '100%',
                                paddingTop: '100%',
                                bgcolor: color.value,
                                borderRadius: 0.5,
                                cursor: 'pointer',
                                border: value === color.value ? '2px solid #fff' : '1px solid #444',
                                '&:hover': { transform: 'scale(1.1)' },
                                transition: 'transform 0.1s'
                            }}
                        />
                    ))}
                </Box>
                <Typography variant="caption" sx={{ color: '#888', display: 'block', mb: 1 }}>Custom</Typography>
                <input
                    type="color"
                    value={value?.startsWith('#') ? value : '#000000'}
                    onChange={(e) => onChange(e.target.value)}
                    style={{ width: '100%', height: 30, cursor: 'pointer', border: 'none', background: 'none' }}
                />
            </Popover>
        </Box>
    );
};
