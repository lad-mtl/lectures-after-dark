import React from "react";
import { Button as MaterialButton, type ButtonProps as MaterialButtonProps, Box, Typography, Divider, TextField } from "@mui/material";
import { useNode } from "@craftjs/core";
import { ColorControl } from "../editor/ColorControl";
import { SpacingControl } from "../editor/SpacingControl";

export interface ButtonProps extends Omit<MaterialButtonProps, 'classes'> {
    size?: "small" | "medium" | "large";
    variant?: "text" | "outlined" | "contained";
    color?: "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning";
    children?: React.ReactNode;
    text?: string;
    margin?: string;
    padding?: string;
    backgroundColor?: string;
    textColor?: string;
}

export const Button = ({
    size,
    variant,
    color,
    children,
    text,
    margin = "0px",
    padding = "0px",
    backgroundColor,
    textColor,
    ...props
}: ButtonProps) => {
    const { connectors: { connect, drag } } = useNode();

    const styles = {
        margin,
        padding,
        backgroundColor: variant === 'contained' ? backgroundColor : undefined,
        color: textColor,
        borderColor: variant === 'outlined' ? backgroundColor : undefined,
    };

    return (
        <MaterialButton
            ref={(ref: any) => connect(drag(ref))}
            size={size}
            variant={variant}
            color={color}
            style={styles}
            {...props}
        >
            {children || text}
        </MaterialButton>
    );
};

const ButtonSettings = () => {
    const {
        actions: { setProp },
        text,
        size,
        variant,
        margin,
        padding,
        backgroundColor,
        textColor
    } = useNode((node) => ({
        text: node.data.props.text,
        size: node.data.props.size,
        variant: node.data.props.variant,
        margin: node.data.props.margin,
        padding: node.data.props.padding,
        backgroundColor: node.data.props.backgroundColor,
        textColor: node.data.props.textColor,
    }));

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
                <Typography variant="caption" sx={{ color: '#888', display: 'block', mb: 0.5 }}>Text</Typography>
                <TextField
                    fullWidth
                    size="small"
                    value={text}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProp((props: any) => props.text = e.target.value)}
                    sx={{
                        bgcolor: '#222',
                        '& .MuiInputBase-input': { color: '#fff', p: '8.5px 14px' },
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
                    }}
                />
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" sx={{ color: '#888', display: 'block', mb: 0.5 }}>Size</Typography>
                    <select
                        value={size}
                        onChange={(e) => setProp((props: any) => props.size = e.target.value)}
                        style={{ width: "100%", padding: "8.5px", background: "#222", color: "#fff", border: "1px solid #444", borderRadius: "4px" }}
                    >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                    </select>
                </Box>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" sx={{ color: '#888', display: 'block', mb: 0.5 }}>Variant</Typography>
                    <select
                        value={variant}
                        onChange={(e) => setProp((props: any) => props.variant = e.target.value)}
                        style={{ width: "100%", padding: "8.5px", background: "#222", color: "#fff", border: "1px solid #444", borderRadius: "4px" }}
                    >
                        <option value="text">Text</option>
                        <option value="outlined">Outlined</option>
                        <option value="contained">Contained</option>
                    </select>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
                <Box sx={{ flex: 1 }}>
                    <ColorControl
                        label="Background"
                        value={backgroundColor || ''}
                        onChange={(val) => setProp((props: any) => props.backgroundColor = val)}
                    />
                </Box>
                <Box sx={{ flex: 1 }}>
                    <ColorControl
                        label="Text Color"
                        value={textColor || ''}
                        onChange={(val) => setProp((props: any) => props.textColor = val)}
                    />
                </Box>
            </Box>

            <Divider sx={{ borderColor: '#333', my: 1 }} />

            <SpacingControl
                margin={margin}
                padding={padding}
                setProp={setProp}
            />
        </Box>
    );
};

Button.craft = {
    displayName: "Button",
    props: {
        size: "small",
        variant: "contained",
        color: "primary",
        text: "Click me",
        margin: "0px",
        padding: "0px",
        backgroundColor: "#D9532E",
        textColor: "#ffffff",
    },
    related: {
        settings: ButtonSettings,
    },
    rules: {
        canDrag: () => true,
    }
}
