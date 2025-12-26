import React from 'react';
import { useEditor } from '@craftjs/core';


export const SettingsPanel = () => {
    const { selected } = useEditor((state, query) => {
        const [currentNodeId] = state.events.selected;
        let selected;

        if (currentNodeId) {
            selected = {
                id: currentNodeId,
                name: state.nodes[currentNodeId].data.name,
                settings: state.nodes[currentNodeId].related && state.nodes[currentNodeId].related.settings,
                isDeletable: query.node(currentNodeId).isDeletable(),
            };
        }

        return {
            selected,
        };
    });

    return (
        <div style={{
            background: '#f8f9fa',
            borderLeft: '1px solid #cbd5e1',
            width: '300px',
            display: 'flex',
            flexDirection: 'column',
        }}>
            <div style={{
                padding: '12px',
                borderBottom: '1px solid #cbd5e1',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#ffffff',
            }}>
                <h2 style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    margin: 0,
                    color: '#1e293b',
                }}>
                    {selected ? `Settings: ${selected.name}` : 'Toolbox'}
                </h2>
            </div>
            <div
                className="settings-panel-content"
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '16px',
                }}
            >
                {selected && selected.settings ? (
                    React.createElement(selected.settings)
                ) : (
                    <div style={{
                        textAlign: 'center',
                        color: '#64748b',
                        paddingTop: '20px',
                    }}>
                        <p>Select a component to edit its settings.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
