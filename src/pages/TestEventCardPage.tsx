import React from 'react';
import { EventCard } from '../components/EventCard';

const TestEventCardPage: React.FC = () => {
    return (
        <div className="bg-gray-900 min-h-screen flex items-center justify-center p-8">
            <EventCard />
        </div>
    );
};

export default TestEventCardPage;
