import Button from '../components/ui/Button';

export default function TestButtonPage() {
    return (
        <div className="tw-min-h-screen tw-bg-midnight tw-p-8 tw-pt-24 tw-text-cream">
            <h1 className="tw-text-4xl tw-font-headline tw-mb-8 tw-text-center">Button System Test</h1>

            <div className="tw-max-w-4xl tw-mx-auto tw-space-y-12">

                {/* Variants */}
                <section className="tw-space-y-4">
                    <h2 className="tw-text-2xl tw-font-bold tw-border-b tw-border-cream/20 tw-pb-2">Variants</h2>
                    <div className="tw-flex tw-flex-wrap tw-gap-4 tw-items-center">
                        <Button variant="primary">Primary Button</Button>
                        <Button variant="secondary">Secondary Button</Button>
                        <Button variant="outline">Outline Button</Button>
                    </div>
                </section>

                {/* Sizes */}
                <section className="tw-space-y-4">
                    <h2 className="tw-text-2xl tw-font-bold tw-border-b tw-border-cream/20 tw-pb-2">Sizes</h2>
                    <div className="tw-flex tw-flex-wrap tw-gap-4 tw-items-end">
                        <Button size="sm">Small</Button>
                        <Button size="md">Medium</Button>
                        <Button size="lg">Large</Button>
                    </div>
                </section>

                {/* States */}
                <section className="tw-space-y-4">
                    <h2 className="tw-text-2xl tw-font-bold tw-border-b tw-border-cream/20 tw-pb-2">States</h2>
                    <div className="tw-flex tw-flex-wrap tw-gap-4">
                        <Button disabled>Disabled Primary</Button>
                        <Button variant="secondary" disabled>Disabled Secondary</Button>
                        <Button variant="outline" disabled>Disabled Outline</Button>
                    </div>
                </section>

                {/* Combinations */}
                <section className="tw-space-y-4">
                    <h2 className="tw-text-2xl tw-font-bold tw-border-b tw-border-cream/20 tw-pb-2">Combinations</h2>
                    <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-6">
                        <div className="tw-space-y-2">
                            <h3 className="tw-text-sm tw-uppercase tw-tracking-wider tw-opacity-70">Small</h3>
                            <div className="tw-flex tw-flex-col tw-gap-2 tw-items-start">
                                <Button size="sm" variant="primary">Primary</Button>
                                <Button size="sm" variant="secondary">Secondary</Button>
                                <Button size="sm" variant="outline">Outline</Button>
                            </div>
                        </div>
                        <div className="tw-space-y-2">
                            <h3 className="tw-text-sm tw-uppercase tw-tracking-wider tw-opacity-70">Medium</h3>
                            <div className="tw-flex tw-flex-col tw-gap-2 tw-items-start">
                                <Button size="md" variant="primary">Primary</Button>
                                <Button size="md" variant="secondary">Secondary</Button>
                                <Button size="md" variant="outline">Outline</Button>
                            </div>
                        </div>
                        <div className="tw-space-y-2">
                            <h3 className="tw-text-sm tw-uppercase tw-tracking-wider tw-opacity-70">Large</h3>
                            <div className="tw-flex tw-flex-col tw-gap-2 tw-items-start">
                                <Button size="lg" variant="primary">Primary</Button>
                                <Button size="lg" variant="secondary">Secondary</Button>
                                <Button size="lg" variant="outline">Outline</Button>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}
