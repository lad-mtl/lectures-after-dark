import React from 'react';
import { Editor, Element } from '@craftjs/core';
import { MigratingFrame } from '../components/MigratingFrame';
import { SponsorsHeader, SponsorsWhy, SponsorsOpportunities, SponsorsPastEvents, SponsorsCTA } from '../components/Sponsors';

import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const Sponsors: React.FC = () => {
    const pageData = useQuery(api.pages.getPage, { slug: "sponsors" });

    if (pageData === undefined) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
    }

    return (
        <Editor enabled={false} resolver={{ SponsorsHeader, SponsorsWhy, SponsorsOpportunities, SponsorsPastEvents, SponsorsCTA }}>
            <MigratingFrame json={pageData?.layout}>
                <Element is="div" canvas>
                    <SponsorsHeader />
                    <SponsorsWhy />
                    <SponsorsOpportunities />
                    <SponsorsPastEvents />
                    <SponsorsCTA />
                </Element>
            </MigratingFrame>
        </Editor>
    );
};

export default Sponsors;
