import { Hero } from '../components/Hero';
import { UpcomingEvents } from '../components/UpcomingEvents';
import { WhyWeDoIt } from '../components/WhyWeDoIt';
import { IdeaSection } from '../components/IdeaSection';
import { Instagram } from '../components/Instagram';
import { FAQ } from '../components/FAQ';
import CTA from '../components/CTA';

const Home = () => {
    return (
        <div>
            <Hero />
            <UpcomingEvents />
            <IdeaSection />
            <WhyWeDoIt />
            <Instagram />
            <CTA />
            <FAQ />
        </div>
    );
};

export default Home;
