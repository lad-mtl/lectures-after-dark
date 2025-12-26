import Button from '../components/ui/Button';
import SectionTitle from '../components/ui/SectionTitle';
import Paragraph from '../components/ui/Paragraph';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';

export default function TestButtonPage() {
    return (
        <div className="min-h-screen bg-midnight p-8 pt-24 text-cream">

            <SectionTitle className="text-center">Design System Test</SectionTitle>

            <div className="max-w-4xl mx-auto space-y-12">

                {/* Typography */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold border-b border-cream/20 pb-2">Typography</h2>
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm uppercase tracking-wider opacity-70 mb-2">Section Title</h3>
                            <SectionTitle className="!mb-0">The Quick Brown Fox</SectionTitle>
                        </div>
                        <div>
                            <h3 className="text-sm uppercase tracking-wider opacity-70 mb-2">Paragraph (Prose)</h3>
                            <Paragraph maxWidth="prose">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                            </Paragraph>
                        </div>
                        <div>
                            <h3 className="text-sm uppercase tracking-wider opacity-70 mb-2">Paragraph (Narrow)</h3>
                            <Paragraph maxWidth="narrow" className="text-cream/80">
                                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.
                            </Paragraph>
                        </div>
                    </div>
                </section>

                {/* Variants */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold border-b border-cream/20 pb-2">Button Variants</h2>
                    <div className="flex flex-wrap gap-4 items-center">
                        <Button variant="primary">Primary Button</Button>
                        <Button variant="secondary">Secondary Button</Button>
                        <Button variant="outline">Outline Button</Button>
                    </div>
                </section>

                {/* Sizes */}
                <section className="space-y-10">
                    <h2 className="text-2xl font-bold border-b border-cream/20 pb-2">Button Sizes</h2>
                    <div className="flex flex-wrap gap-4 items-end">
                        <Button size="sm">Small</Button>
                        <Button size="md">Medium</Button>
                        <Button size="lg">Large</Button>
                    </div>
                </section>

                {/* States */}
                <section className="space-y-10">
                    <h2 className="text-2xl font-bold border-b border-cream/20 pb-2">Button States</h2>
                    <div className="flex flex-wrap gap-4">
                        <Button disabled>Disabled Primary</Button>
                        <Button variant="secondary" disabled>Disabled Secondary</Button>
                        <Button variant="outline" disabled>Disabled Outline</Button>
                    </div>
                </section>

                {/* Cards */}
                <section className="space-y-10">
                    <h2 className="text-2xl font-bold border-b border-cream/20 pb-2">Cards</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        <Card variant="default">
                            <CardHeader>
                                <CardTitle>Default Card</CardTitle>
                                <CardDescription>
                                    A simple card with subtle border and hover effect.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-cream/70 text-sm">
                                    Perfect for displaying content in a clean, minimal way.
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Button size="sm" variant="outline">Learn More</Button>
                            </CardFooter>
                        </Card>

                        <Card variant="elevated">
                            <CardHeader>
                                <CardTitle>Elevated Card</CardTitle>
                                <CardDescription>
                                    Features a shadow and lift effect on hover.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-cream/70 text-sm">
                                    Great for highlighting important content or featured items.
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Button size="sm" variant="primary">Get Started</Button>
                            </CardFooter>
                        </Card>

                        <Card variant="bordered">
                            <CardHeader>
                                <CardTitle>Bordered Card</CardTitle>
                                <CardDescription>
                                    Bold border that glows gold on hover.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-cream/70 text-sm">
                                    Eye-catching design perfect for call-to-actions.
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Button size="sm" variant="secondary">Explore</Button>
                            </CardFooter>
                        </Card>

                    </div>
                </section>

                {/* Speaker-Style Cards */}
                <section className="space-y-10">
                    <h2 className="text-2xl font-bold border-b border-cream/20 pb-2">Speaker-Style Cards</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        <Card variant="elevated" className="hover:-translate-y-2 hover:border-gold">
                            <div className="w-full h-64 bg-gradient-to-br from-amber via-warm-brown to-midnight overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&h=600&fit=crop"
                                    alt="Bar"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>
                            <div className="p-6">
                                <h3 className="font-headline text-2xl text-cream uppercase tracking-wide mb-2">
                                    Peter Jones
                                </h3>
                                <span className="text-amber font-headline text-sm uppercase tracking-wider block mb-4">
                                    Technology
                                </span>
                                <p className="text-cream-dark leading-relaxed mb-4">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                </p>
                                <div className="flex gap-4 text-cream-dark">
                                    <a href="#" className="hover:text-amber transition-colors">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path></svg>
                                    </a>
                                    <a href="#" className="hover:text-amber transition-colors">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"></path><circle cx="4" cy="4" r="2"></circle></svg>
                                    </a>
                                    <a href="#" className="hover:text-amber transition-colors">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path></svg>
                                    </a>
                                </div>
                            </div>
                        </Card>

                        <Card variant="elevated" className="hover:-translate-y-2 hover:border-gold">
                            <div className="w-full h-64 bg-gradient-to-br from-gold to-warm-brown overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1546412414-e1885259563a?w=800&h=600&fit=crop"
                                    alt="Venue"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>
                            <div className="p-6">
                                <h3 className="font-headline text-2xl text-cream uppercase tracking-wide mb-2">
                                    Sarah Mitchell
                                </h3>
                                <span className="text-amber font-headline text-sm uppercase tracking-wider block mb-4">
                                    Philosophy
                                </span>
                                <p className="text-cream-dark leading-relaxed mb-4">
                                    Exploring the intersection of science and philosophy in the modern age through discourse and debate.
                                </p>
                                <div className="flex gap-4 text-cream-dark">
                                    <a href="#" className="hover:text-amber transition-colors">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path></svg>
                                    </a>
                                    <a href="#" className="hover:text-amber transition-colors">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"></path><circle cx="4" cy="4" r="2"></circle></svg>
                                    </a>
                                    <a href="#" className="hover:text-amber transition-colors">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path></svg>
                                    </a>
                                </div>
                            </div>
                        </Card>

                        <Card variant="elevated" className="hover:-translate-y-2 hover:border-gold">
                            <div className="w-full h-64 bg-gradient-to-br from-warm-brown to-midnight overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&h=600&fit=crop"
                                    alt="Library"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>
                            <div className="p-6">
                                <h3 className="font-headline text-2xl text-cream uppercase tracking-wide mb-2">
                                    David Chen
                                </h3>
                                <span className="text-amber font-headline text-sm uppercase tracking-wider block mb-4">
                                    Economics
                                </span>
                                <p className="text-cream-dark leading-relaxed mb-4">
                                    Analyzing global market trends and their impact on local communities and individual prosperity.
                                </p>
                                <div className="flex gap-4 text-cream-dark">
                                    <a href="#" className="hover:text-amber transition-colors">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path></svg>
                                    </a>
                                    <a href="#" className="hover:text-amber transition-colors">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"></path><circle cx="4" cy="4" r="2"></circle></svg>
                                    </a>
                                    <a href="#" className="hover:text-amber transition-colors">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path></svg>
                                    </a>
                                </div>
                            </div>
                        </Card>

                    </div>
                </section>
            </div>
        </div>
    );
}
