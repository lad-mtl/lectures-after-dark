import { useNode } from '@craftjs/core';
import styles from '../../pages/About.module.css';
import { settingsStyles } from '../settings/settingsStyles';

interface AboutHeaderProps {
    title?: string;
    subtitle?: string;
}

export const AboutHeader = ({
    title = "About Us",
    subtitle = "Where curiosity meets conversation in the heart of the city."
}: AboutHeaderProps) => {
    const { connectors: { connect, drag } } = useNode();
    return (
        <header
            ref={(ref: HTMLElement | null) => { if (ref) connect(drag(ref)); }}
            className={styles.header}
        >
            <div className={styles.headerOverlay}></div>
            <div className="container">
                <h1 className={styles.title}>{title}</h1>
                <p className={styles.subtitle}>{subtitle}</p>
            </div>
        </header>
    );
};

const AboutHeaderSettings = () => {
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
                    onChange={e => setProp((p: AboutHeaderProps) => p.title = e.target.value)}
                    style={settingsStyles.input}
                />
            </div>
            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Subtitle</label>
                <input
                    type="text"
                    value={subtitle}
                    onChange={e => setProp((p: AboutHeaderProps) => p.subtitle = e.target.value)}
                    style={settingsStyles.input}
                />
            </div>
        </div>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(AboutHeader as any).craft = {
    props: { title: "About Us", subtitle: "Where curiosity meets conversation in the heart of the city." },
    related: { settings: AboutHeaderSettings }
};
