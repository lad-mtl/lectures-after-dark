import React from 'react';
import Hero from '../components/Hero';
import UpcomingEvents from '../components/UpcomingEvents';
import IdeaSection from '../components/IdeaSection';
// import Topics from '../components/Topics';
import Instagram from '../components/Instagram';
import FAQ from '../components/FAQ';
import CTA from '../components/CTA';

const Home: React.FC = () => {
    return (
        <>
            <Hero />
            <UpcomingEvents />
            <IdeaSection />
            {/* <Topics /> */}
            <Instagram />
            <FAQ />
            <CTA />
        </>
    );
};

export default Home;
