import { useNode } from '@craftjs/core';
import { Card } from './Card';
import styles from './TeamMemberCard.module.css';
import { ExternalLink } from 'lucide-react';
import { ImageUploadField } from './ImageUploadField';
import { settingsStyles } from './settings/settingsStyles';

interface TeamMemberCardProps {
    name?: string;
    title?: string;
    description?: string;
    image?: string;
    linkUrl?: string;
    linkText?: string;
}

export const TeamMemberCard = ({
    name = "Team Member Name",
    title = "Position Title",
    description = "A brief description about this team member and their role in the organization.",
    image = "/logo.png",
    linkUrl,
    linkText = "Learn More",
}: TeamMemberCardProps) => {
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
                <h3 className={styles.memberName}>{name}</h3>
                <span className={styles.memberTitle}>{title}</span>
                <p className={styles.memberDescription}>{description}</p>
                {linkUrl && (
                    <div className={styles.linkContainer}>
                        <a 
                            href={linkUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={styles.memberLink}
                        >
                            {linkText}
                            <ExternalLink size={16} />
                        </a>
                    </div>
                )}
            </Card>
        </div>
    );
};

const TeamMemberCardSettings = () => {
    const { actions: { setProp }, name, title, description, image, linkUrl, linkText } = useNode((node) => ({
        name: node.data.props.name,
        title: node.data.props.title,
        description: node.data.props.description,
        image: node.data.props.image,
        linkUrl: node.data.props.linkUrl,
        linkText: node.data.props.linkText,
    }));

    return (
        <div>
            <ImageUploadField
                label="Image URL"
                value={image || ''}
                onChange={(newUrl) => setProp((props: TeamMemberCardProps) => props.image = newUrl)}
            />
            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Name</label>
                <input
                    type="text"
                    value={name || ''}
                    onChange={(e) => setProp((props: TeamMemberCardProps) => props.name = e.target.value)}
                    style={settingsStyles.input}
                />
            </div>
            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Title</label>
                <input
                    type="text"
                    value={title || ''}
                    onChange={(e) => setProp((props: TeamMemberCardProps) => props.title = e.target.value)}
                    style={settingsStyles.input}
                />
            </div>
            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Description</label>
                <textarea
                    value={description || ''}
                    onChange={(e) => setProp((props: TeamMemberCardProps) => props.description = e.target.value)}
                    style={settingsStyles.textarea}
                />
            </div>
            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Link URL</label>
                <input
                    type="text"
                    value={linkUrl || ''}
                    onChange={(e) => setProp((props: TeamMemberCardProps) => props.linkUrl = e.target.value)}
                    style={settingsStyles.input}
                    placeholder="https://..."
                />
            </div>
            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Link Text</label>
                <input
                    type="text"
                    value={linkText || ''}
                    onChange={(e) => setProp((props: TeamMemberCardProps) => props.linkText = e.target.value)}
                    style={settingsStyles.input}
                />
            </div>
        </div>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(TeamMemberCard as any).craft = {
    props: {
        name: "Team Member Name",
        title: "Position Title",
        description: "A brief description about this team member and their role in the organization.",
        image: "/logo.png",
        linkUrl: "",
        linkText: "Learn More",
    },
    related: {
        settings: TeamMemberCardSettings
    }
};
