import { useEffect, useState } from 'react';
import { Box, Typography, TextField } from "@mui/material";

interface SpacingControlProps {
    margin: string;
    padding: string | number;
    setProp: (cb: (props: any) => void) => void;
}

const parseSpacing = (value: string | number) => {
    if (typeof value === 'number') return { top: value, right: value, bottom: value, left: value };
    if (!value) return { top: 0, right: 0, bottom: 0, left: 0 };

    const parts = value.split(' ').map(v => parseInt(v) || 0);
    if (parts.length === 1) return { top: parts[0], right: parts[0], bottom: parts[0], left: parts[0] };
    if (parts.length === 2) return { top: parts[0], right: parts[1], bottom: parts[0], left: parts[1] };
    if (parts.length === 3) return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[1] };
    if (parts.length === 4) return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] };
    return { top: 0, right: 0, bottom: 0, left: 0 };
};

const SpacingInput = ({ value, onChange }: { value: number, onChange: (val: number) => void }) => (
    <TextField
        variant="standard"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        InputProps={{
            disableUnderline: true,
            style: {
                fontSize: '12px',
                textAlign: 'center',
                color: '#fff',
                width: '30px',
                height: '20px',
                padding: 0
            },
            inputProps: {
                style: { textAlign: 'center', padding: 0 }
            }
        }}
        sx={{
            '& .MuiInputBase-root': {
                backgroundColor: 'transparent',
            }
        }}
    />
);

export const SpacingControl = ({ margin, padding, setProp }: SpacingControlProps) => {
    const [m, setM] = useState(parseSpacing(margin));
    const [p, setP] = useState(parseSpacing(padding));

    useEffect(() => {
        setM(parseSpacing(margin));
    }, [margin]);

    useEffect(() => {
        setP(parseSpacing(padding));
    }, [padding]);

    const updateMargin = (newM: typeof m) => {
        setM(newM);
        const val = `${newM.top}px ${newM.right}px ${newM.bottom}px ${newM.left}px`;
        setProp((props: any) => props.margin = val);
    };

    const updatePadding = (newP: typeof p) => {
        setP(newP);
        const val = `${newP.top}px ${newP.right}px ${newP.bottom}px ${newP.left}px`;
        setProp((props: any) => props.padding = val);
    };

    return (
        <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="caption" style={{ color: "#666" }}>Spacing</Typography>
            <Box
                position="relative"
                bgcolor="#333"
                p={4}
                borderRadius={1}
                display="flex"
                justifyContent="center"
                alignItems="center"
                sx={{
                    clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)"
                }}
            >
                {/* Margin Label */}
                <Typography variant="caption" style={{ position: 'absolute', top: 4, left: 4, color: '#888', fontSize: '8px' }}>MARGIN</Typography>

                {/* Margin Inputs */}
                <Box position="absolute" top={2} left="50%" sx={{ transform: 'translateX(-50%)' }}>
                    <SpacingInput value={m.top} onChange={(v) => updateMargin({ ...m, top: v })} />
                </Box>
                <Box position="absolute" bottom={2} left="50%" sx={{ transform: 'translateX(-50%)' }}>
                    <SpacingInput value={m.bottom} onChange={(v) => updateMargin({ ...m, bottom: v })} />
                </Box>
                <Box position="absolute" left={2} top="50%" sx={{ transform: 'translateY(-50%)' }}>
                    <SpacingInput value={m.left} onChange={(v) => updateMargin({ ...m, left: v })} />
                </Box>
                <Box position="absolute" right={2} top="50%" sx={{ transform: 'translateY(-50%)' }}>
                    <SpacingInput value={m.right} onChange={(v) => updateMargin({ ...m, right: v })} />
                </Box>

                {/* Padding Box */}
                <Box
                    position="relative"
                    bgcolor="#444"
                    p={3}
                    borderRadius={1}
                    width="100%"
                    height="60px"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    border="1px solid #555"
                >
                    <Typography variant="caption" style={{ position: 'absolute', top: 2, left: 4, color: '#888', fontSize: '8px' }}>PADDING</Typography>

                    {/* Padding Inputs */}
                    <Box position="absolute" top={0} left="50%" sx={{ transform: 'translateX(-50%)' }}>
                        <SpacingInput value={p.top} onChange={(v) => updatePadding({ ...p, top: v })} />
                    </Box>
                    <Box position="absolute" bottom={0} left="50%" sx={{ transform: 'translateX(-50%)' }}>
                        <SpacingInput value={p.bottom} onChange={(v) => updatePadding({ ...p, bottom: v })} />
                    </Box>
                    <Box position="absolute" left={2} top="50%" sx={{ transform: 'translateY(-50%)' }}>
                        <SpacingInput value={p.left} onChange={(v) => updatePadding({ ...p, left: v })} />
                    </Box>
                    <Box position="absolute" right={2} top="50%" sx={{ transform: 'translateY(-50%)' }}>
                        <SpacingInput value={p.right} onChange={(v) => updatePadding({ ...p, right: v })} />
                    </Box>

                    {/* Content Placeholder */}
                    <Box bgcolor="#222" width="100%" height="100%" borderRadius={1} />
                </Box>
            </Box>
        </Box>
    );
};
