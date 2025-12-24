import { useNode } from '@craftjs/core';
import styles from './WhyWeDoIt.module.css';

interface WhyWeDoItProps {
    kicker?: string;
    title?: string;
    paragraph1?: string;
    paragraph2?: string;
    paragraph3?: string;
}

export const WhyWeDoIt = ({
    kicker = "Why We Do It",
    title = "Make learning a night out.",
    paragraph1 = "A lot of us miss that campus vibe — hearing a great idea, debating it after, and leaving with something that sticks. Lectures After Dark brings that back, just in a bar: relaxed, social, and actually fun.",
    paragraph2 = "It’s for people who want to keep learning without going back to school. For anyone who loves real conversation more than just another drink.",
    paragraph3 = "And honestly? It’s a break from endless scrolling and fake “facts.” Real ideas, real speakers, real people — all in one room, and it’s a vibe."
}: WhyWeDoItProps) => {
    const { connectors: { connect, drag } } = useNode();

    return (
        <section
            ref={(ref: HTMLElement | null) => {
                if (ref) {
                    connect(drag(ref));
                }
            }}
            className={styles.section}
        >
            <div className="container">
                <div className={styles.content}>
                    <span className={styles.kicker}>{kicker}</span>
                    <h2 className={styles.title}>{title}</h2>
                    <div className={styles.bodyText}>
                        <p>{paragraph1}</p>
                        <p>{paragraph2}</p>
                        <p>{paragraph3}</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

const WhyWeDoItSettings = () => {
    const { actions: { setProp }, kicker, title, paragraph1, paragraph2, paragraph3 } = useNode((node) => ({
        kicker: node.data.props.kicker,
        title: node.data.props.title,
        paragraph1: node.data.props.paragraph1,
        paragraph2: node.data.props.paragraph2,
        paragraph3: node.data.props.paragraph3,
    }));

    return (
        <div>
            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Kicker</label>
                <input
                    type="text"
                    value={kicker || ''}
                    onChange={(e) => setProp((props: WhyWeDoItProps) => props.kicker = e.target.value)}
                    style={{ width: '100%', padding: '5px' }}
                />
            </div>
            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Title</label>
                <input
                    type="text"
                    value={title || ''}
                    onChange={(e) => setProp((props: WhyWeDoItProps) => props.title = e.target.value)}
                    style={{ width: '100%', padding: '5px' }}
                />
            </div>
            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Paragraph 1</label>
                <textarea
                    value={paragraph1 || ''}
                    onChange={(e) => setProp((props: WhyWeDoItProps) => props.paragraph1 = e.target.value)}
                    style={{ width: '100%', padding: '5px', minHeight: '80px' }}
                />
            </div>
            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Paragraph 2</label>
                <textarea
                    value={paragraph2 || ''}
                    onChange={(e) => setProp((props: WhyWeDoItProps) => props.paragraph2 = e.target.value)}
                    style={{ width: '100%', padding: '5px', minHeight: '80px' }}
                />
            </div>
            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Paragraph 3</label>
                <textarea
                    value={paragraph3 || ''}
                    onChange={(e) => setProp((props: WhyWeDoItProps) => props.paragraph3 = e.target.value)}
                    style={{ width: '100%', padding: '5px', minHeight: '80px' }}
                />
            </div>
        </div>
    );
};

(WhyWeDoIt as any).craft = {
    props: {
        kicker: "Why We Do It",
        title: "Make learning a night out.",
        paragraph1: "A lot of us miss that campus vibe — hearing a great idea, debating it after, and leaving with something that sticks. Lectures After Dark brings that back, just in a bar: relaxed, social, and actually fun.",
        paragraph2: "It’s for people who want to keep learning without going back to school. For anyone who loves real conversation more than just another drink.",
        paragraph3: "And honestly? It’s a break from endless scrolling and fake “facts.” Real ideas, real speakers, real people — all in one room, and it’s a vibe."
    },
    related: {
        settings: WhyWeDoItSettings
    }
};

export default WhyWeDoIt;
