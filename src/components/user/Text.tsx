import { useEffect, useState } from "react";
import { useNode } from "@craftjs/core";
import ContentEditable from "react-contenteditable";

export interface TextProps {
    text: string;
    fontSize?: string | number;
}

export const Text = ({ text, fontSize }: TextProps) => {
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
        >
            <ContentEditable
                html={text}
                disabled={!editable}
                onChange={(e) => setProp((props: any) => props.text = e.target.value)}
                tagName="p"
                style={{ fontSize: typeof fontSize === 'number' ? `${fontSize}px` : fontSize, margin: 0 }}
            />
        </div>
    );
};

const TextSettings = () => {
    const { actions: { setProp }, fontSize, text } = useNode((node) => ({
        text: node.data.props.text,
        fontSize: node.data.props.fontSize,
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
        </>
    );
};

Text.craft = {
    displayName: "Text",
    props: {
        text: "Hi",
        fontSize: 20,
    },
    related: {
        settings: TextSettings,
    },
    rules: {
        canDrag: () => true,
    },
};
