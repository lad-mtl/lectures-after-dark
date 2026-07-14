import { Hero } from '../components/Hero';
import { UpcomingEvents } from '../components/UpcomingEvents';
import { WhyWeDoIt } from '../components/WhyWeDoIt';
import { IdeaSection } from '../components/IdeaSection';
import { Instagram } from '../components/Instagram';
import { FAQ } from '../components/FAQ';

const Home = () => {
    return (
        <div>
            <Hero />
            <UpcomingEvents />
            <IdeaSection />
            <WhyWeDoIt />
            <Instagram />
            <FAQ />
        </div>
    );
};

export default Home;
