import { useNode, Element } from '@craftjs/core';
import styles from '../../pages/Speakers.module.css';
import { SpeakerCard } from '../SpeakerCard';
import { settingsStyles } from '../settings/settingsStyles';

interface SpeakersListProps {
    title?: string;
}

export const SpeakersList = ({
    title = "Past & Future Speakers"
}: SpeakersListProps) => {
    const { connectors: { connect, drag } } = useNode();
    return (
        <section
            ref={(ref: HTMLElement | null) => { if (ref) connect(drag(ref)); }}
            className={styles.speakersSection}
        >
            <div className="container">
                <h2 className={styles.sectionTitle}>{title}</h2>
                <Element is="div" id="speakers-grid" canvas className={styles.speakersGrid}>
                    <SpeakerCard name="John Doe" topic="React" image="https://images.unsplash.com/photo-1599566150163-29194d6f4675?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" twitter="https://twitter.com/johndoe" linkedin="https://linkedin.com/in/johndoe" website="https://johndoe.com" />
                    <SpeakerCard name="Jane Doe" topic="Vue" image="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" twitter="https://twitter.com/janedoe" linkedin="https://linkedin.com/in/janedoe" website="https://janedoe.com" />
                    <SpeakerCard name="Peter Jones" topic="Angular" image="https://images.unsplash.com/photo-1597290282695-edc43d0e7129?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YmFyfGVufDB8fDB8fHww" twitter="https://twitter.com/peterjones" linkedin="https://linkedin.com/in/peterjones" website="https://peterjones.com" />
                </Element>
            </div>
        </section>
    );
};

const SpeakersListSettings = () => {
    const { actions: { setProp }, title } = useNode((node) => ({
        title: node.data.props.title,
    }));
    return (
        <div>
            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={e => setProp((p: SpeakersListProps) => p.title = e.target.value)}
                    style={settingsStyles.input}
                />
            </div>
        </div>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(SpeakersList as any).craft = {
    props: { title: "Past & Future Speakers" },
    related: { settings: SpeakersListSettings }
};
