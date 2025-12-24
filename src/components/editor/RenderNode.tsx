import { useNode, useEditor } from "@craftjs/core";
import React, { useEffect } from "react";

export const RenderNode = ({ render }: { render: React.ReactElement }) => {
    const { id } = useNode();
    const { isActive } = useEditor((state) => ({
        isActive: state.events.selected.has(id),
    }));

    const {
        isHover,
        dom,
    } = useNode((node) => ({
        isHover: node.events.hovered,
        dom: node.dom,
    }));

    useEffect(() => {
        if (dom) {
            if (isActive || isHover) {
                dom.classList.add("component-selected");
            } else {
                dom.classList.remove("component-selected");
            }
        }
    }, [dom, isActive, isHover]);

    // We can also use inline styles or a portal overlay if we don't want to modify the DOM class directly.
    // For now, let's try a simple overlay approach or just modifying the style directly if classList isn't enough (e.g. if we don't have global CSS).
    // Given the user asked for "border blue", let's try to apply a style directly to the dom node or wrap it.

    // Actually, wrapping the render is the standard way, but we need to attach the ref.
    // However, Craft.js `render` prop in `onRender` is the actual component.
    // The `RenderNode` wraps the component.

    // A better approach for "border blue" without affecting layout is an overlay or outline.
    // Let's use an outline style on the DOM element itself for simplicity.

    useEffect(() => {
        if (dom) {
            if (isActive) {
                dom.style.outline = "2px solid #2196f3";
                dom.style.outlineOffset = "-2px"; // Draw inside to avoid layout shift
            } else if (isHover) {
                dom.style.outline = "1px dashed #2196f3";
                dom.style.outlineOffset = "-1px";
            } else {
                dom.style.outline = "";
                dom.style.outlineOffset = "";
            }
        }
    }, [dom, isActive, isHover]);

    return render;
};
