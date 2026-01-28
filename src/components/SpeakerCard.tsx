import { useNode } from '@craftjs/core';
import { Card } from './Card';
import styles from './SpeakerCard.module.css';
import { Twitter, Linkedin, Globe } from 'lucide-react';
import { ImageUploadField } from './ImageUploadField';
import { settingsStyles } from './settings/settingsStyles';

interface SpeakerCardProps {
    name?: string;
    topic?: string;
    bio?: string;
    image?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
}

export const SpeakerCard = ({
    name = "Speaker Name",
    topic = "Topic of Discussion",
    bio = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    image = "/logo.png",
    twitter,
    linkedin,
    website,
}: SpeakerCardProps) => {
    const { connectors: { connect, drag } } = useNode();

    return (
        <div
            ref={(ref: HTMLDivElement | null) => {
                if (ref) {
                    connect(drag(ref));
                }
            }}
        >
            <Card
                variant="image-top"
                image={image}
                imageHeight="200px"
                padding="medium"
                hoverable={true}
            >
                <h3 className={styles.speakerName}>{name}</h3>
                <span className={styles.speakerTopic}>{topic}</span>
                <p className={styles.speakerBio}>{bio}</p>
                <div className={styles.socialLinks}>
                    {twitter && <a href={twitter} target="_blank" rel="noopener noreferrer"><Twitter size={18} /></a>}
                    {linkedin && <a href={linkedin} target="_blank" rel="noopener noreferrer"><Linkedin size={18} /></a>}
                    {website && <a href={website} target="_blank" rel="noopener noreferrer"><Globe size={18} /></a>}
                </div>
            </Card>
        </div>
    );
};

const SpeakerCardSettings = () => {
    const { actions: { setProp }, name, topic, bio, image, twitter, linkedin, website } = useNode((node) => ({
        name: node.data.props.name,
        topic: node.data.props.topic,
        bio: node.data.props.bio,
        image: node.data.props.image,
        twitter: node.data.props.twitter,
        linkedin: node.data.props.linkedin,
        website: node.data.props.website,
    }));

    return (
        <div>
            <ImageUploadField
                label="Image URL"
                value={image || ''}
                onChange={(newUrl) => setProp((props: SpeakerCardProps) => props.image = newUrl)}
            />
            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Name</label>
                <input
                    type="text"
                    value={name || ''}
                    onChange={(e) => setProp((props: SpeakerCardProps) => props.name = e.target.value)}
                    style={settingsStyles.input}
                />
            </div>
            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Topic</label>
                <input
                    type="text"
                    value={topic || ''}
                    onChange={(e) => setProp((props: SpeakerCardProps) => props.topic = e.target.value)}
                    style={settingsStyles.input}
                />
            </div>
            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Bio</label>
                <textarea
                    value={bio || ''}
                    onChange={(e) => setProp((props: SpeakerCardProps) => props.bio = e.target.value)}
                    style={settingsStyles.textarea}
                />
            </div>
            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Twitter URL</label>
                <input
                    type="text"
                    value={twitter || ''}
                    onChange={(e) => setProp((props: SpeakerCardProps) => props.twitter = e.target.value)}
                    style={settingsStyles.input}
                />
            </div>
            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>LinkedIn URL</label>
                <input
                    type="text"
                    value={linkedin || ''}
                    onChange={(e) => setProp((props: SpeakerCardProps) => props.linkedin = e.target.value)}
                    style={settingsStyles.input}
                />
            </div>
            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Website URL</label>
                <input
                    type="text"
                    value={website || ''}
                    onChange={(e) => setProp((props: SpeakerCardProps) => props.website = e.target.value)}
                    style={settingsStyles.input}
                />
            </div>
        </div>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(SpeakerCard as any).craft = {
    props: {
        name: "Speaker Name",
        topic: "Topic of Discussion",
        bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        image: "/logo.png",
        twitter: "",
        linkedin: "",
        website: "",
    },
    related: {
        settings: SpeakerCardSettings
    }
};
