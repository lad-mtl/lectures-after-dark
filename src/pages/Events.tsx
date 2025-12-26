import React from 'react';
import { Editor, Element } from '@craftjs/core';
import { MigratingFrame } from '../components/MigratingFrame';
import { UpcomingEvents } from '../components/UpcomingEvents';
import { EventCard } from '../components/EventCard';

import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const Events: React.FC = () => {
    const pageData = useQuery(api.pages.getPage, { slug: "events" });

    if (pageData === undefined) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
    }

    return (
        <Editor enabled={false} resolver={{ UpcomingEvents, EventCard }}>
            <MigratingFrame json={pageData?.layout}>
                <Element is="div" canvas style={{ minHeight: '80vh' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', flexDirection: 'column', color: 'white' }}>
                        <h1>Events</h1>
                        <p>Coming Soon</p>
                    </div>
                </Element>
            </MigratingFrame>
        </Editor>
    );
};

export default Events;
