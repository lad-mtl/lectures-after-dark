import { eventbriteUrl } from "../lib/siteContent";
import { EVENTBRITE_PROFILE_URL } from "../constants";
export function EventbriteCTA({ eventUrl }: { eventUrl?: string | null }) {
  return (
    <a
      className="lad-button"
      href={eventbriteUrl(eventUrl) || EVENTBRITE_PROFILE_URL}
      target="_blank"
      rel="noreferrer"
    >
      Get tickets on Eventbrite ↗
    </a>
  );
}
