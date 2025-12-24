import { Box, Typography, Button as MaterialButton, Tooltip } from "@mui/material";
import { useEditor, Element } from "@craftjs/core";
import { Container } from "./user/Container";
import { Card } from "./user/Card";
import { Button } from "./user/Button";
import { Text } from "./user/Text";
import { IdeaSection } from "./user/IdeaSection";
import { WhyWeDoIt } from "./user/WhyWeDoIt";
import { Image } from "./user/Image";
import { UpcomingEvents } from "./UpcomingEvents";
import { EventCard } from "./user/EventCard";
import { Hero } from "./user/Hero";
import { Instagram as InstagramComponent } from "./user/Instagram";
import { Type, Square, Layout, CreditCard, Calendar, Monitor, Instagram } from "lucide-react";

export const Toolbox = () => {
    const { connectors } = useEditor();

    return (
        <Box px={2} py={2}>

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
                <Tooltip title="Idea Section" arrow>
                    <MaterialButton
                        variant="outlined"
                        fullWidth
                        style={{ flexDirection: "column", padding: "10px", textTransform: "none", borderColor: "#e0e0e0", color: "#555" }}
                        ref={(ref: any) => connectors.create(ref,
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
                                    <Text
                                        text="Lectures After Dark is a growing movement of intellectual social events that combine academic learning settings with the social experience of a bar."
                                        tagName="p"
                                        fontSize="1.25rem"
                                        fontFamily="var(--font-serif)"
                                        color="var(--text-secondary)"
                                        lineHeight={1.8}
                                    />
                                    <Text
                                        text="Our events are designed to be accessible to everyone while still offering deep insights. Curiosity is the only requirement."
                                        tagName="p"
                                        fontSize="1.25rem"
                                        fontFamily="var(--font-serif)"
                                        color="var(--text-secondary)"
                                        lineHeight={1.8}
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
                        )}
                    >
                        <Type size={20} style={{ marginBottom: 5 }} />
                        <Typography variant="caption">Idea</Typography>
                    </MaterialButton>
                </Tooltip>
                <Tooltip title="Why We Do It" arrow>
                    <MaterialButton
                        variant="outlined"
                        fullWidth
                        style={{ flexDirection: "column", padding: "10px", textTransform: "none", borderColor: "#e0e0e0", color: "#555" }}
                        ref={(ref: any) => connectors.create(ref,
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
                                <Text
                                    text="A lot of us miss that campus vibe — hearing a great idea, debating it after, and leaving with something that sticks. Lectures After Dark brings that back, just in a bar: relaxed, social, and actually fun."
                                    tagName="p"
                                    fontSize="1.25rem"
                                    fontFamily="var(--font-serif)"
                                    color="var(--text-secondary)"
                                    lineHeight={1.7}
                                    textAlign="center"
                                />
                            </Element>
                        )}
                    >
                        <Type size={20} style={{ marginBottom: 5 }} />
                        <Typography variant="caption">Why</Typography>
                    </MaterialButton>
                </Tooltip>
                <Tooltip title="Upcoming Events" arrow>
                    <MaterialButton
                        variant="outlined"
                        fullWidth
                        style={{ flexDirection: "column", padding: "10px", textTransform: "none", borderColor: "#e0e0e0", color: "#555" }}
                        ref={(ref: any) => connectors.create(ref, <UpcomingEvents />)}
                    >
                        <Calendar size={20} style={{ marginBottom: 5 }} />
                        <Typography variant="caption">Events</Typography>
                    </MaterialButton>
                </Tooltip>
                <Tooltip title="Event Card" arrow>
                    <MaterialButton
                        variant="outlined"
                        fullWidth
                        style={{ flexDirection: "column", padding: "10px", textTransform: "none", borderColor: "#e0e0e0", color: "#555" }}
                        ref={(ref: any) => connectors.create(ref, <EventCard />)}
                    >
                        <CreditCard size={20} style={{ marginBottom: 5 }} />
                        <Typography variant="caption">Event</Typography>
                    </MaterialButton>
                </Tooltip>
                <Tooltip title="Hero Section" arrow>
                    <MaterialButton
                        variant="outlined"
                        fullWidth
                        style={{ flexDirection: "column", padding: "10px", textTransform: "none", borderColor: "#e0e0e0", color: "#555" }}
                        ref={(ref: any) => connectors.create(ref, <Hero />)}
                    >
                        <Monitor size={20} style={{ marginBottom: 5 }} />
                        <Typography variant="caption">Hero</Typography>
                    </MaterialButton>
                </Tooltip>
                <Tooltip title="Instagram" arrow>
                    <MaterialButton
                        variant="outlined"
                        fullWidth
                        style={{ flexDirection: "column", padding: "10px", textTransform: "none", borderColor: "#e0e0e0", color: "#555" }}
                        ref={(ref: any) => connectors.create(ref, <InstagramComponent />)}
                    >
                        <Instagram size={20} style={{ marginBottom: 5 }} />
                        <Typography variant="caption">Instagram</Typography>
                    </MaterialButton>
                </Tooltip>
            </Box>
        </Box>
    )
};
