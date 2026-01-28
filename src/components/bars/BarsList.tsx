import { useNode, Element } from '@craftjs/core';
import styles from '../../pages/Venues.module.css';
import { BarCard } from '../BarCard';
import { settingsStyles } from '../settings/settingsStyles';

interface BarsListProps {
    title?: string;
}

export const BarsList = ({
    title = "Partner Bars"
}: BarsListProps) => {
    const { connectors: { connect, drag } } = useNode();
    return (
        <section
            ref={(ref: HTMLElement | null) => { if (ref) connect(drag(ref)); }}
            className={styles.speakersSection}
        >
            <div className="container">
                <h2 className={styles.sectionTitle}>{title}</h2>
                <Element is="div" id="bars-grid" canvas className={styles.speakersGrid}>
                    <BarCard name="The Velvet Lounge" neighborhood="Plateau" imageUrl="https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" />
                    <BarCard name="Library Bar" neighborhood="Downtown" imageUrl="https://images.unsplash.com/photo-1543007630-9710e4a00a20?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" />
                    <BarCard name="Alchemy & Co." neighborhood="Old Port" imageUrl="https://images.unsplash.com/photo-1551024709-8f23befc6f87?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" />
                </Element>
            </div>
        </section>
    );
};

const BarsListSettings = () => {
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
                    onChange={e => setProp((p: BarsListProps) => p.title = e.target.value)}
                    style={settingsStyles.input}
                />
            </div>
        </div>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(BarsList as any).craft = {
    props: { title: "Partner Bars" },
    related: { settings: BarsListSettings }
};
