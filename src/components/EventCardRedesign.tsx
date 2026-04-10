interface EventCardRedesignProps {
    title?: string;
    day?: string;
    month?: string;
    timeLabel?: string;
    locationLabel?: string;
    priceLabel?: string;
    imageUrl?: string | null;
    eventbriteUrl?: string;
}

export const EventCardRedesign = ({
    title = "The Psychology of Ambition: Why Some People Win and Most Don't",
    day = "22",
    month = "JAN",
    timeLabel = "7:00 PM",
    locationLabel = "Montreal",
    priceLabel = "$29.99",
    imageUrl = '/the_psychology_of_ambition.webp',
    eventbriteUrl = 'https://www.eventbrite.com'
}: EventCardRedesignProps) => {
    const backgroundImage = imageUrl || '/banner.png';

    const cardContent = (
        <div
            className="relative w-full h-full rounded-2xl overflow-hidden group cursor-pointer bg-black bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >

            {/* Dark gradient overlay at bottom for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 via-50% to-transparent pointer-events-none"></div>

            {/* Date Badge at Top Center */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2">
                <div className="backdrop-blur-md bg-black/40 border border-white/20 rounded-xl px-5 py-2.5 text-center">
                    <div className="text-white/90 text-[10px] font-medium tracking-[0.15em] uppercase">
                        {month}
                    </div>
                    <div className="text-white text-2xl font-semibold leading-none mt-0.5">
                        {day}
                    </div>
                </div>
            </div>

            {/* Bottom Content - Absolutely positioned on image */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
                {/* Location, Time, Price row */}
                <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-white/70" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                        </svg>
                        <span className="text-white/80 text-sm">{locationLabel}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-white/70" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                        </svg>
                        <span className="text-white/80 text-sm">{timeLabel}</span>
                    </div>
                    <span className="text-white/80 text-sm">{priceLabel}</span>
                </div>

                {/* Title */}
                <h3 className="text-white text-lg font-bold leading-tight uppercase tracking-wide">
                    {title}
                </h3>
            </div>

            {/* Subtle shine effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        </div>
    );

    return (
        <div
            className="aspect-[4/5] w-full"
        >
            <a
                href={eventbriteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-full no-underline"
            >
                {cardContent}
            </a>
        </div>
    );
};

export default EventCardRedesign;
