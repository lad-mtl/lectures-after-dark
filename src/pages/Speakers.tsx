import React from 'react';
import { Editor, Element } from '@craftjs/core';
import { MigratingFrame } from '../components/MigratingFrame';
import { SpeakersHeader, SpeakersInfo, SpeakersList, SpeakersCTA } from '../components/Speakers';
import { SpeakerCard } from '../components/SpeakerCard';

import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const Speakers: React.FC = () => {
    const pageData = useQuery(api.pages.getPage, { slug: "speakers" });

    if (pageData === undefined) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
    }

    return (
        <Editor enabled={false} resolver={{ SpeakersHeader, SpeakersInfo, SpeakersList, SpeakersCTA, SpeakerCard }}>
            <MigratingFrame json={pageData?.layout}>
                <Element is="div" canvas>
                    <SpeakersHeader />
                    <SpeakersInfo />
                    <SpeakersList />
                    <SpeakersCTA />
                </Element>
            </MigratingFrame>
        </Editor>
    );
};

export default Speakers;
