import { useNode } from '@craftjs/core';
import styles from '../../pages/Speakers.module.css';
import { settingsStyles } from '../settings/settingsStyles';

interface SpeakersHeaderProps {
    title?: string;
    subtitle?: string;
}

export const SpeakersHeader = ({
    title = "Our Speakers",
    subtitle = "The minds behind the conversations."
}: SpeakersHeaderProps) => {
    const { connectors: { connect, drag } } = useNode();
    return (
        <header
            ref={(ref: HTMLElement | null) => { if (ref) connect(drag(ref)); }}
            className={styles.header}
        >
            <div className="container">
                <h1 className={styles.title}>{title}</h1>
                <p className={styles.subtitle}>{subtitle}</p>
            </div>
        </header>
    );
};

const SpeakersHeaderSettings = () => {
    const { actions: { setProp }, title, subtitle } = useNode((node) => ({
        title: node.data.props.title,
        subtitle: node.data.props.subtitle,
    }));
    return (
        <div>
            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={e => setProp((p: SpeakersHeaderProps) => p.title = e.target.value)}
                    style={settingsStyles.input}
                />
            </div>
            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Subtitle</label>
                <input
                    type="text"
                    value={subtitle}
                    onChange={e => setProp((p: SpeakersHeaderProps) => p.subtitle = e.target.value)}
                    style={settingsStyles.input}
                />
            </div>
        </div>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(SpeakersHeader as any).craft = {
    props: { title: "Our Speakers", subtitle: "The minds behind the conversations." },
    related: { settings: SpeakersHeaderSettings }
};
