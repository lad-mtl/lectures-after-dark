import styles from '../../pages/Speakers.module.css';
import { SpeakerCard } from '../SpeakerCard';
import { useSpeakers } from '../../hooks/useContent';

interface SpeakersListProps {
    title?: string;
}

export const SpeakersList = ({
    title = "Past & Future Speakers"
}: SpeakersListProps) => {
    const { speakers, loading } = useSpeakers();

    return (
        <section
            className={styles.speakersSection}
        >
            <div className="container">
                <h2 className={styles.sectionTitle}>{title}</h2>
                {loading ? (
                    <p style={{ textAlign: 'center', opacity: 0.6 }}>Loading speakers...</p>
                ) : speakers.length > 0 ? (
                    <div className={styles.speakersGrid}>
                        {speakers.map((speaker) => (
                            <SpeakerCard
                                key={speaker.id}
                                name={speaker.name}
                                topic={speaker.topic ?? undefined}
                                bio={speaker.bio ?? undefined}
                                image={speaker.image ?? undefined}
                                twitter={speaker.twitter ?? undefined}
                                linkedin={speaker.linkedin ?? undefined}
                                website={speaker.website ?? undefined}
                            />
                        ))}
                    </div>
                ) : (
                    <p style={{ textAlign: 'center', opacity: 0.6 }}>No speakers yet. Add speakers in the Strapi admin.</p>
                )}
            </div>
        </section>
    );
};
