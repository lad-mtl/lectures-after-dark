import { useNode } from '@craftjs/core';

// --- SponsorsHeader ---
interface SponsorsHeaderProps {
    title?: string;
    subtitle?: string;
}

export const SponsorsHeader = ({
    title = "Partner With Lectures After Dark",
    subtitle = "Reach an audience that thinks, drinks, and engages"
}: SponsorsHeaderProps) => {
    const { connectors: { connect, drag } } = useNode();
    return (
        <header
            ref={(ref: HTMLElement | null) => { if (ref) connect(drag(ref)); }}
            className="text-center py-16 px-8 bg-cream-dark"
        >
            <div className="container mx-auto">
                <h1 className="text-5xl !text-center text-midnight mb-4">{title}</h1>
                <p className="font-serif text-xl !text-center text-warm-brown max-w-2xl !mx-auto">{subtitle}</p>
            </div>
        </header>
    );
};

const SponsorsHeaderSettings = () => {
    const { actions: { setProp }, title, subtitle } = useNode((node) => ({
        title: node.data.props.title,
        subtitle: node.data.props.subtitle,
    }));
    return (
        <div>
            <div className="mb-4">
                <label>Title</label>
                <input type="text" value={title} onChange={e => setProp((p: SponsorsHeaderProps) => p.title = e.target.value)} className="w-full" />
            </div>
            <div className="mb-4">
                <label>Subtitle</label>
                <textarea value={subtitle} onChange={e => setProp((p: SponsorsHeaderProps) => p.subtitle = e.target.value)} className="w-full h-24" />
            </div>
        </div>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(SponsorsHeader as any).craft = {
    props: { title: "Partner With Lectures After Dark", subtitle: "Reach an audience that thinks, drinks, and engages" },
    related: { settings: SponsorsHeaderSettings }
};

// --- SponsorsWhy ---
interface SponsorsWhyProps {
    title?: string;
}

export const SponsorsWhy = ({
    title = "Why Sponsor Us?"
}: SponsorsWhyProps) => {
    const { connectors: { connect, drag } } = useNode();
    return (
        <section
            ref={(ref: HTMLElement | null) => { if (ref) connect(drag(ref)); }}
            className="py-20 px-8 bg-cream"
        >
            <div className="container mx-auto">
                <h2 className="text-4xl text-center mb-16 text-midnight">{title}</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-white p-10 rounded-lg border border-cream-dark transition-transform transform hover:-translate-y-2 hover:shadow-xl">
                        <h3 className="text-2xl text-warm-brown mb-6">Access a Premium Audience</h3>
                        <ul className="list-disc list-inside text-midnight">
                            <li><strong>25-45 years old</strong>, college-educated professionals</li>
                            <li><strong>High-engagement</strong>: They read, debate, and share ideas</li>
                            <li><strong>Quality-conscious</strong>: They value experiences over entertainment</li>
                            <li><strong>Socially active</strong>: They bring friends and build community</li>
                        </ul>
                    </div>
                    <div className="bg-white p-10 rounded-lg border border-cream-dark transition-transform transform hover:-translate-y-2 hover:shadow-xl">
                        <h3 className="text-2xl text-warm-brown mb-6">Authentic Brand Alignment</h3>
                        <p className="text-midnight">We don't interrupt the experience—we integrate. Sponsors become part of an intellectual movement, not just another logo on a banner. Associate your brand with curiosity, ambition, and meaningful conversation.</p>
                    </div>
                    <div className="bg-white p-10 rounded-lg border border-cream-dark transition-transform transform hover:-translate-y-2 hover:shadow-xl">
                        <h3 className="text-2xl text-warm-brown mb-6">Growing Movement</h3>
                        <p className="text-midnight">Intellectual social events are filling a gap in adult life. As we expand to new cities and venues, early sponsors position themselves at the forefront of this cultural shift.</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(SponsorsWhy as any).craft = {
    props: { title: "Why Sponsor Us?" },
    related: { settings: () => <div>Static content for now</div> }
};

// --- SponsorsOpportunities ---
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
            className="py-20 px-8 bg-midnight text-cream"
        >
            <div className="container mx-auto">
                <h2 className="text-4xl text-center mb-16 text-cream">{title}</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="bg-card-bg p-8 rounded-lg text-center transition-colors hover:bg-warm-brown border border-border-color">
                        <span className="text-5xl text-gold mb-6 block">🥃</span>
                        <h3 className="text-2xl text-cream mb-4">Beverage Partner</h3>
                        <span className="text-sm uppercase text-cream-dark block mb-6">Ideal for: Craft breweries, cocktail brands, wine distributors</span>
                        <ul className="text-left list-disc list-inside text-text-secondary">
                            <li>Featured drink at every event</li>
                            <li>Brand presence on all promotional materials</li>
                            <li>Social media mentions</li>
                        </ul>
                    </div>
                    <div className="bg-card-bg p-8 rounded-lg text-center transition-colors hover:bg-warm-brown border border-border-color">
                        <span className="text-5xl text-gold mb-6 block">📚</span>
                        <h3 className="text-2xl text-cream mb-4">Title Sponsor</h3>
                        <span className="text-sm uppercase text-cream-dark block mb-6">Ideal for: Publishers, educational platforms, productivity tools</span>
                        <ul className="text-left list-disc list-inside text-text-secondary">
                            <li>Event naming rights</li>
                            <li>Speaking opportunities or book giveaways</li>
                            <li>Logo on website, emails, and social content</li>
                        </ul>
                    </div>
                    <div className="bg-card-bg p-8 rounded-lg text-center transition-colors hover:bg-warm-brown border border-border-color">
                        <span className="text-5xl text-gold mb-6 block">🎤</span>
                        <h3 className="text-2xl text-cream mb-4">Speaker Series Sponsor</h3>
                        <span className="text-sm uppercase text-cream-dark block mb-6">Ideal for: Tech companies, consulting firms</span>
                        <ul className="text-left list-disc list-inside text-text-secondary">
                            <li>Sponsor an entire topic series</li>
                            <li>Thought leadership positioning</li>
                            <li>Content collaboration opportunities</li>
                        </ul>
                    </div>
                    <div className="bg-card-bg p-8 rounded-lg text-center transition-colors hover:bg-warm-brown border border-border-color">
                        <span className="text-5xl text-gold mb-6 block">📍</span>
                        <h3 className="text-2xl text-cream mb-4">Venue Partner</h3>
                        <span className="text-sm uppercase text-cream-dark block mb-6">Ideal for: Bars, restaurants, event spaces</span>
                        <ul className="text-left list-disc list-inside text-text-secondary">
                            <li>Regular monthly events at your location</li>
                            <li>Increased weeknight traffic</li>
                            <li>Promotional support driving customers</li>
                        </ul>
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


// --- SponsorsPastEvents ---
interface SponsorsPastEventsProps {
    title?: string;
}

export const SponsorsPastEvents = ({
    title = "Past Events"
}: SponsorsPastEventsProps) => {
    const { connectors: { connect, drag } } = useNode();
    return (
        <section
            ref={(ref: HTMLElement | null) => { if (ref) connect(drag(ref)); }}
            className="py-20 px-8 bg-cream"
        >
            <div className="container mx-auto max-w-3xl">
                <h2 className="text-4xl text-center mb-16 text-midnight">{title}</h2>
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg border border-cream-dark flex justify-between items-center transition-transform transform hover:scale-105">
                        <div className="text-xl font-medium text-midnight">"The Psychology of Ambition: Why Some People Win and Most Don't"</div>
                        <div className="text-lg font-bold text-amber">85 attendees</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg border border-cream-dark flex justify-between items-center transition-transform transform hover:scale-105">
                        <div className="text-xl font-medium text-midnight">"How Power Really Works"</div>
                        <div className="text-lg font-bold text-amber">92 attendees</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg border border-cream-dark flex justify-between items-center transition-transform transform hover:scale-105">
                        <div className="text-xl font-medium text-midnight">"Modern Dating: The Data Behind Connection"</div>
                        <div className="text-lg font-bold text-amber">78 attendees</div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(SponsorsPastEvents as any).craft = {
    props: { title: "Past Events" },
    related: { settings: () => <div>Static content for now</div> }
};

// --- SponsorsCTA ---
interface SponsorsCTAProps {
    title?: string;
    text?: string;
    buttonText?: string;
    email?: string;
}

export const SponsorsCTA = ({
    title = "Let's Build Something Together",
    text = "We're not just hosting events—we're building a movement. Partner with us to reach an audience that values substance, curiosity, and authentic experiences.",
    buttonText = "Contact Us",
    email = "partnerships@lecturesafterdark.com"
}: SponsorsCTAProps) => {
    const { connectors: { connect, drag } } = useNode();
    return (
        <section
            ref={(ref: HTMLElement | null) => { if (ref) connect(drag(ref)); }}
            className="py-20 px-8 bg-amber text-center"
        >
            <div className="container mx-auto max-w-2xl">
                <h2 className="text-4xl font-bold text-midnight mb-6">{title}</h2>
                <p className="text-lg text-warm-brown mb-8">{text}</p>
                <a href={`mailto:${email}`} className="bg-midnight text-cream py-4 px-12 text-lg font-semibold rounded-full transition-transform transform hover:scale-105 inline-block">{buttonText}</a>
            </div>
        </section>
    );
};

const SponsorsCTASettings = () => {
    const { actions: { setProp }, title, text, buttonText, email } = useNode((node) => ({
        title: node.data.props.title,
        text: node.data.props.text,
        buttonText: node.data.props.buttonText,
        email: node.data.props.email,
    }));
    return (
        <div>
            <div className="mb-4">
                <label>Title</label>
                <input type="text" value={title} onChange={e => setProp((p: SponsorsCTAProps) => p.title = e.target.value)} className="w-full" />
            </div>
            <div className="mb-4">
                <label>Text</label>
                <textarea value={text} onChange={e => setProp((p: SponsorsCTAProps) => p.text = e.target.value)} className="w-full h-32" />
            </div>
            <div className="mb-4">
                <label>Button Text</label>
                <input type="text" value={buttonText} onChange={e => setProp((p: SponsorsCTAProps) => p.buttonText = e.target.value)} className="w-full" />
            </div>
            <div className="mb-4">
                <label>Email</label>
                <input type="text" value={email} onChange={e => setProp((p: SponsorsCTAProps) => p.email = e.target.value)} className="w-full" />
            </div>
        </div>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(SponsorsCTA as any).craft = {
    props: {
        title: "Let's Build Something Together",
        text: "We're not just hosting events—we're building a movement...",
        buttonText: "Contact Us",
        email: "partnerships@lecturesafterdark.com"
    },
    related: { settings: SponsorsCTASettings }
};
