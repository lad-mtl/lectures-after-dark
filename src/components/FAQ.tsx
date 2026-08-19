import { useId, useState } from 'react';
import styles from './FAQ.module.css';
import { Plus } from 'lucide-react';
import { useFaq } from '../hooks/useContent';

interface FAQProps {
    title?: string;
}

export const FAQ = ({
    title = "Frequently Asked Questions"
}: FAQProps) => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const accordionId = useId();
    const { faq, loading } = useFaq();

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const items = faq?.items ?? [];

    return (
        <section
            id="faq"
            className={styles.section}
        >
            <div className={styles.container}>
                <h2 className={styles.title}>{title}</h2>

                {loading ? (
                    <p style={{ textAlign: 'center', opacity: 0.6 }}>Loading FAQ...</p>
                ) : (
                    <div className={styles.list}>
                        {items.map((item, index) => {
                            if (!item) return null;

                            const isOpen = openIndex === index;
                            const questionId = `${accordionId}-question-${index}`;
                            const answerId = `${accordionId}-answer-${index}`;
                            const paragraphs = item.answer?.split('\n\n') ?? [];

                            return (
                                <div key={questionId} className={styles.item} data-open={isOpen}>
                                    <button
                                        id={questionId}
                                        type="button"
                                        className={styles.question}
                                        aria-expanded={isOpen}
                                        aria-controls={answerId}
                                        onClick={() => toggle(index)}
                                    >
                                        <span className={styles.questionText}>{item.question}</span>
                                        <span className={styles.icon} aria-hidden="true">
                                            <Plus size={20} />
                                        </span>
                                    </button>
                                    <div
                                        id={answerId}
                                        className={styles.answer}
                                        role="region"
                                        aria-labelledby={questionId}
                                        hidden={!isOpen}
                                    >
                                        <div className={styles.answerContent}>
                                            {paragraphs.map((paragraph, paragraphIndex) => (
                                                <p
                                                    key={paragraphIndex}
                                                    style={paragraphIndex < paragraphs.length - 1 ? { marginBottom: '1rem' } : undefined}
                                                >
                                                    {paragraph}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
};

export default FAQ;
