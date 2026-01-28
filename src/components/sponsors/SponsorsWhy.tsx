import { useNode } from '@craftjs/core';

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
            className="pt-16 pb-32 bg-white relative overflow-hidden"
        >
            <div className="container">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
                    <div>
                        {/* Title with gold accent bar */}
                        <div className="flex items-center gap-6 !mb-8">
                            <div className="w-16 h-1 bg-gold"></div>
                            <h2 className="font-headline text-3xl text-midnight md:text-4xl lg:text-5xl">{title}</h2>
                        </div>

                        <p className="font-serif text-base md:text-lg leading-[1.8] text-warm-brown !mb-10">We don't interrupt the experience—we integrate. Sponsors become part of an intellectual movement, not just another logo on a banner. Associate your brand with curiosity, ambition, and meaningful conversation.</p>
                        <p className="font-serif text-base md:text-lg leading-[1.8] text-warm-brown !mb-12">Intellectual social events are filling a gap in adult life. As we expand to new cities and venues, early sponsors position themselves at the forefront of this cultural shift.</p>
                    </div>

                    <div className="relative">
                        <div className="relative p-1 bg-gradient-to-br from-gold/20 to-transparent rounded-lg">
                            <picture>
                                <source srcSet="/idea.webp" type="image/webp" />
                                <img
                                    src="/idea.png"
                                    alt="Cocktails and Conversation"
                                    className="w-full rounded-lg shadow-2xl"
                                    loading="lazy"
                                    decoding="async"
                                />
                            </picture>
                        </div>
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
