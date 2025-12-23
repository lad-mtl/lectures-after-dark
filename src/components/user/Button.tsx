import { Button as MaterialButton, type ButtonProps as MaterialButtonProps } from "@mui/material";
import { useNode } from "@craftjs/core";

export interface ButtonProps extends Omit<MaterialButtonProps, 'classes'> {
    size?: "small" | "medium" | "large";
    variant?: "text" | "outlined" | "contained";
    color?: "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning";
    children?: React.ReactNode;
    text?: string;
}

export const Button = ({ size, variant, color, children, text, ...props }: ButtonProps) => {
    const { connectors: { connect, drag } } = useNode();

    return (
        <MaterialButton
            ref={(ref: any) => connect(drag(ref))}
            size={size}
            variant={variant}
            color={color}
            {...props}
        >
            {children || text}
        </MaterialButton>
    );
};

Button.craft = {
    displayName: "Button",
    props: {
        size: "small",
        variant: "contained",
        color: "primary",
        text: "Click me"
    },
    rules: {
        canDrag: () => true,
    }
}
