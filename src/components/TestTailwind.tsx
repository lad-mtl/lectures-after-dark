import { useNode } from '@craftjs/core';
import Button from './ui/Button';
import SectionTitle from './ui/SectionTitle';
import Paragraph from './ui/Paragraph';

interface TestTailwindProps {
    text?: string;
}

export const TestTailwind = ({ text = "Tailwind Test" }: TestTailwindProps) => {
    const { connectors: { connect, drag } } = useNode();

    return (
        <div
            ref={(ref: HTMLDivElement | null) => {
                if (ref) connect(drag(ref));
            }}
            className="tw-p-8 tw-bg-midnight tw-text-center tw-border-2 tw-border-amber tw-rounded-xl tw-m-4"
        >
            <SectionTitle>Tailwind Integration Check</SectionTitle>

            <Paragraph maxWidth="prose" className="tw-text-cream-dark tw-mb-8 tw-mx-auto">
                {text}
            </Paragraph>

            <div className="tw-flex tw-gap-4 tw-justify-center tw-mb-12">
                <div className="tw-w-16 tw-h-16 tw-bg-amber tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-white tw-font-bold">
                    Amber
                </div>
                <div className="tw-w-16 tw-h-16 tw-bg-cream tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-midnight tw-font-bold">
                    Cream
                </div>
                <div className="tw-w-16 tw-h-16 tw-bg-warm-brown tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-white tw-font-bold">
                    Brown
                </div>
            </div>

            <div className="tw-space-y-8">
                <div className="tw-p-6 tw-border tw-border-white/10 tw-rounded-lg">
                    <h3 className="tw-text-cream tw-text-xl tw-mb-4 tw-font-headline">Buttons</h3>
                    <div className="tw-flex tw-flex-wrap tw-gap-4 tw-justify-center tw-items-center">
                        <Button variant="primary">Primary</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="outline">Outline</Button>
                    </div>
                    <div className="tw-flex tw-flex-wrap tw-gap-4 tw-justify-center tw-items-center tw-mt-4">
                        <Button size="sm">Small</Button>
                        <Button size="md">Medium</Button>
                        <Button size="lg">Large</Button>
                    </div>
                </div>

                <div className="tw-p-6 tw-border tw-border-white/10 tw-rounded-lg tw-text-left">
                    <h3 className="tw-text-cream tw-text-xl tw-mb-4 tw-font-headline tw-text-center">Typography</h3>
                    <SectionTitle className="!tw-mb-4">Section Title Example</SectionTitle>
                    <Paragraph maxWidth="prose" className="tw-mb-4">
                        This is a standard paragraph with prose width. It's designed for optimal reading experience, limiting the characters per line to around 65.
                    </Paragraph>
                    <Paragraph maxWidth="narrow" className="tw-text-cream/80">
                        This is a narrow paragraph, useful for captions or side notes. It has a tighter max-width constraint.
                    </Paragraph>
                </div>
            </div>
        </div>
    );
};

const TestTailwindSettings = () => {
    const { actions: { setProp }, text } = useNode((node) => ({
        text: node.data.props.text
    }));

    return (
        <div>
            <label className="block mb-2">Text Content</label>
            <input
                type="text"
                value={text}
                onChange={(e) => setProp((props: TestTailwindProps) => props.text = e.target.value)}
                className="w-full p-2 border rounded"
            />
        </div>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(TestTailwind as any).craft = {
    props: {
        text: "If you can see this styled correctly, Tailwind is working!"
    },
    related: {
        settings: TestTailwindSettings
    }
};
