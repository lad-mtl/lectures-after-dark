import type { SocialStat } from "../components/SocialStats";
import { EVENTBRITE_PROFILE_URL, INSTAGRAM_PROFILE_URL } from "../constants";

// Public profile observations, not live counters. See docs/verification/social-stats.md.


export const socialStats: SocialStat[] = [
  { label: "Instagram followers", value: "6,060", href: INSTAGRAM_PROFILE_URL },
  { label: "Total Events", value: "23", href: EVENTBRITE_PROFILE_URL },
  { label: "Total Attendees", value: "632", href: EVENTBRITE_PROFILE_URL },
];
