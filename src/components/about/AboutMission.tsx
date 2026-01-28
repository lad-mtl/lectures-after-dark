import { useNode } from '@craftjs/core';
import styles from '../../pages/About.module.css';
import { settingsStyles } from '../settings/settingsStyles';

interface AboutMissionProps {
    title?: string;
    missionStatement?: string;
    imageUrl?: string;
}

export const AboutMission = ({
    title = "Our Mission",
    missionStatement = "Our mission is to bring people together to share ideas and stories in a relaxed and inspiring environment. We believe that a good conversation can change the world.",
    imageUrl = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80"
}: AboutMissionProps) => {
    const { connectors: { connect, drag } } = useNode();
    return (
        <section
            ref={(ref: HTMLElement | null) => { if (ref) connect(drag(ref)); }}
            className={styles.missionSection}
        >
            <div className="container">
                <div className={styles.missionContent}>
                    <div className={styles.missionText}>
                        <h2>{title}</h2>
                        <p>{missionStatement}</p>
                    </div>
                    <div className={styles.missionImage}>
                        <img src={imageUrl} alt="Our team" />
                    </div>
                </div>
            </div>
        </section>
    );
};

const AboutMissionSettings = () => {
    const { actions: { setProp }, title, missionStatement, imageUrl } = useNode((node) => ({
        title: node.data.props.title,
        missionStatement: node.data.props.missionStatement,
        imageUrl: node.data.props.imageUrl,
    }));
    return (
        <div>
            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={e => setProp((p: AboutMissionProps) => p.title = e.target.value)}
                    style={settingsStyles.input}
                />
            </div>
            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Mission Statement</label>
                <textarea
                    value={missionStatement}
                    onChange={e => setProp((p: AboutMissionProps) => p.missionStatement = e.target.value)}
                    style={settingsStyles.textarea}
                />
            </div>
            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Image URL</label>
                <input
                    type="text"
                    value={imageUrl}
                    onChange={e => setProp((p: AboutMissionProps) => p.imageUrl = e.target.value)}
                    style={settingsStyles.input}
                />
            </div>
        </div>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(AboutMission as any).craft = {
    props: {
        title: "Our Mission",
        missionStatement: "Our mission is to bring people together to share ideas and stories in a relaxed and inspiring environment. We believe that a good conversation can change the world.",
        imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80"
    },
    related: { settings: AboutMissionSettings }
};
