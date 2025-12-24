import { useEffect, useState } from "react";
import { useNode } from "@craftjs/core";
import ContentEditable from "react-contenteditable";
import { SpacingControl } from "../editor/SpacingControl";

export interface TextProps {
    text: string;
    fontSize?: string | number;
    tagName?: string;
    className?: string;
    margin?: string;
    padding?: string;
}

export const Text = ({ text, fontSize, tagName = "p", className, margin = "0px", padding = "0px" }: TextProps) => {
    const { connectors: { connect, drag }, actions: { setProp }, hasSelectedNode } = useNode((state) => ({
        hasSelectedNode: state.events.selected,
    }));

    const [editable, setEditable] = useState(false);

    useEffect(() => {
        if (!hasSelectedNode) setEditable(false);
    }, [hasSelectedNode]);

    return (
        <div
            ref={(ref: any) => connect(drag(ref))}
            onClick={() => hasSelectedNode && setEditable(true)}
            style={{ display: "inline-block", width: "100%", margin, padding }}
        >
            <ContentEditable
                html={text}
                disabled={!editable}
                onChange={(e) => setProp((props: any) => props.text = e.target.value)}
                tagName={tagName}
                className={className}
                style={{ fontSize: typeof fontSize === 'number' ? `${fontSize}px` : fontSize, margin: 0 }}
            />
        </div>
    );
};

const TextSettings = () => {
    const { actions: { setProp }, fontSize, text, margin, padding } = useNode((node) => ({
        text: node.data.props.text,
        fontSize: node.data.props.fontSize,
        margin: node.data.props.margin,
        padding: node.data.props.padding,
    }));

    return (
        <>
            <div style={{ marginBottom: "10px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "12px", color: "#666" }}>Text</label>
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setProp((props: any) => props.text = e.target.value)}
                    style={{ width: "100%", padding: "5px", border: "1px solid #e0e0e0", borderRadius: "4px" }}
                />
            </div>
            <div style={{ marginBottom: "10px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "12px", color: "#666" }}>Font Size</label>
                <input
                    type="number"
                    value={fontSize || 0}
                    onChange={(e) => setProp((props: any) => props.fontSize = parseInt(e.target.value))}
                    style={{ width: "100%", padding: "5px", border: "1px solid #e0e0e0", borderRadius: "4px" }}
                />
            </div>
            <div style={{ marginBottom: "10px" }}>
                <SpacingControl
                    margin={margin}
                    padding={padding}
                    setProp={setProp}
                />
            </div>
        </>
    );
};

Text.craft = {
    displayName: "Text",
    props: {
        text: "Hi",
        fontSize: 20,
        tagName: "p",
        margin: "0px",
        padding: "0px",
    },
    related: {
        settings: TextSettings,
    },
    rules: {
        canDrag: () => true,
    },
};
