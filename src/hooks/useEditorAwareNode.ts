import { useNode, useEditor } from '@craftjs/core';

/**
 * Returns CraftJS node connectors when inside an Editor context,
 * or no-op functions when rendered outside (e.g., public pages).
 */
export const useEditorAwareNode = () => {
    try {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useNode();
    } catch {
        return {
            connectors: {
                connect: (ref: HTMLElement | null) => ref as HTMLElement,
                drag: (ref: HTMLElement | null) => ref as HTMLElement
            }
        };
    }
};

/**
 * Returns editor state when inside an Editor context,
 * or default disabled state when rendered outside.
 */
export const useEditorAwareState = () => {
    try {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useEditor((state) => ({
            enabled: state.options.enabled
        }));
    } catch {
        return { enabled: false };
    }
};
