import { Card } from './Card';
import styles from './SpeakerCard.module.css';
import { Twitter, Linkedin, Globe } from 'lucide-react';

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
    return (
        <div>
            <Card
                variant="image-top"
                image={image}
                imageHeight="200px"
                padding="medium"
                hoverable={false}
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
