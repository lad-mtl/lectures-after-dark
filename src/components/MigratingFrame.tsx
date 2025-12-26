import { Frame, useEditor } from '@craftjs/core';
import { useEffect } from 'react';

interface MigratingFrameProps {
    json?: string;
    children?: React.ReactNode;
}

/**
 * A wrapper around Craft.js Frame that automatically merges saved props
 * with current component defaults. This allows component changes to
 * propagate to existing pages while preserving user-edited content.
 *
 * How it works:
 * 1. Loads the serialized JSON from the database
 * 2. Deserializes it using Frame
 * 3. For each node, merges saved props with current component defaults
 * 4. This ensures new props get their defaults while user edits are preserved
 */
export const MigratingFrame: React.FC<MigratingFrameProps> = ({ json, children }) => {
    const { actions, query } = useEditor();

    useEffect(() => {
        if (!json) return;

        try {
            // Parse the saved JSON
            const savedState = JSON.parse(json);

            // Get the current resolver (component registry)
            const resolver = query.getOptions().resolver;

            // Migrate each node's props
            if (savedState && typeof savedState === 'object') {
                Object.keys(savedState).forEach((nodeId) => {
                    const node = savedState[nodeId];

                    // Skip if not a valid node
                    if (!node || !node.type) return;

                    // Handle Element nodes (canvas divs) - fix old CSS module classNames
                    if (typeof node.type === 'string' && node.type === 'div' && node.isCanvas) {
                        const props = node.props || {};
                        const className = props.className || '';

                        // If className contains CSS module pattern (_something_hash), remove it
                        // This fixes old CSS module classes from before Tailwind migration
                        if (className.match(/_[a-zA-Z]+_[a-z0-9]+/)) {
                            // Check if this is the events-list canvas based on parent or id
                            const linkedNodeKey = Object.keys(savedState).find(key => {
                                const parentNode = savedState[key];
                                return parentNode?.linkedNodes?.['events-list'] === nodeId;
                            });

                            if (linkedNodeKey) {
                                // This is the events-list canvas, apply correct Tailwind classes
                                node.props.className = 'flex gap-8 w-auto max-md:pr-4';
                            }
                        }
                        return;
                    }

                    // Handle component nodes
                    if (typeof node.type !== 'object') return;

                    const componentName = node.type.resolvedName;
                    if (!componentName) return;

                    // Get the current component definition
                    const Component = resolver[componentName];
                    if (!Component) return;

                    // Get the current default props
                    const craft = (Component as any).craft;
                    const defaultProps = craft?.props || {};

                    // Merge: saved props override defaults, but new default props are added
                    const savedProps = node.props || {};
                    const mergedProps = {
                        ...defaultProps,  // Start with current defaults
                        ...savedProps,    // Override with saved values (preserves user edits)
                    };

                    // Update the node with merged props
                    node.props = mergedProps;
                });
            }

            // Now deserialize with the migrated state
            const migratedJson = JSON.stringify(savedState);
            actions.deserialize(migratedJson);

        } catch (error) {
            console.error('Error migrating frame state:', error);
            // Fallback to original deserialization
            if (json) {
                try {
                    actions.deserialize(json);
                } catch (fallbackError) {
                    console.error('Fallback deserialization also failed:', fallbackError);
                }
            }
        }
    }, [json, actions, query]);

    // If there's JSON to load, don't render children (will be loaded from JSON)
    // If no JSON, render children (empty state for new pages)
    return <Frame>{!json && children}</Frame>;
};
