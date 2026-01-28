import { useNode } from '@craftjs/core';
import styles from '../../pages/About.module.css';
import { settingsStyles } from '../settings/settingsStyles';

interface OurVisionProps {
    title?: string;
    visionStatement?: string;
    imageUrl?: string;
}

export const OurVision = ({
    title = "Our Vision",
    visionStatement = "We envision a world where everyone has a stage to share their passion and a community to share it with. We want to be the spark that ignites a global movement of curiosity and conversation.",
    imageUrl = "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
}: OurVisionProps) => {
    const { connectors: { connect, drag } } = useNode();
    return (
        <section
            ref={(ref: HTMLElement | null) => { if (ref) connect(drag(ref)); }}
            className={styles.visionSection}
        >
            <div className="container">
                <div className={styles.visionContent}>
                    <div className={styles.visionImage}>
                        <img src={imageUrl} alt="Our vision" />
                    </div>
                    <div className={styles.visionText}>
                        <h2>{title}</h2>
                        <p>{visionStatement}</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

const OurVisionSettings = () => {
    const { actions: { setProp }, title, visionStatement, imageUrl } = useNode((node) => ({
        title: node.data.props.title,
        visionStatement: node.data.props.visionStatement,
        imageUrl: node.data.props.imageUrl,
    }));
    return (
        <div>
            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={e => setProp((p: OurVisionProps) => p.title = e.target.value)}
                    style={settingsStyles.input}
                />
            </div>
            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Vision Statement</label>
                <textarea
                    value={visionStatement}
                    onChange={e => setProp((p: OurVisionProps) => p.visionStatement = e.target.value)}
                    style={settingsStyles.textarea}
                />
            </div>
            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Image URL</label>
                <input
                    type="text"
                    value={imageUrl}
                    onChange={e => setProp((p: OurVisionProps) => p.imageUrl = e.target.value)}
                    style={settingsStyles.input}
                />
            </div>
        </div>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(OurVision as any).craft = {
    props: {
        title: "Our Vision",
        visionStatement: "We envision a world where everyone has a stage to share their passion and a community to share it with. We want to be the spark that ignites a global movement of curiosity and conversation.",
        imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
    },
    related: { settings: OurVisionSettings }
};
