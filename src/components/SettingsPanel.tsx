import React from 'react';
import { Box, Chip, Typography, Button as MaterialButton, Divider } from "@mui/material";
import { useEditor } from "@craftjs/core";

export const SettingsPanel = () => {
    const { selected, actions, query } = useEditor((state) => {
        const [currentNodeId] = state.events.selected;
        let selected;

        if (currentNodeId) {
            selected = {
                id: currentNodeId,
                name: state.nodes[currentNodeId].data.name,
                settings: state.nodes[currentNodeId].related && state.nodes[currentNodeId].related.settings,
            };
        }

        return {
            selected,
        };
    });

    return selected ? (
        <Box bgcolor="#fff" mt={2} px={2} py={2} style={{ borderTop: "1px solid #e0e0e0" }}>
            <Box display="flex" flexDirection="column" gap={2}>
                <Box>
                    <Box pb={2} display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center" gap={1}>
                            <MaterialButton
                                size="small"
                                onClick={() => actions.selectNode(undefined)}
                                style={{ minWidth: "auto", padding: "4px" }}
                            >
                                ←
                            </MaterialButton>
                            <Typography variant="subtitle2" style={{ fontWeight: 600, color: "#666" }}>Selected</Typography>
                        </Box>
                        <Chip size="small" color="primary" label={selected.name} variant="outlined" />
                    </Box>
                    <Divider />
                </Box>
                {/* Placeholder for future settings */}
                <Box>
                    {selected.settings && React.createElement(selected.settings)}
                    {!selected.settings && <Typography variant="body2" color="textSecondary">No settings available for this component.</Typography>}
                </Box>
                <Box>
                    {query.node(selected.id).isDeletable() ? (
                        <MaterialButton
                            variant="contained"
                            color="error"
                            fullWidth
                            disableElevation
                            onClick={() => {
                                actions.delete(selected.id);
                            }}
                        >
                            Delete
                        </MaterialButton>
                    ) : null}
                </Box>
            </Box>
        </Box>
    ) : (
        <Box bgcolor="#fff" mt={2} px={2} py={2} style={{ borderTop: "1px solid #e0e0e0" }}>
            <Typography variant="body2" color="textSecondary" align="center">Select a component to edit settings</Typography>
        </Box>
    );
}
