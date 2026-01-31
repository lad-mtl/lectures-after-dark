import React from 'react';
import { Editor, Element } from '@craftjs/core';
import { MigratingFrame } from '../components/MigratingFrame';
import { AboutHeader, AboutMission, OurVision, OurTeam } from '../components/About';
import { TeamMemberCard } from '../components/TeamMemberCard';

import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const About: React.FC = () => {
    const pageData = useQuery(api.pages.getPage, { slug: "about" });

    if (pageData === undefined) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
    }

    return (
        <Editor enabled={false} resolver={{ AboutHeader, AboutMission, OurVision, OurTeam, TeamMemberCard }}>
            <MigratingFrame json={pageData?.layout}>
                <Element is="div" canvas>
                    <AboutHeader />
                    <AboutMission />
                    <OurVision />
                    <OurTeam />
                </Element>
            </MigratingFrame>
        </Editor>
    );
};

export default About;
