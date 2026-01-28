import { useNode } from '@craftjs/core';
import styles from '../../pages/Speakers.module.css';
import { Mic } from 'lucide-react';
import { settingsStyles } from '../settings/settingsStyles';

interface SpeakersCTAProps {
    title?: string;
    description?: string;
    buttonText?: string;
    secondaryButtonText?: string;
    secondaryButtonLink?: string;
}

export const SpeakersCTA = ({
    title = "Share Your Voice",
    description = "If you have a topic you're passionate about, we'd love to hear from you.",
    buttonText = "Apply to Speak",
    secondaryButtonText = "Learn More",
    secondaryButtonLink = "/about"
}: SpeakersCTAProps) => {
    const { connectors: { connect, drag } } = useNode();
    return (
        <section
            ref={(ref: HTMLElement | null) => { if (ref) connect(drag(ref)); }}
            className={styles.ctaSection}
            style={{ backgroundImage: `url(/bg.jpeg)` }}
        >
            <div className={styles.ctaOverlay}></div>
            <div className={styles.ctaContent}>
                <Mic size={48} color="var(--amber)" />
                <h2 className={styles.ctaTitle}>{title}</h2>
                <p className={styles.ctaText}>{description}</p>
                <div className={styles.ctaButtons}>
                    <button className="btn btn-primary">{buttonText}</button>
                    <a href={secondaryButtonLink} className="btn btn-secondary">{secondaryButtonText}</a>
                </div>
            </div>
        </section>
    );
};

const SpeakersCTASettings = () => {
    const { actions: { setProp }, title, description, buttonText, secondaryButtonText, secondaryButtonLink } = useNode((node) => ({
        title: node.data.props.title,
        description: node.data.props.description,
        buttonText: node.data.props.buttonText,
        secondaryButtonText: node.data.props.secondaryButtonText,
        secondaryButtonLink: node.data.props.secondaryButtonLink,
    }));
    return (
        <div>
            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={e => setProp((p: SpeakersCTAProps) => p.title = e.target.value)}
                    style={settingsStyles.input}
                />
            </div>
            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Description</label>
                <textarea
                    value={description}
                    onChange={e => setProp((p: SpeakersCTAProps) => p.description = e.target.value)}
                    style={settingsStyles.textarea}
                />
            </div>
            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Button Text</label>
                <input
                    type="text"
                    value={buttonText}
                    onChange={e => setProp((p: SpeakersCTAProps) => p.buttonText = e.target.value)}
                    style={settingsStyles.input}
                />
            </div>
            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Secondary Button Text</label>
                <input
                    type="text"
                    value={secondaryButtonText}
                    onChange={e => setProp((p: SpeakersCTAProps) => p.secondaryButtonText = e.target.value)}
                    style={settingsStyles.input}
                />
            </div>
            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Secondary Button Link</label>
                <input
                    type="text"
                    value={secondaryButtonLink}
                    onChange={e => setProp((p: SpeakersCTAProps) => p.secondaryButtonLink = e.target.value)}
                    style={settingsStyles.input}
                />
            </div>
        </div>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(SpeakersCTA as any).craft = {
    props: {
        title: "Share Your Voice",
        description: "Lectures After Dark is a platform for passionate people to share their ideas with a curious audience. We're always looking for new speakers to join our community. If you have a topic you're passionate about, we'd love to hear from you.",
        buttonText: "Apply to Speak",
        secondaryButtonText: "Learn More",
        secondaryButtonLink: "/about"
    },
    related: { settings: SpeakersCTASettings }
};
