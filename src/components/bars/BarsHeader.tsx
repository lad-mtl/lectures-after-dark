import { useNode } from '@craftjs/core';
import styles from '../../pages/Venues.module.css';
import { settingsStyles } from '../settings/settingsStyles';

interface BarsHeaderProps {
    title?: string;
    subtitle?: string;
}

export const BarsHeader = ({
    title = "Our Bars",
    subtitle = "Great ideas need great atmosphere. We partner with the city's best bars and lounges."
}: BarsHeaderProps) => {
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

const BarsHeaderSettings = () => {
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
                    onChange={e => setProp((p: BarsHeaderProps) => p.title = e.target.value)}
                    style={settingsStyles.input}
                />
            </div>
            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Subtitle</label>
                <input
                    type="text"
                    value={subtitle}
                    onChange={e => setProp((p: BarsHeaderProps) => p.subtitle = e.target.value)}
                    style={settingsStyles.input}
                />
            </div>
        </div>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(BarsHeader as any).craft = {
    props: { title: "Our Bars", subtitle: "Great ideas need great atmosphere. We partner with the city's best bars and lounges." },
    related: { settings: BarsHeaderSettings }
};
