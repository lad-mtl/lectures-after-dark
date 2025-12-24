import React from "react";
import { Paper, Box, Typography, TextField, Divider, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { useNode } from "@craftjs/core";
import { SpacingControl } from "../editor/SpacingControl";
import { ColorControl } from "../editor/ColorControl";

export interface ContainerProps {
    background?: string;
    padding?: number | string;
    width?: string;
    height?: string;
    children?: React.ReactNode;
    margin?: string;
    flexDirection?: "row" | "column";
    alignItems?: "flex-start" | "center" | "flex-end" | "stretch";
    justifyContent?: "flex-start" | "center" | "flex-end" | "space-between" | "space-around";
    className?: string;
}

export const Container = ({
    background,
    padding = 0,
    width,
    height,
    children,
    margin = "5px 0",
    flexDirection = "column",
    alignItems = "flex-start",
    justifyContent = "flex-start",
    className,
    ...props
}: ContainerProps) => {
    const { connectors: { connect, drag } } = useNode();

    return (
        <Paper
            {...props}
            className={className}
            ref={(ref: any) => connect(drag(ref))}
            style={{
                margin,
                background,
                padding: typeof padding === 'number' ? `${padding}px` : padding,
                width,
                height,
                display: "flex",
                flexDirection,
                alignItems,
                justifyContent
            }}
        >
            {children}
        </Paper>
    );
};

const ContainerSettings = () => {
    const { actions: { setProp }, background, padding, width, height, margin, flexDirection, alignItems, justifyContent } = useNode((node) => ({
        background: node.data.props.background,
        padding: node.data.props.padding,
        width: node.data.props.width,
        height: node.data.props.height,
        margin: node.data.props.margin,
        flexDirection: node.data.props.flexDirection,
        alignItems: node.data.props.alignItems,
        justifyContent: node.data.props.justifyContent,
    }));

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <ColorControl
                label="Background Color"
                value={background || ''}
                onChange={(val) => setProp((props: any) => props.background = val)}
            />

            <Box sx={{ display: 'flex', gap: 1 }}>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" sx={{ color: '#888', display: 'block', mb: 0.5 }}>Width</Typography>
                    <TextField
                        fullWidth
                        size="small"
                        value={width}
                        onChange={(e) => setProp((props: any) => props.width = e.target.value)}
                        sx={{
                            bgcolor: '#222',
                            '& .MuiInputBase-input': { color: '#fff', p: '8.5px 14px' },
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
                        }}
                    />
                </Box>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" sx={{ color: '#888', display: 'block', mb: 0.5 }}>Height</Typography>
                    <TextField
                        fullWidth
                        size="small"
                        value={height}
                        onChange={(e) => setProp((props: any) => props.height = e.target.value)}
                        sx={{
                            bgcolor: '#222',
                            '& .MuiInputBase-input': { color: '#fff', p: '8.5px 14px' },
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
                        }}
                    />
                </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
                <FormControl fullWidth size="small">
                    <InputLabel sx={{ color: '#888' }}>Direction</InputLabel>
                    <Select
                        value={flexDirection || 'column'}
                        label="Direction"
                        onChange={(e) => setProp((props: any) => props.flexDirection = e.target.value)}
                        sx={{ color: '#fff', '.MuiOutlinedInput-notchedOutline': { borderColor: '#444' } }}
                    >
                        <MenuItem value="row">Row</MenuItem>
                        <MenuItem value="column">Column</MenuItem>
                    </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                    <InputLabel sx={{ color: '#888' }}>Align</InputLabel>
                    <Select
                        value={alignItems || 'flex-start'}
                        label="Align"
                        onChange={(e) => setProp((props: any) => props.alignItems = e.target.value)}
                        sx={{ color: '#fff', '.MuiOutlinedInput-notchedOutline': { borderColor: '#444' } }}
                    >
                        <MenuItem value="flex-start">Start</MenuItem>
                        <MenuItem value="center">Center</MenuItem>
                        <MenuItem value="flex-end">End</MenuItem>
                        <MenuItem value="stretch">Stretch</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            <FormControl fullWidth size="small">
                <InputLabel sx={{ color: '#888' }}>Justify</InputLabel>
                <Select
                    value={justifyContent || 'flex-start'}
                    label="Justify"
                    onChange={(e) => setProp((props: any) => props.justifyContent = e.target.value)}
                    sx={{ color: '#fff', '.MuiOutlinedInput-notchedOutline': { borderColor: '#444' } }}
                >
                    <MenuItem value="flex-start">Start</MenuItem>
                    <MenuItem value="center">Center</MenuItem>
                    <MenuItem value="flex-end">End</MenuItem>
                    <MenuItem value="space-between">Space Between</MenuItem>
                    <MenuItem value="space-around">Space Around</MenuItem>
                </Select>
            </FormControl>

            <Divider sx={{ borderColor: '#333', my: 1 }} />

            <SpacingControl
                margin={margin}
                padding={padding}
                setProp={setProp}
            />
        </Box>
    );
};

Container.craft = {
    displayName: "Container",
    props: {
        background: "#eeeeee",
        padding: 20,
        width: "100%",
        height: "auto",
        margin: "5px 0",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-start",
    },
    related: {
        settings: ContainerSettings,
    },
    rules: {
        canDrag: () => true,
    }
}
