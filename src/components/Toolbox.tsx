import { Box, Typography, Button as MaterialButton, Tooltip } from "@mui/material";
import { useEditor, Element } from "@craftjs/core";
import { Container } from "./user/Container";
import { Card } from "./user/Card";
import { Button } from "./user/Button";
import { Text } from "./user/Text";
import { Type, Square, Layout, CreditCard } from "lucide-react";

export const Toolbox = () => {
    const { connectors } = useEditor();

    return (
        <Box px={2} py={2}>
            <Typography variant="subtitle2" gutterBottom style={{ fontWeight: 600, color: "#666" }}>
                Components
            </Typography>
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                <Tooltip title="Button" arrow>
                    <MaterialButton
                        variant="outlined"
                        fullWidth
                        style={{ flexDirection: "column", padding: "10px", textTransform: "none", borderColor: "#e0e0e0", color: "#555" }}
                        ref={(ref: any) => connectors.create(ref, <Button text="Click me" />)}
                    >
                        <Square size={20} style={{ marginBottom: 5 }} />
                        <Typography variant="caption">Button</Typography>
                    </MaterialButton>
                </Tooltip>
                <Tooltip title="Text" arrow>
                    <MaterialButton
                        variant="outlined"
                        fullWidth
                        style={{ flexDirection: "column", padding: "10px", textTransform: "none", borderColor: "#e0e0e0", color: "#555" }}
                        ref={(ref: any) => connectors.create(ref, <Text text="Hi world" />)}
                    >
                        <Type size={20} style={{ marginBottom: 5 }} />
                        <Typography variant="caption">Text</Typography>
                    </MaterialButton>
                </Tooltip>
                <Tooltip title="Container" arrow>
                    <MaterialButton
                        variant="outlined"
                        fullWidth
                        style={{ flexDirection: "column", padding: "10px", textTransform: "none", borderColor: "#e0e0e0", color: "#555" }}
                        ref={(ref: any) => connectors.create(ref, <Element is={Container} padding={20} canvas />)}
                    >
                        <Layout size={20} style={{ marginBottom: 5 }} />
                        <Typography variant="caption">Container</Typography>
                    </MaterialButton>
                </Tooltip>
                <Tooltip title="Card" arrow>
                    <MaterialButton
                        variant="outlined"
                        fullWidth
                        style={{ flexDirection: "column", padding: "10px", textTransform: "none", borderColor: "#e0e0e0", color: "#555" }}
                        ref={(ref: any) => connectors.create(ref, <Card />)}
                    >
                        <CreditCard size={20} style={{ marginBottom: 5 }} />
                        <Typography variant="caption">Card</Typography>
                    </MaterialButton>
                </Tooltip>
            </Box>
        </Box>
    )
};
