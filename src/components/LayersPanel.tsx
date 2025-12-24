import { Layers } from "@craftjs/layers";
import { Box } from "@mui/material";

export const LayersPanel = () => {
    return (
        <Box px={2} py={2}>

            <div style={{ marginTop: "10px", backgroundColor: "#fff", color: "#000" }}>
                <Layers expandRootOnLoad={true} />
            </div>
        </Box>
    );
};
