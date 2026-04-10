import { Card } from './Card';
import styles from './TeamMemberCard.module.css';
import { ExternalLink } from 'lucide-react';

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
    return (
        <div>
            <Card
                variant="image-top"
                image={image}
                imageHeight="200px"
                padding="medium"
                hoverable={true}
                showPointerCursor={false}
                liftOnHover={false}
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
