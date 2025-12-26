import { useNode } from '@craftjs/core';

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
            className="tw:p-8 tw:bg-midnight tw:text-center tw:border-2 tw:border-amber tw:rounded-xl tw:m-4"
        >
            <h2 className="tw:text-section-title tw:text-cream tw:font-headline tw:mb-4">
                Tailwind Integration Check
            </h2>
            <p className="tw:text-xl tw:text-cream-dark tw:font-body">
                {text}
            </p>
            <div className="tw:flex tw:gap-4 tw:justify-center tw:mt-6">
                <div className="tw:w-16 tw:h-16 tw:bg-amber tw:rounded-full tw:flex tw:items-center tw:justify-center tw:text-white tw:font-bold">
                    Amber
                </div>
                <div className="tw:w-16 tw:h-16 tw:bg-cream tw:rounded-full tw:flex tw:items-center tw:justify-center tw:text-midnight tw:font-bold">
                    Cream
                </div>
                <div className="tw:w-16 tw:h-16 tw:bg-warm-brown tw:rounded-full tw:flex tw:items-center tw:justify-center tw:text-white tw:font-bold">
                    Brown
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
            <label className="tw:block tw:mb-2">Text Content</label>
            <input
                type="text"
                value={text}
                onChange={(e) => setProp((props: TestTailwindProps) => props.text = e.target.value)}
                className="tw:w-full tw:p-2 tw:border tw:rounded"
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
