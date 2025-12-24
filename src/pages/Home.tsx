import React from 'react';
import { Editor, Frame, Element } from '@craftjs/core';
import { Hero } from '../components/Hero';
import UpcomingEvents from '../components/UpcomingEvents';
import WhyWeDoIt from '../components/WhyWeDoIt';
import { IdeaSection } from '../components/IdeaSection';
import { Instagram } from '../components/Instagram';
import FAQ from '../components/FAQ';

import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const Home: React.FC = () => {
    const pageData = useQuery(api.pages.getPage, { slug: "home" });

    if (pageData === undefined) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
    }

    return (
        <Editor enabled={false} resolver={{ Hero, Instagram, IdeaSection, UpcomingEvents, WhyWeDoIt, FAQ }}>
            <Frame json={pageData?.layout}>
                <Element is="div" canvas>
                    <Hero />
                    <UpcomingEvents />
                    <IdeaSection />
                    <WhyWeDoIt />
                    <Instagram />
                    <FAQ />
                </Element>
            </Frame>
        </Editor>
    );
};

export default Home;
