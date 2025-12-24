import { useNode, Element } from "@craftjs/core";
import styles from '../Hero.module.css';
import { Text } from './Text';
import { Button } from './Button';
import { Box, Typography, TextField } from "@mui/material";

export const Hero = ({ videoSrc = "/nano_banana_video.mp4", overlayOpacity = 0.4 }) => {
    const { connectors: { connect, drag } } = useNode();

    return (
        <section
            ref={(ref: any) => connect(drag(ref))}
            className={styles.hero}
        >
            <div className={styles.background}>
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className={styles.backgroundImage}
                    style={{ opacity: overlayOpacity }}
                >
                    <source src={videoSrc} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
                <div className={styles.overlay}></div>
            </div>

            <div className={styles.content}>
                <div className={styles.logoIcon}>
                    <img src="/logo.png" alt="Lectures After Dark Logo" className={styles.logoImage} />
                </div>

                <Element
                    id="hero-title"
                    is={Text}
                    text="Lectures After Dark"
                    tagName="h1"
                    className={styles.title}
                    fontSize="5rem"
                    color="var(--cream)"
                />

                <Element
                    id="hero-subtitle"
                    is={Text}
                    text="Where Ambition, Psychology & Culture Collide"
                    tagName="p"
                    className={styles.subtitle}
                    fontSize="1.5rem"
                    color="var(--amber)"
                />

                <div className={styles.buttonGroup}>
                    <Element
                        id="hero-cta"
                        is={Button as any}
                        text="Upcoming Events"
                        variant="contained"
                        backgroundColor="var(--cream)"
                        textColor="var(--midnight)"
                        className={styles.heroButton}
                    />
                    <Element
                        id="hero-secondary-btn"
                        is={Button as any}
                        text="Learn More"
                        variant="outlined"
                        backgroundColor="transparent"
                        textColor="var(--cream)"
                        className={styles.heroButtonSecondary}
                    />
                </div>
            </div>
        </section>
    );
};

const HeroSettings = () => {
    const { actions: { setProp }, videoSrc, overlayOpacity } = useNode((node) => ({
        videoSrc: node.data.props.videoSrc,
        overlayOpacity: node.data.props.overlayOpacity,
    }));

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
                <Typography variant="caption" sx={{ color: '#888', display: 'block', mb: 0.5 }}>Video Source</Typography>
                <TextField
                    fullWidth
                    size="small"
                    value={videoSrc}
                    onChange={(e) => setProp((props: any) => props.videoSrc = e.target.value)}
                    sx={{
                        bgcolor: '#222',
                        '& .MuiInputBase-input': { color: '#fff', p: '8.5px 14px' },
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
                    }}
                />
            </Box>
            <Box>
                <Typography variant="caption" sx={{ color: '#888', display: 'block', mb: 0.5 }}>Overlay Opacity</Typography>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={overlayOpacity}
                    onChange={(e) => setProp((props: any) => props.overlayOpacity = parseFloat(e.target.value))}
                    style={{ width: '100%' }}
                />
            </Box>
        </Box>
    );
};

Hero.craft = {
    displayName: "Hero Section",
    props: {
        videoSrc: "/nano_banana_video.mp4",
        overlayOpacity: 0.4,
    },
    related: {
        settings: HeroSettings,
    },
    rules: {
        canDrag: () => true,
    },
};
