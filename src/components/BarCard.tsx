import { useNode } from '@craftjs/core';
import styles from '../pages/Venues.module.css';
import { MapPin } from 'lucide-react';
import { ImageUploadField } from './ImageUploadField';

interface BarCardProps {
    name?: string;
    neighborhood?: string;
    description?: string;
    imageUrl?: string;
}

export const BarCard = ({
    name = "Bar Name",
    neighborhood = "Neighborhood",
    description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    imageUrl = "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
}: BarCardProps) => {
    const { connectors: { connect, drag } } = useNode();

    return (
        <div
            ref={(ref: HTMLDivElement | null) => {
                if (ref) {
                    connect(drag(ref));
                }
            }}
            className={styles.speakerCard}
        >
            <div className={styles.imageWrapper}>
                <img src={imageUrl} alt={name} className={styles.speakerImage} />
            </div>
            <h3 className={styles.speakerName}>{name}</h3>
            <span className={styles.speakerTopic} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={14} /> {neighborhood}
            </span>
            <p className={styles.speakerBio}>{description}</p>
        </div>
    );
};

const BarCardSettings = () => {
    const { actions: { setProp }, name, neighborhood, description, imageUrl } = useNode((node) => ({
        name: node.data.props.name,
        neighborhood: node.data.props.neighborhood,
        description: node.data.props.description,
        imageUrl: node.data.props.imageUrl,
    }));

    return (
        <div>
            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Name</label>
                <input
                    type="text"
                    value={name || ''}
                    onChange={(e) => setProp((props: BarCardProps) => props.name = e.target.value)}
                    style={{ width: '100%', padding: '5px' }}
                />
            </div>
            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Neighborhood</label>
                <input
                    type="text"
                    value={neighborhood || ''}
                    onChange={(e) => setProp((props: BarCardProps) => props.neighborhood = e.target.value)}
                    style={{ width: '100%', padding: '5px' }}
                />
            </div>
            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Description</label>
                <textarea
                    value={description || ''}
                    onChange={(e) => setProp((props: BarCardProps) => props.description = e.target.value)}
                    style={{ width: '100%', padding: '5px', minHeight: '100px' }}
                />
            </div>
            <ImageUploadField
                label="Image URL"
                value={imageUrl || ''}
                onChange={(newUrl) => setProp((props: BarCardProps) => props.imageUrl = newUrl)}
            />
        </div>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(BarCard as any).craft = {
    props: {
        name: "Bar Name",
        neighborhood: "Neighborhood",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        imageUrl: "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    related: {
        settings: BarCardSettings
    }
};
