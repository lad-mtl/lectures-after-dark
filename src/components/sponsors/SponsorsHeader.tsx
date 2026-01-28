import { useNode } from '@craftjs/core';
import { settingsStyles } from '../settings/settingsStyles';

interface SponsorsHeaderProps {
    title?: string;
    subtitle?: string;
}

export const SponsorsHeader = ({
    title = "Partner With Lectures After Dark",
    subtitle = "Reach an audience that thinks, drinks, and engages"
}: SponsorsHeaderProps) => {
    const { connectors: { connect, drag } } = useNode();
    return (
        <header
            ref={(ref: HTMLElement | null) => { if (ref) connect(drag(ref)); }}
            className="text-center py-16 px-8 bg-cover bg-center relative flex flex-col items-center justify-center"
            style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80)',
                padding: 'clamp(2rem, 8vw, 6rem) clamp(1rem, 4vw, 2rem) clamp(1.5rem, 6vw, 4rem)'
            }}
        >
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/30 via-black/50 to-black/70 z-[1]"></div>
            <div className="container mx-auto relative z-[2]">
                <h1 className="text-5xl !text-center text-cream mb-4" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)', fontSize: 'clamp(2.5rem, 8vw, 4rem)', marginBottom: 'clamp(0.75rem, 2vw, 1rem)' }}>{title}</h1>
                <p className="font-serif text-xl !text-center text-cream-dark max-w-2xl !mx-auto" style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)' }}>{subtitle}</p>
            </div>
        </header>
    );
};

const SponsorsHeaderSettings = () => {
    const { actions: { setProp }, title, subtitle } = useNode((node) => ({
        title: node.data.props.title,
        subtitle: node.data.props.subtitle,
    }));
    return (
        <div>
            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={e => setProp((p: SponsorsHeaderProps) => p.title = e.target.value)}
                    style={settingsStyles.input}
                />
            </div>
            <div style={settingsStyles.field}>
                <label style={settingsStyles.label}>Subtitle</label>
                <textarea
                    value={subtitle}
                    onChange={e => setProp((p: SponsorsHeaderProps) => p.subtitle = e.target.value)}
                    style={settingsStyles.textarea}
                />
            </div>
        </div>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(SponsorsHeader as any).craft = {
    props: { title: "Partner With Lectures After Dark", subtitle: "Reach an audience that thinks, drinks, and engages" },
    related: { settings: SponsorsHeaderSettings }
};
