import { useNode, Element } from '@craftjs/core';
import styles from './OurTeam.module.css';
import { settingsStyles } from '../settings/settingsStyles';

interface OurTeamProps {
    title?: string;
    subtitle?: string;
}

export const OurTeam = ({
    title = "Our Team",
    subtitle = "Meet the passionate individuals behind Lectures After Dark"
}: OurTeamProps) => {
    const { connectors: { connect, drag } } = useNode();

    return (
        <section
            ref={(ref: HTMLElement | null) => { if (ref) connect(drag(ref)); }}
            className={styles.teamSection}
        >
            <div className="container">
                <div className={styles.teamHeader}>
                    <h2>{title}</h2>
                    {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                </div>
                <Element
                    is="div"
                    canvas
                    id="team-cards-container"
                    className={styles.teamGrid}
                >
                    {/* Team member cards will be dropped here in the editor */}
                </Element>
            </div>
        </section>
    );
};

const OurTeamSettings = () => {
    const { actions: { setProp }, title, subtitle } = useNode((node) => ({
        title: node.data.props.title,
        subtitle: node.data.props.subtitle,
    }));

    return (
        <div>
            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Section Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={e => setProp((p: OurTeamProps) => p.title = e.target.value)}
                    style={settingsStyles.input}
                />
            </div>
            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Subtitle</label>
                <textarea
                    value={subtitle}
                    onChange={e => setProp((p: OurTeamProps) => p.subtitle = e.target.value)}
                    style={settingsStyles.textarea}
                />
            </div>
        </div>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(OurTeam as any).craft = {
    props: {
        title: "Our Team",
        subtitle: "Meet the passionate individuals behind Lectures After Dark"
    },
    related: { settings: OurTeamSettings }
};
