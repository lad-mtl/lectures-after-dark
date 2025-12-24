import React from "react";
import { Paper } from "@mui/material";
import { useNode } from "@craftjs/core";
import { SpacingControl } from "../editor/SpacingControl";

export interface ContainerProps {
    background?: string;
    padding?: number | string;
    width?: string;
    height?: string;
    children?: React.ReactNode;
    margin?: string;
}

export const Container = ({ background, padding = 0, width, height, children, margin = "5px 0", ...props }: ContainerProps) => {
    const { connectors: { connect, drag } } = useNode();

    return (
        <Paper
            {...props}
            ref={(ref: any) => connect(drag(ref))}
            style={{ margin, background, padding: typeof padding === 'number' ? `${padding}px` : padding, width, height }}
        >
            {children}
        </Paper>
    );
};

const ContainerSettings = () => {
    const { actions: { setProp }, background, padding, width, height, margin } = useNode((node) => ({
        background: node.data.props.background,
        padding: node.data.props.padding,
        width: node.data.props.width,
        height: node.data.props.height,
        margin: node.data.props.margin,
    }));

    return (
        <>
            <div style={{ marginBottom: "10px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "12px", color: "#666" }}>Background Color</label>
                <input
                    type="color"
                    value={background}
                    onChange={(e) => setProp((props: any) => props.background = e.target.value)}
                    style={{ width: "100%", height: "40px", padding: "5px", border: "1px solid #e0e0e0", borderRadius: "4px" }}
                />
            </div>
            <div style={{ marginBottom: "10px" }}>
                <SpacingControl
                    margin={margin}
                    padding={padding}
                    setProp={setProp}
                />
            </div>
            <div style={{ marginBottom: "10px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "12px", color: "#666" }}>Width</label>
                <input
                    type="text"
                    value={width}
                    onChange={(e) => setProp((props: any) => props.width = e.target.value)}
                    style={{ width: "100%", padding: "5px", border: "1px solid #e0e0e0", borderRadius: "4px" }}
                />
            </div>
            <div style={{ marginBottom: "10px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "12px", color: "#666" }}>Height</label>
                <input
                    type="text"
                    value={height}
                    onChange={(e) => setProp((props: any) => props.height = e.target.value)}
                    style={{ width: "100%", padding: "5px", border: "1px solid #e0e0e0", borderRadius: "4px" }}
                />
            </div>

        </>
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
    },
    related: {
        settings: ContainerSettings,
    },
    rules: {
        canDrag: () => true,
    }
}
