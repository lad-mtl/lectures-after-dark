import React from 'react';
import { useEditor } from '@craftjs/core';
import { Toolbox } from './Toolbox';

export const SettingsPanel = () => {
    const { selected, actions } = useEditor((state, query) => {
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
            background: 'rgb(252, 252, 252)',
            borderLeft: '1px solid rgb(230, 230, 230)',
            width: '300px',
            display: 'flex',
            flexDirection: 'column',
        }}>
            <div style={{
                padding: '12px',
                borderBottom: '1px solid rgb(230, 230, 230)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <h2 style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    margin: 0,
                    color: 'rgb(51, 51, 51)',
                }}>
                    {selected ? `Settings: ${selected.name}` : 'Toolbox'}
                </h2>
            </div>
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '12px',
            }}>
                {selected && selected.settings ? (
                    React.createElement(selected.settings)
                ) : (
                    <div style={{
                        textAlign: 'center',
                        color: 'rgb(153, 153, 153)',
                        paddingTop: '20px',
                    }}>
                        <p>Select a component to edit its settings.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
