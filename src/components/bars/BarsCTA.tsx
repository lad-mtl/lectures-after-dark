import { useNode } from '@craftjs/core';
import styles from '../../pages/Venues.module.css';
import { settingsStyles } from '../settings/settingsStyles';

interface BarsCTAProps {
    title?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
}

export const BarsCTA = ({
    title = "Bring the conversation to your bar.",
    description = "Transform your venue into a hub of intellectual exchange. Host a Lectures After Dark event.",
    buttonText = "Partner With Us",
    buttonLink = "/"
}: BarsCTAProps) => {
    const { connectors: { connect, drag } } = useNode();
    return (
        <section
            ref={(ref: HTMLElement | null) => { if (ref) connect(drag(ref)); }}
            className={styles.ctaSection}
        >
            <div className={styles.ctaOverlay}></div>
            <div className={styles.ctaContent}>
                <h2 className={styles.ctaTitle}>{title}</h2>
                <p className={styles.ctaText}>{description}</p>
                <a target='_blank' href={buttonLink} className="btn btn-primary">{buttonLink}</a>
            </div>
        </section>
    );
};

const BarsCTASettings = () => {
    const { actions: { setProp }, title, description, buttonText, buttonLink } = useNode((node) => ({
        title: node.data.props.title,
        description: node.data.props.description,
        buttonText: node.data.props.buttonText,
        buttonLink: node.data.props.buttonLink,
    }));
    return (
        <div>
            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={e => setProp((p: BarsCTAProps) => p.title = e.target.value)}
                    style={settingsStyles.input}
                />
            </div>
            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Description</label>
                <input
                    type="text"
                    value={description}
                    onChange={e => setProp((p: BarsCTAProps) => p.description = e.target.value)}
                    style={settingsStyles.input}
                />
            </div>
            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Button Text</label>
                <input
                    type="text"
                    value={buttonText}
                    onChange={e => setProp((p: BarsCTAProps) => p.buttonText = e.target.value)}
                    style={settingsStyles.input}
                />
            </div>
            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Button Link</label>
                <input
                    type="text"
                    value={buttonLink}
                    onChange={e => setProp((p: BarsCTAProps) => p.buttonLink = e.target.value)}
                    style={settingsStyles.input}
                />
            </div>
        </div>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(BarsCTA as any).craft = {
    props: {
        title: "Bring the conversation to your bar.",
        description: "Transform your venue into a hub of intellectual exchange. Host a Lectures After Dark event.",
        buttonText: "Partner With Us"
    },
    related: { settings: BarsCTASettings }
};
