import React from "react";
import { Paper } from "@mui/material";
import { useNode } from "@craftjs/core";

export interface ContainerProps {
    background?: string;
    padding?: number;
    width?: string;
    height?: string;
    children?: React.ReactNode;
}

export const Container = ({ background, padding = 0, width, height, children, ...props }: ContainerProps) => {
    const { connectors: { connect, drag } } = useNode();

    return (
        <Paper
            {...props}
            ref={(ref: any) => connect(drag(ref))}
            style={{ margin: "5px 0", background, padding: `${padding}px`, width, height }}
        >
            {children}
        </Paper>
    );
};

Container.craft = {
    displayName: "Container",
    props: {
        background: "#eeeeee",
        padding: 20,
        width: "100%",
        height: "auto"
    },
    rules: {
        canDrag: () => true,
    }
}
