import { useState } from 'react';
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
                        {items.map((item, index) => item && (
                            <div key={index} className={styles.item} data-open={openIndex === index}>
                                <button className={styles.question} onClick={() => toggle(index)}>
                                    <span className={styles.questionText}>{item.question}</span>
                                    <span className={styles.icon}><Plus size={20} /></span>
                                </button>
                                <div className={styles.answer}>
                                    <div className={styles.answerContent}>
                                        {item.answer?.split('\n\n').map((paragraph, i) => (
                                            <p key={i} style={i < (item.answer?.split('\n\n').length ?? 1) - 1 ? { marginBottom: '1rem' } : undefined}>
                                                {paragraph}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default FAQ;
