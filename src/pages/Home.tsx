import React from 'react';
import { Editor, Frame, Element } from '@craftjs/core';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { CircularProgress, Box } from "@mui/material";

// User Components
import { Text } from '../components/user/Text';
import { Button } from '../components/user/Button';
import { Container } from '../components/user/Container';
import { Card } from '../components/user/Card';
import { IdeaSection } from '../components/user/IdeaSection';
import { Image } from '../components/user/Image';
import { Hero } from '../components/user/Hero';

// Legacy Components (for fallback/migration)
import LegacyHero from '../components/Hero';
import { UpcomingEvents } from '../components/UpcomingEvents';
import { WhyWeDoIt } from '../components/user/WhyWeDoIt';
import LegacyWhyWeDoIt from '../components/WhyWeDoIt';
import LegacyIdeaSection from '../components/IdeaSection';
import Instagram from '../components/Instagram';
import FAQ from '../components/FAQ';

import { EventCard } from '../components/user/EventCard';

const Home: React.FC = () => {
    const pageData = useQuery(api.pages.getPage, { slug: "home" });

    if (pageData === undefined) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    // If we have saved content, render it.
    // Otherwise, render the hardcoded components (wrapped in Craft.js for consistency if we want, 
    // but for now let's just render the saved JSON or nothing if empty/null).
    // Actually, to be safe, if no content, we can render the original hardcoded layout 
    // BUT since we want to prove the editor works, let's render the editor content.

    return (
        <div className="home-page">
            <Editor enabled={false} resolver={{ Text, Button, Container, Card, IdeaSection, Image, WhyWeDoIt, UpcomingEvents, EventCard, Hero }}>
                {pageData?.content ? (
                    <Frame data={pageData.content} />
                ) : (
                    <Frame>
                        <Element is={Container} canvas width="100%" padding={0} background="transparent">
                            <Element is={Hero} canvas videoSrc="/nano_banana_video.mp4" overlayOpacity={0.4} />
                            <Element is={UpcomingEvents} />
                            <LegacyIdeaSection />
                            <LegacyWhyWeDoIt />
                            <Instagram />
                            <FAQ />
                            <Element is={Container} padding={40} background="#1a1a1a" width="100%" alignItems="center" justifyContent="center">
                                <Element is={Text} text="Stay Updated" fontSize="2rem" color="#ffffff" textAlign="center" margin="0 0 10px 0" />
                                <Element is={Text} text="Join our newsletter to get the latest updates." fontSize="1rem" color="#cccccc" textAlign="center" margin="0 0 20px 0" />
                                <Element is={Button as any} text="Join our newsletter" variant="contained" color="primary" size="large" />
                            </Element>
                        </Element>
                    </Frame>
                )}
            </Editor>
        </div>
    );
};

export default Home;
