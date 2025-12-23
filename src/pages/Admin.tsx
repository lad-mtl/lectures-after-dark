import React from 'react';
import { Editor, Frame, Element } from '@craftjs/core';
import { Typography, Grid, AppBar, Toolbar } from '@mui/material';

import { Text } from '../components/user/Text';
import { Button } from '../components/user/Button';
import { Container } from '../components/user/Container';
import { Card } from '../components/user/Card';

import { Toolbox } from '../components/Toolbox';
import { SettingsPanel } from '../components/SettingsPanel';

import { useEditor } from '@craftjs/core';
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button as MuiButton } from "@mui/material";

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
import { CircularProgress, Box } from "@mui/material";

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
                resolver={{ Text, Button, Container, Card }}
                // If content exists, load it. Otherwise, use the default structure (Frame with children).
                enabled={true}
            >
                <Header />
                <Grid container style={{ flex: 1, height: "calc(100vh - 48px)", overflow: "hidden" }}>
                    <Grid style={{ width: "250px", borderRight: "1px solid #e0e0e0", backgroundColor: "#f9f9f9", overflowY: "auto" }}>
                        <Toolbox />
                    </Grid>
                    <Grid style={{ flex: 1, backgroundColor: "#f0f2f5", padding: "40px", overflowY: "auto", display: "flex", justifyContent: "center" }}>
                        <Frame json={pageData?.content}>
                            <Element is={Container} padding={40} background="#fff" width="100%" height="auto" canvas>
                                <Card />
                                <Button size="small" variant="outlined" color="secondary" text="Click me" />
                                <Text fontSize={20} text="Hi world!" />
                                <Element is={Container} padding={20} background="#eee" canvas>
                                    <Text fontSize={20} text="It's me again!" />
                                </Element>
                            </Element>
                        </Frame>
                    </Grid>
                    <Grid style={{ width: "300px", borderLeft: "1px solid #e0e0e0", backgroundColor: "#fff", overflowY: "auto" }}>
                        <SettingsPanel />
                    </Grid>
                </Grid>
            </Editor>
        </div>
    );
};

export default Admin;
