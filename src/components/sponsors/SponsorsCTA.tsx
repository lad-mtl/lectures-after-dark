import { useNode } from '@craftjs/core';
import { settingsStyles } from '../settings/settingsStyles';

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
            className="py-20 px-8 bg-white text-center"
        >
            <div className="container mx-auto max-w-2xl">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-midnight mb-6">{title}</h2>
                <p className="text-base md:text-lg text-warm-brown mb-8">{text}</p>
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
            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={e => setProp((p: SponsorsCTAProps) => p.title = e.target.value)}
                    style={settingsStyles.input}
                />
            </div>
            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Text</label>
                <textarea
                    value={text}
                    onChange={e => setProp((p: SponsorsCTAProps) => p.text = e.target.value)}
                    style={settingsStyles.textarea}
                />
            </div>
            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Button Text</label>
                <input
                    type="text"
                    value={buttonText}
                    onChange={e => setProp((p: SponsorsCTAProps) => p.buttonText = e.target.value)}
                    style={settingsStyles.input}
                />
            </div>
            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Email</label>
                <input
                    type="text"
                    value={email}
                    onChange={e => setProp((p: SponsorsCTAProps) => p.email = e.target.value)}
                    style={settingsStyles.input}
                />
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
