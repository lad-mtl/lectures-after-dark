import React, { useState } from 'react';
import { Editor, Frame, Element } from '@craftjs/core';
import { Hero } from '../components/Hero';
import { Instagram } from '../components/Instagram';
import { IdeaSection } from '../components/IdeaSection';
import { WhyWeDoIt } from '../components/WhyWeDoIt';
import { UpcomingEvents } from '../components/UpcomingEvents';
import { EventCard } from '../components/EventCard';
import { FAQ } from '../components/FAQ';
import { SettingsPanel } from '../components/SettingsPanel';
import Navbar from '../components/Navbar';

import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Topbar } from '../components/Topbar';
import PageTabs from '../components/PageTabs';

const Admin: React.FC = () => {
    const [activePage, setActivePage] = useState('home');
    const pageData = useQuery(api.pages.getPage, { slug: activePage });
    console.log("activePage", activePage);

    if (pageData === undefined) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading Editor...</div>;
    }

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {activePage === 'home' ? (
                <Editor resolver={{ Hero, Instagram, IdeaSection, WhyWeDoIt, UpcomingEvents, EventCard, FAQ }}>
                    <Topbar />
                    <PageTabs activePageSlug={activePage} onPageChange={setActivePage} />
                    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                        <div style={{ flex: 1, overflow: 'auto', padding: '20px', background: '#e0e0e0' }}>
                            <div style={{ background: 'white', minHeight: '100%', boxShadow: '0 0 10px rgba(0,0,0,0.1)', position: 'relative', transform: 'translate(0)' }}>
                                <Navbar />
                                <Frame json={pageData?.layout}>
                                    <Element is="div" style={{ padding: '20px', minHeight: '800px' }} canvas>
                                        <Hero />
                                        <UpcomingEvents />
                                        <IdeaSection />
                                        <WhyWeDoIt />
                                        <Instagram />
                                        <FAQ />
                                    </Element>
                                </Frame>
                            </div>
                        </div>
                        <SettingsPanel />
                    </div>
                </Editor>
            ) : (
                <Editor resolver={{ Hero, Instagram, IdeaSection, WhyWeDoIt, UpcomingEvents, EventCard, FAQ }}>
                    <Topbar />
                    <PageTabs activePageSlug={activePage} onPageChange={setActivePage} />
                    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                        <div style={{ flex: 1, overflow: 'auto', padding: '20px', background: '#e0e0e0' }}>
                            <div style={{ background: 'white', minHeight: '100%', boxShadow: '0 0 10px rgba(0,0,0,0.1)', position: 'relative', transform: 'translate(0)' }}>
                                <Navbar />
                                <Frame>
                                    <Element is="div" style={{ padding: '20px', minHeight: '800px' }} canvas />
                                </Frame>
                            </div>
                        </div>
                        <SettingsPanel />
                    </div>
                </Editor>
            )}
        </div>
    );
};

export default Admin;
