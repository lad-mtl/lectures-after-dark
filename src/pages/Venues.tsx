import React from 'react';
import { Editor, Element } from '@craftjs/core';
import { MigratingFrame } from '../components/MigratingFrame';
import { BarsHeader, BarsInfo, BarsList, BarsCTA } from '../components/Bars';
import { BarCard } from '../components/BarCard';

import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const Venues: React.FC = () => {
    const pageData = useQuery(api.pages.getPage, { slug: "bars" });

    if (pageData === undefined) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
    }

    return (
        <Editor enabled={false} resolver={{ BarsHeader, BarsInfo, BarsList, BarsCTA, BarCard }}>
            <MigratingFrame json={pageData?.layout}>
                <Element is="div" canvas>
                    <BarsHeader />
                    <BarsInfo />
                    <BarsList />
                    <BarsCTA />
                </Element>
            </MigratingFrame>
        </Editor>
    );
};

export default Venues;
