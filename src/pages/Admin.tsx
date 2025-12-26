import React, { useState } from 'react';
import { Editor, Element } from '@craftjs/core';
import { MigratingFrame } from '../components/MigratingFrame';
import { Hero } from '../components/Hero';
import { Instagram } from '../components/Instagram';
import { IdeaSection } from '../components/IdeaSection';
import { WhyWeDoIt } from '../components/WhyWeDoIt';
import { UpcomingEvents } from '../components/UpcomingEvents';
import { EventCard } from '../components/EventCard';
import { SpeakersHeader, SpeakersInfo, SpeakersList, SpeakersCTA } from '../components/Speakers';
import { SpeakerCard } from '../components/SpeakerCard';
import { BarsHeader, BarsInfo, BarsList, BarsCTA } from '../components/Bars';
import { BarCard } from '../components/BarCard';
import { AboutHeader, AboutMission } from '../components/About';
import { FAQ } from '../components/FAQ';
import { TestTailwind } from '../components/TestTailwind';
import { SettingsPanel } from '../components/SettingsPanel';


import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Topbar } from '../components/Topbar';
import PageTabs from '../components/PageTabs';

const MAIN_RESOLVER = {
    Hero, Instagram, IdeaSection, WhyWeDoIt, UpcomingEvents, EventCard, FAQ,
    SpeakersHeader, SpeakersInfo, SpeakersList, SpeakersCTA, SpeakerCard,
    BarsHeader, BarsInfo, BarsList, BarsCTA, BarCard,
    AboutHeader, AboutMission, TestTailwind
};

const Admin: React.FC = () => {
    const [activePage, setActivePage] = useState('home');
    const pageData = useQuery(api.pages.getPage, { slug: activePage });
    console.log("activePage", activePage);

    if (pageData === undefined) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading Editor...</div>;
    }

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Editor resolver={MAIN_RESOLVER}>
                <Topbar activePageSlug={activePage} />
                <PageTabs activePageSlug={activePage} onPageChange={setActivePage} />
                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    <div style={{ flex: 1, overflow: 'auto', padding: '20px', background: '#e0e0e0' }}>
                        <div style={{ background: 'white', minHeight: '100%', boxShadow: '0 0 10px rgba(0,0,0,0.1)', position: 'relative', transform: 'translate(0)' }}>

                            {activePage === 'home' ? (
                                <MigratingFrame json={pageData?.layout}>
                                    <Element is="div" style={{ padding: '20px', minHeight: '800px' }} canvas>
                                        <Hero />
                                        <UpcomingEvents />
                                        <IdeaSection />
                                        <WhyWeDoIt />
                                        <Instagram />
                                        <FAQ />
                                    </Element>
                                </MigratingFrame>
                            ) : activePage === 'bars' ? (
                                <MigratingFrame json={pageData?.layout}>
                                    <Element is="div" style={{ padding: '20px', minHeight: '800px' }} canvas>
                                        <BarsHeader />
                                        <BarsInfo />
                                        <BarsList />
                                        <BarsCTA />
                                    </Element>
                                </MigratingFrame>
                            ) : activePage === 'speakers' ? (
                                <MigratingFrame json={pageData?.layout}>
                                    <Element is="div" style={{ padding: '20px', minHeight: '800px' }} canvas>
                                        <SpeakersHeader />
                                        <SpeakersInfo />
                                        <SpeakersList />
                                        <SpeakersCTA />
                                    </Element>
                                </MigratingFrame>
                            ) : activePage === 'about' ? (
                                <MigratingFrame json={pageData?.layout}>
                                    <Element is="div" style={{ padding: '20px', minHeight: '800px' }} canvas>
                                        <AboutHeader />
                                        <AboutMission />
                                    </Element>
                                </MigratingFrame>
                            ) : activePage === 'events' ? (
                                <MigratingFrame json={pageData?.layout}>
                                    <Element is="div" style={{ padding: '20px', minHeight: '800px' }} canvas>
                                        <UpcomingEvents />
                                    </Element>
                                </MigratingFrame>
                            ) : activePage === 'test-tailwind' ? (
                                <MigratingFrame json={pageData?.layout}>
                                    <Element is="div" style={{ padding: '20px', minHeight: '800px' }} canvas>
                                        <TestTailwind />
                                    </Element>
                                </MigratingFrame>
                            ) : (
                                <MigratingFrame>
                                    <Element is="div" style={{ padding: '20px', minHeight: '800px' }} canvas />
                                </MigratingFrame>
                            )}
                        </div>
                    </div>
                    <SettingsPanel />
                </div>
            </Editor>
        </div>
    );
};

export default Admin;
