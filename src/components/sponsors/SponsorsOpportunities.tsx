import { useNode } from '@craftjs/core';
import { SponsorCard } from '../SponsorCard';

interface SponsorsOpportunitiesProps {
    title?: string;
}

export const SponsorsOpportunities = ({
    title = "Sponsorship Opportunities"
}: SponsorsOpportunitiesProps) => {
    const { connectors: { connect, drag } } = useNode();
    return (
        <section
            ref={(ref: HTMLElement | null) => { if (ref) connect(drag(ref)); }}
            className="py-20 px-8 bg-cream text-midnight"
        >
            <div className="container mx-auto">
                <h2 className="text-2xl md:text-3xl lg:text-4xl text-center !mb-10 text-midnight">{title}</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" style={{ gridAutoRows: '1fr' }}>
                    <div style={{ display: 'flex' }}>
                        <SponsorCard
                            name="Beverage Partner"
                            tier="Ideal for: Craft breweries, cocktail brands, wine distributors"
                            description="Featured drink at every event. Brand presence on all promotional materials. Social media mentions."
                            image="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&auto=format&fit=crop&q=80"
                        />
                    </div>
                    <div style={{ display: 'flex' }}>
                        <SponsorCard
                            name="Title Sponsor"
                            tier="Ideal for: Publishers, educational platforms, productivity tools"
                            description="Event naming rights. Speaking opportunities or book giveaways. Logo on website, emails, and social content."
                            image="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&auto=format&fit=crop&q=80"
                        />
                    </div>
                    <div style={{ display: 'flex' }}>
                        <SponsorCard
                            name="Speaker Series Sponsor"
                            tier="Ideal for: Tech companies, consulting firms"
                            description="Sponsor an entire topic series. Thought leadership positioning. Content collaboration opportunities."
                            image="https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(SponsorsOpportunities as any).craft = {
    props: { title: "Sponsorship Opportunities" },
    related: { settings: () => <div>Static content for now</div> }
};
