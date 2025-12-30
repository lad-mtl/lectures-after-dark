
import { useNode } from '@craftjs/core';
import { Check } from 'lucide-react';

interface IdeaSectionProps {
    title?: string;
    description1?: string;
    description2?: string;
}

export const IdeaSection = ({
    title = "The Idea",
    description1 = "Lectures After Dark is a growing movement of intellectual social events that combine academic learning settings with the social experience of a bar.",
    description2 = "Our events are designed to be accessible to everyone while still offering deep insights. Curiosity is the only requirement."
}: IdeaSectionProps) => {
    const { connectors: { connect, drag } } = useNode();

    return (
        <section
            ref={(ref: HTMLElement | null) => {
                if (ref) {
                    connect(drag(ref));
                }
            }}
            id="about"
            className="py-32 bg-warm-brown relative overflow-hidden"
        >
            <div className="container">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
                    <div>
                        {/* Title with gold accent bar */}
                        <div className="flex items-center gap-6 !mb-8">
                            <div className="w-16 h-1 bg-gold"></div>
                            <h2 className="font-headline text-5xl text-cream md:text-[3.5rem]">{title}</h2>
                        </div>

                        <p className="font-serif text-xl leading-[2] text-cream !mb-10">{description1}</p>
                        <p className="font-serif text-xl leading-[2] text-cream !mb-12">{description2}</p>

                        <ul className="space-y-5 mt-16">
                            <li className="flex items-start gap-3 text-lg text-cream">
                                <Check size={22} className="text-gold mt-0.5 shrink-0 stroke-[2.5]" />
                                <span className="font-medium">Fun and Engaging Speakers</span>
                            </li>
                            <li className="flex items-start gap-3 text-lg text-cream">
                                <Check size={22} className="text-gold mt-0.5 shrink-0 stroke-[2.5]" />
                                <span className="font-medium">Professors and Industry Leaders</span>
                            </li>
                            <li className="flex items-start gap-3 text-lg text-cream">
                                <Check size={22} className="text-gold mt-0.5 shrink-0 stroke-[2.5]" />
                                <span className="font-medium">Education and Entertainment</span>
                            </li>
                        </ul>
                    </div>

                    <div className="relative">
                        <div className="relative p-1 bg-gradient-to-br from-gold/20 to-transparent rounded-lg">
                            <img
                                src="/idea.png"
                                alt="Cocktails and Conversation"
                                className="w-full rounded-lg shadow-2xl"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const IdeaSectionSettings = () => {
    const { actions: { setProp }, title, description1, description2 } = useNode((node) => ({
        title: node.data.props.title,
        description1: node.data.props.description1,
        description2: node.data.props.description2,
    }));

    return (
        <div>
            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Title</label>
                <input
                    type="text"
                    value={title || ''}
                    onChange={(e) => setProp((props: IdeaSectionProps) => props.title = e.target.value)}
                    style={{ width: '100%', padding: '5px' }}
                />
            </div>
            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Description 1</label>
                <textarea
                    value={description1 || ''}
                    onChange={(e) => setProp((props: IdeaSectionProps) => props.description1 = e.target.value)}
                    style={{ width: '100%', padding: '5px', minHeight: '80px' }}
                />
            </div>
            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Description 2</label>
                <textarea
                    value={description2 || ''}
                    onChange={(e) => setProp((props: IdeaSectionProps) => props.description2 = e.target.value)}
                    style={{ width: '100%', padding: '5px', minHeight: '80px' }}
                />
            </div>
        </div>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(IdeaSection as any).craft = {
    props: {
        title: "The Idea",
        description1: "Lectures After Dark is a growing movement of intellectual social events that combine academic learning settings with the social experience of a bar.",
        description2: "Our events are designed to be accessible to everyone while still offering deep insights. Curiosity is the only requirement."
    },
    related: {
        settings: IdeaSectionSettings
    }
};

export default IdeaSection;
