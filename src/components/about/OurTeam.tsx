import styles from './OurTeam.module.css';
import { TeamMemberCard } from '../TeamMemberCard';
import { useTeamMembers } from '../../hooks/useContent';

interface OurTeamProps {
    title?: string;
    subtitle?: string;
}

export const OurTeam = ({
    title = "Our Team",
    subtitle = "Meet the passionate individuals behind Lectures After Dark"
}: OurTeamProps) => {
    const { teamMembers, loading } = useTeamMembers();

    return (
        <section
            className={styles.teamSection}
        >
            <div className="container">
                <div className={styles.teamHeader}>
                    <h2>{title}</h2>
                    {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                </div>
                <div
                    className={styles.teamGrid}
                >
                    {loading ? (
                        <p className={styles.stateMessage}>Loading team members...</p>
                    ) : teamMembers.length > 0 ? (
                        teamMembers.map((teamMember) => (
                            <TeamMemberCard
                                key={teamMember.id}
                                name={teamMember.name}
                                title={teamMember.title ?? undefined}
                                description={teamMember.description ?? undefined}
                                image={teamMember.image ?? undefined}
                                linkUrl={teamMember.linkUrl ?? undefined}
                                linkText={teamMember.linkText ?? undefined}
                            />
                        ))
                    ) : (
                        <p className={styles.stateMessage}>No team members yet. Add them in the Strapi admin.</p>
                    )}
                </div>
            </div>
        </section>
    );
};
