import { EventCard } from '../components/EventCard';
import { UpcomingEventsRedesign } from '../components/UpcomingEventsRedesign';
import SectionTitle from '../components/ui/SectionTitle';

export default function TestCardPage() {
    return (
        <div className="min-h-screen pt-24">
            {/* New Redesigned Section */}
            <UpcomingEventsRedesign />

            {/* Original Cards */}
            <div className="bg-midnight p-8 text-cream">
                <SectionTitle className="text-center">Original Card Design</SectionTitle>

                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <EventCard
                        category="Psychology"
                        title="The Psychology of Ambition: Why Some People Win and Most Don't"
                        date="Jan 22, 2025"
                        location="Montreal"
                        image="https://images.unsplash.com/photo-1528720208104-3d9bd03cc9d4?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        price="$29.99"
                    />
                    <EventCard
                        category="Culture"
                        title="Modern Dating is Negotiating"
                        date="Jan 29, 2025"
                        location="Montreal"
                        image="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                        price="$25.00"
                    />
                    <EventCard
                        category="Philosophy"
                        title="Stoicism in the Digital Age"
                        date="Feb 12, 2025"
                        location="Montreal"
                        image="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                        price="$35.00"
                    />
                </div>
            </div>
        </div>
    );
}
