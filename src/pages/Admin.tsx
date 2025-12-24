import React from 'react';
import { Editor, Frame, Element } from '@craftjs/core';
import { Typography, Grid, AppBar, Toolbar } from '@mui/material';

import { Text } from '../components/user/Text';
import { Button } from '../components/user/Button';
import { Container } from '../components/user/Container';
import { Card } from '../components/user/Card';
import { Image } from '../components/user/Image';
import { IdeaSection } from '../components/user/IdeaSection';
import { WhyWeDoIt } from '../components/user/WhyWeDoIt';

import { Toolbox } from '../components/Toolbox';
import { SettingsPanel } from '../components/SettingsPanel';
import { LayersPanel } from '../components/LayersPanel';

import { useEditor } from '@craftjs/core';
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button as MuiButton } from "@mui/material";
import { RenderNode } from '../components/editor/RenderNode';

const Header = () => {
    const { query } = useEditor();
    const savePage = useMutation(api.pages.savePage);

    const handleSave = async () => {
        const json = query.serialize();
        console.log('Saving JSON:', json);
        try {
            await savePage({ slug: "home", content: json });
            alert('Saved successfully!');
        } catch (error) {
            console.error("Failed to save:", error);
            alert('Failed to save. Check console.');
        }
    };

    return (
        <AppBar position="static" color="default" elevation={1} style={{ borderBottom: "1px solid #e0e0e0", backgroundColor: "#fff" }}>
            <Toolbar variant="dense">
                <Typography variant="h6" color="inherit" noWrap style={{ flexGrow: 1 }}>
                    Page Editor
                </Typography>
                <MuiButton variant="contained" color="primary" onClick={handleSave}>
                    Save Changes
                </MuiButton>
            </Toolbar>
        </AppBar>
    );
};

import { useQuery } from "convex/react";
import { CircularProgress, Box, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { useState, useEffect } from "react";
import { ChevronDown, Pencil, Layers as LayersIcon, Plus } from "lucide-react";

const Sidebar = () => {
    const { hasSelected } = useEditor((state) => ({
        hasSelected: state.events.selected.size > 0
    }));

    const [layersOpen, setLayersOpen] = useState(true);
    const [customizeOpen, setCustomizeOpen] = useState(true);
    const [componentsOpen, setComponentsOpen] = useState(true);

    // Automatically expand "Customize" when a component is selected
    useEffect(() => {
        if (hasSelected) {
            setCustomizeOpen(true);
        }
    }, [hasSelected]);

    return (
        <Grid style={{ width: "300px", borderLeft: "1px solid #e0e0e0", backgroundColor: "#fff", overflowY: "auto" }}>
            <Accordion expanded={customizeOpen} onChange={() => setCustomizeOpen(!customizeOpen)} disableGutters elevation={0} square>
                <AccordionSummary expandIcon={<ChevronDown size={16} />}>
                    <Box display="flex" alignItems="center">
                        <Pencil size={16} style={{ marginRight: 8 }} />
                        <Typography variant="subtitle2">CUSTOMIZE</Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails style={{ padding: 0 }}>
                    {hasSelected ? <SettingsPanel /> : <Box p={2}><Typography variant="caption" color="textSecondary">Select a component to customize</Typography></Box>}
                </AccordionDetails>
            </Accordion>

            <Accordion expanded={componentsOpen} onChange={() => setComponentsOpen(!componentsOpen)} disableGutters elevation={0} square>
                <AccordionSummary expandIcon={<ChevronDown size={16} />}>
                    <Box display="flex" alignItems="center">
                        <Plus size={16} style={{ marginRight: 8 }} />
                        <Typography variant="subtitle2">COMPONENTS</Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails style={{ padding: 0 }}>
                    <Toolbox />
                </AccordionDetails>
            </Accordion>

            <Accordion expanded={layersOpen} onChange={() => setLayersOpen(!layersOpen)} disableGutters elevation={0} square>
                <AccordionSummary expandIcon={<ChevronDown size={16} />}>
                    <Box display="flex" alignItems="center">
                        <LayersIcon size={16} style={{ marginRight: 8 }} />
                        <Typography variant="subtitle2">LAYERS</Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails style={{ padding: 0 }}>
                    <LayersPanel />
                </AccordionDetails>
            </Accordion>
        </Grid>
    );
};

const Admin: React.FC = () => {
    // Fetch the page data from Convex
    const pageData = useQuery(api.pages.getPage, { slug: "home" });

    // While loading, show a spinner
    if (pageData === undefined) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }



    return (
        <div style={{ margin: "0 auto", width: "100%", height: "100vh", display: "flex", flexDirection: "column" }}>
            <Editor
                resolver={{ Text, Button, Container, Card, IdeaSection, Image, WhyWeDoIt }}
                onRender={RenderNode}
                // If content exists, load it. Otherwise, use the default structure (Frame with children).
                enabled={true}
            >
                <Header />
                <Grid container style={{ flex: 1, height: "calc(100vh - 48px)", overflow: "hidden" }}>
                    <Grid style={{ flex: 1, backgroundColor: "#f0f2f5", padding: "40px", overflowY: "auto", display: "flex", justifyContent: "center" }}>
                        <Frame data={pageData?.content}>
                            <Element is={Container} padding={40} background="#fff" width="100%" height="auto" canvas custom={{ displayName: 'App' }}>
                                <Element is={WhyWeDoIt} canvas>
                                    <Text
                                        text="Why We Do It"
                                        tagName="span"
                                        fontSize="0.875rem"
                                        fontFamily="var(--font-headline)"
                                        color="var(--gold)"
                                        textTransform="uppercase"
                                        letterSpacing="0.15em"
                                        margin="0px 0px 24px 0px"
                                        textAlign="center"
                                    />
                                    <Text
                                        text="Make learning a night out."
                                        tagName="h2"
                                        fontSize="3.5rem"
                                        fontFamily="var(--font-headline)"
                                        color="var(--cream)"
                                        margin="0px 0px 40px 0px"
                                        textAlign="center"
                                    />
                                </Element>
                                <Element is={IdeaSection} canvas>
                                    <Box sx={{ gridColumn: 'span 1' }}>
                                        <Text
                                            text="The Idea"
                                            tagName="h2"
                                            fontSize="3.5rem"
                                            fontFamily="var(--font-headline)"
                                            color="var(--cream)"
                                            margin="0px 0px 32px 0px"
                                        />
                                    </Box>
                                    <Box sx={{ gridColumn: 'span 1' }}>
                                        <Image
                                            alt="Cocktails and Conversation"
                                            width="100%"
                                            height="auto"
                                            boxShadow="20px 20px 0 rgba(26, 22, 18, 0.5)"
                                            borderRadius="4px"
                                        />
                                    </Box>
                                </Element>
                            </Element>
                        </Frame>
                    </Grid>
                    <Sidebar />
                </Grid>
            </Editor>
        </div>
    );
};

export default Admin;
