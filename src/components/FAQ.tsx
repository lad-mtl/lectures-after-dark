import React, { useState } from 'react';
import { useNode } from '@craftjs/core';
import styles from './FAQ.module.css';
import { Plus } from 'lucide-react';

const defaultFaqs = [
    {
        question: "What happens at an Event?",
        answer: (
            <>
                <p style={{ marginBottom: '1rem' }}>You show up, grab a seat, and settle in.</p>
                <p>We start with a short talk (no classroom vibes), then Q&A, then the best part: conversations after with the people around you</p>
            </>
        )
    },
    {
        question: "How long is the whole night?",
        answer: (
            <>
                <p style={{ marginBottom: '1rem' }}>Usually about 1.5–2 hours.</p>
                <p>Long enough to feel like a real experience. Short enough to still have a life after.</p>
            </>
        )
    },
    {
        question: "Where do events take place?",
        answer: (
            <>
                <p style={{ marginBottom: '1rem' }}>At partner venues across Montréal.</p>
                <p>Each event page has the exact location + details, so you’re never guessing.</p>
            </>
        )
    },
    {
        question: "How do I buy tickets?",
        answer: (
            <>
                <p style={{ marginBottom: '1rem' }}>Go to the event page, choose your ticket, and you’re in.</p>
                <p>You’ll get a confirmation email right after purchase.</p>
            </>
        )
    },
    {
        question: "Do I need a ticket to attend?",
        answer: (
            <>
                <p style={{ marginBottom: '1rem' }}>Yes — seating is limited and we keep it intimate on purpose.</p>
                <p>If you want a guaranteed spot, grab a ticket.</p>
            </>
        )
    },
    {
        question: "What if tickets are sold out?",
        answer: (
            <>
                <p style={{ marginBottom: '1rem' }}>It happens (we love you for it).</p>
                <p>Join the waitlist if it’s available, and/or hop on our email list so you get first access to the next drops.</p>
            </>
        )
    },
    {
        question: "What if I don’t drink?",
        answer: (
            <>
                <p style={{ marginBottom: '1rem' }}>Perfect. You’re still our people.</p>
                <p>Most venues have great non-alcoholic options, and the point is the ideas + vibe — not what’s in your cup.</p>
            </>
        )
    },
    {
        question: "I want to speak at Lectures After Dark — how do I apply?",
        answer: "We love discovering great speakers. Send us your topic idea, a short bio, and any links (talk clip, writing, or socials). If it fits our vibe, we’ll reach out with next steps."
    },
    {
        question: "How do you choose speakers/topics?",
        answer: "We look for speakers who can explain something meaningful in a way that’s clear, engaging, and actually fun to listen to — psychology, ambition, culture, society, and everything in between."
    }
];

interface FAQProps {
    title?: string;
}

export const FAQ = ({
    title = "Frequently Asked Questions"
}: FAQProps) => {
    const { connectors: { connect, drag } } = useNode();
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section
            ref={(ref: HTMLElement | null) => {
                if (ref) {
                    connect(drag(ref));
                }
            }}
            id="faq"
            className={styles.section}
        >
            <div className={styles.container}>
                <h2 className={styles.title}>{title}</h2>

                <div className={styles.list}>
                    {defaultFaqs.map((faq, index) => (
                        <div key={index} className={styles.item} data-open={openIndex === index}>
                            <button className={styles.question} onClick={() => toggle(index)}>
                                <span className={styles.questionText}>{faq.question}</span>
                                <span className={styles.icon}><Plus size={20} /></span>
                            </button>
                            <div className={styles.answer}>
                                <div className={styles.answerContent}>
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const FAQSettings = () => {
    const { actions: { setProp }, title } = useNode((node) => ({
        title: node.data.props.title,
    }));

    return (
        <div>
            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Title</label>
                <input
                    type="text"
                    value={title || ''}
                    onChange={(e) => setProp((props: FAQProps) => props.title = e.target.value)}
                    style={{ width: '100%', padding: '5px' }}
                />
            </div>
        </div>
    );
};

(FAQ as any).craft = {
    props: {
        title: "Frequently Asked Questions"
    },
    related: {
        settings: FAQSettings
    }
};

export default FAQ;
