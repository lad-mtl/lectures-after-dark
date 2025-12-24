import { useNode } from "@craftjs/core";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { type ChangeEvent, useState } from "react";
import { Box, Button, Typography, CircularProgress, Paper } from "@mui/material";
import { Upload } from "lucide-react";
import { SpacingControl } from "../editor/SpacingControl";

interface ImageProps {
    storageId?: string;
    alt?: string;
    width?: string;
    height?: string;
    className?: string;
    boxShadow?: string;
    borderRadius?: string;
    margin?: string;
    padding?: string;
}

export const Image = ({ storageId, alt = "Image", width = "100%", height = "auto", className, boxShadow = "none", borderRadius = "0px", margin = "0px", padding = "0px" }: ImageProps) => {
    const { connectors: { connect, drag } } = useNode();

    const imageUrl = useQuery(api.files.getFileUrl, storageId ? { storageId: storageId as Id<"_storage"> } : "skip");

    return (
        <div ref={(ref: any) => connect(drag(ref))} className={className} style={{ width, height, boxShadow, borderRadius, margin, padding, display: "flex", overflow: "hidden" }}>
            {imageUrl ? (
                <img src={imageUrl} alt={alt} style={{ width: "100%", height: height === "auto" ? "auto" : "100%", objectFit: "cover", borderRadius: "inherit" }} />
            ) : (
                <div style={{
                    width: "100%",
                    height: "200px",
                    backgroundColor: "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#888",
                    borderRadius: "inherit"
                }}>
                    {storageId ? "Loading..." : "Select an image"}
                </div>
            )}
        </div>
    );
};



export const ImageSettings = () => {
    const { actions: { setProp }, storageId, boxShadow, borderRadius, margin, padding } = useNode((node) => ({
        storageId: node.data.props.storageId,
        boxShadow: node.data.props.boxShadow,
        borderRadius: node.data.props.borderRadius,
        margin: node.data.props.margin,
        padding: node.data.props.padding,
    }));

    const generateUploadUrl = useMutation(api.files.generateUploadUrl);
    const imageUrl = useQuery(api.files.getFileUrl, storageId ? { storageId: storageId as Id<"_storage"> } : "skip");
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            // Step 1: Get a short-lived upload URL
            const postUrl = await generateUploadUrl();

            // Step 2: POST the file to the URL
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });

            if (!result.ok) {
                throw new Error(`Upload failed with status ${result.status}`);
            }

            const { storageId } = await result.json();

            // Step 3: Save the newly allocated storage id to the component props
            setProp((props: ImageProps) => {
                props.storageId = storageId;
            });
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
                Image Settings
            </Typography>

            <Paper variant="outlined" sx={{ p: 2, mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, backgroundColor: '#f8f9fa' }}>
                {imageUrl ? (
                    <Box
                        component="img"
                        src={imageUrl}
                        alt="Preview"
                        sx={{
                            width: '100%',
                            height: 150,
                            objectFit: 'cover',
                            borderRadius: 1,
                            border: '1px solid #e0e0e0'
                        }}
                    />
                ) : (
                    <Box sx={{
                        width: '100%',
                        height: 150,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: '#eee',
                        borderRadius: 1,
                        color: 'text.secondary'
                    }}>
                        <Typography variant="body2">No image selected</Typography>
                    </Box>
                )}

                <Button
                    component="label"
                    variant="contained"
                    startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <Upload size={20} />}
                    disabled={uploading}
                    fullWidth
                >
                    {uploading ? "Uploading..." : "Upload Image"}
                    <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleUpload}
                    />
                </Button>
            </Paper>

            <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Box Shadow
                </Typography>
                <input
                    type="text"
                    value={boxShadow || ""}
                    onChange={(e) => setProp((props: ImageProps) => props.boxShadow = e.target.value)}
                    style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                    placeholder="e.g., 10px 10px 5px grey"
                />
            </Box>

            <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Border Radius
                </Typography>
                <input
                    type="text"
                    value={borderRadius || ""}
                    onChange={(e) => setProp((props: ImageProps) => props.borderRadius = e.target.value)}
                    style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                    placeholder="e.g., 10px or 50%"
                />
            </Box>

            <Box sx={{ mt: 2 }}>
                <SpacingControl
                    margin={margin}
                    padding={padding}
                    setProp={setProp}
                />
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                Supported formats: JPG, PNG, GIF, WEBP
            </Typography>
        </Box>
    );
};

Image.craft = {
    displayName: "Image",
    props: {
        storageId: "",
        alt: "Image",
        width: "100%",
        height: "auto",
        boxShadow: "none",
        borderRadius: "0px",
        margin: "0px",
        padding: "0px",
    },
    related: {
        settings: ImageSettings,
    },
};
