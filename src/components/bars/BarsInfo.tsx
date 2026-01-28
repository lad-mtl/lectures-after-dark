import { useNode } from '@craftjs/core';
import styles from '../../pages/Venues.module.css';
import { settingsStyles } from '../settings/settingsStyles';

interface BarsInfoProps {
    title?: string;
    text1?: string;
    text2?: string;
    imageUrl?: string;
}

export const BarsInfo = ({
    title = "Information for Hosts",
    text1 = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    text2 = "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    imageUrl = "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
}: BarsInfoProps) => {
    const { connectors: { connect, drag } } = useNode();
    return (
        <section
            ref={(ref: HTMLElement | null) => { if (ref) connect(drag(ref)); }}
            className={styles.infoSection}
        >
            <div className="container">
                <div className={styles.infoContent}>
                    <div className={styles.infoText}>
                        <h2>{title}</h2>
                        <p>{text1}</p>
                        <p>{text2}</p>
                    </div>
                    <div className={styles.infoImage}>
                        <img
                            src={imageUrl}
                            alt="Bar interior"
                            style={{ width: '100%', borderRadius: '4px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

const BarsInfoSettings = () => {
    const { actions: { setProp }, title, text1, text2, imageUrl } = useNode((node) => ({
        title: node.data.props.title,
        text1: node.data.props.text1,
        text2: node.data.props.text2,
        imageUrl: node.data.props.imageUrl,
    }));
    return (
        <div>
            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={e => setProp((p: BarsInfoProps) => p.title = e.target.value)}
                    style={settingsStyles.input}
                />
            </div>
            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Text 1</label>
                <textarea
                    value={text1}
                    onChange={e => setProp((p: BarsInfoProps) => p.text1 = e.target.value)}
                    style={settingsStyles.textarea}
                />
            </div>
            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Text 2</label>
                <textarea
                    value={text2}
                    onChange={e => setProp((p: BarsInfoProps) => p.text2 = e.target.value)}
                    style={settingsStyles.textarea}
                />
            </div>
            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Image URL</label>
                <input
                    type="text"
                    value={imageUrl}
                    onChange={e => setProp((p: BarsInfoProps) => p.imageUrl = e.target.value)}
                    style={settingsStyles.input}
                />
            </div>
        </div>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(BarsInfo as any).craft = {
    props: {
        title: "Information for Hosts",
        text1: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
        text2: "Duis aute irure dolor in reprehenderit...",
        imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
    },
    related: { settings: BarsInfoSettings }
};
