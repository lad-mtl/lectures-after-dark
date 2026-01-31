import React, { useState } from 'react';
import { Editor, Element } from '@craftjs/core';
import { MigratingFrame } from '../components/MigratingFrame';
import { Hero } from '../components/Hero';
import { Instagram } from '../components/Instagram';
import { IdeaSection } from '../components/IdeaSection';
import { HowToJoin } from '../components/HowToJoin';
import { WhyWeDoIt } from '../components/WhyWeDoIt';
import { UpcomingEvents } from '../components/UpcomingEvents';
import { EventCard } from '../components/EventCard';
import { EventCardRedesign } from '../components/EventCardRedesign';
import { SpeakersHeader, SpeakersInfo, SpeakersList, SpeakersCTA } from '../components/Speakers';
import { SpeakerCard } from '../components/SpeakerCard';
import { BarsHeader, BarsInfo, BarsList, BarsCTA } from '../components/Bars';
import { BarCard } from '../components/BarCard';
import { AboutHeader, AboutMission, OurVision, OurTeam } from '../components/About';
import { TeamMemberCard } from '../components/TeamMemberCard';
import { SponsorsHeader, SponsorsWhy, SponsorsOpportunities, SponsorsCTA } from '../components/Sponsors';
import { FAQ } from '../components/FAQ';
import { TestTailwind } from '../components/TestTailwind';
import { SettingsPanel } from '../components/SettingsPanel';


import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Topbar } from '../components/Topbar';
import PageTabs from '../components/PageTabs';
import { EDITOR_CANVAS_MIN_HEIGHT } from '../constants';

const MAIN_RESOLVER = {
    Hero, Instagram, IdeaSection, HowToJoin, WhyWeDoIt, UpcomingEvents, EventCard, EventCardRedesign, FAQ,
    SpeakersHeader, SpeakersInfo, SpeakersList, SpeakersCTA, SpeakerCard,
    BarsHeader, BarsInfo, BarsList, BarsCTA, BarCard,
    AboutHeader, AboutMission, OurVision, OurTeam, TestTailwind, TeamMemberCard,
    SponsorsHeader, SponsorsWhy, SponsorsOpportunities, SponsorsCTA
};

const PAGE_COMPONENTS: Record<string, React.ReactNode> = {
    home: (
        <>
            <Hero />
            <UpcomingEvents />
            <IdeaSection />
            <WhyWeDoIt />
            <Instagram />
            <FAQ />
        </>
    ),
    bars: (
        <>
            <BarsHeader />
            <BarsInfo />
            <BarsList />
            <BarsCTA />
        </>
    ),
    speakers: (
        <>
            <SpeakersHeader />
            <SpeakersInfo />
            <SpeakersList />
            <SpeakersCTA />
        </>
    ),
    about: (
        <>
            <AboutHeader />
            <AboutMission />
            <OurVision />
            <OurTeam />
        </>
    ),
    sponsors: (
        <>
            <SponsorsHeader />
            <SponsorsWhy />
            <SponsorsOpportunities />
            <SponsorsCTA />
        </>
    ),
    'test-tailwind': <TestTailwind />,
};

const Admin: React.FC = () => {
    const [activePage, setActivePage] = useState('home');
    const pageData = useQuery(api.pages.getPage, { slug: activePage });

    if (pageData === undefined) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading Editor...</div>;
    }

    const pageComponents = PAGE_COMPONENTS[activePage] ?? null;

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Editor resolver={MAIN_RESOLVER}>
                <Topbar activePageSlug={activePage} />
                <PageTabs activePageSlug={activePage} onPageChange={setActivePage} />
                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    <div style={{ flex: 1, overflow: 'auto', padding: '20px', background: '#e0e0e0' }}>
                        <div style={{ background: 'white', minHeight: '100%', boxShadow: '0 0 10px rgba(0,0,0,0.1)', position: 'relative', transform: 'translate(0)' }}>
                            <MigratingFrame json={pageData?.layout}>
                                <Element is="div" style={{ minHeight: EDITOR_CANVAS_MIN_HEIGHT }} canvas>
                                    {pageComponents}
                                </Element>
                            </MigratingFrame>
                        </div>
                    </div>
                    <SettingsPanel />
                </div>
            </Editor>
        </div>
    );
};

export default Admin;
