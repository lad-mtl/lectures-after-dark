// Server-owned contract: do not trust browser validation or UI-only types.
export type ParticipationKind = 'speaker' | 'venue' | 'topic' | 'feedback' | 'volunteer';
const fields: Record<ParticipationKind, string[]> = {
  speaker: ['name', 'email', 'affiliation', 'title', 'summary', 'bio', 'links'],
  venue: ['venueName', 'name', 'email', 'address', 'capacity', 'accessibility', 'availability'],
  topic: ['topic', 'reason', 'links', 'name', 'email'],
  feedback: ['eventId', 'rating', 'enjoyed', 'improvements', 'email'],
  volunteer: ['name', 'email', 'interests', 'comments'],
};
const required: Record<ParticipationKind, string[]> = {
  speaker: ['name', 'email', 'title', 'summary', 'bio'],
  venue: ['venueName', 'name', 'email', 'address', 'capacity', 'accessibility'],
  topic: ['topic', 'reason'], feedback: ['eventId', 'rating'], volunteer: ['name', 'email', 'interests'],
};
const long = new Set(['summary', 'bio', 'accessibility', 'availability', 'reason', 'enjoyed', 'improvements', 'interests', 'comments']);
export const participationForms = Object.fromEntries(Object.entries(fields).map(([kind, names]) => [kind, { fields: names.map(name => ({ name, label: name })) }])) as Record<ParticipationKind, { fields: { name: string; label: string }[] }>;
export function validateParticipation(kind: ParticipationKind, data: Record<string, string>) {
  const errors: Record<string, string> = {};
  for (const name of required[kind]) if (!data[name]) errors[name] = 'Required';
  for (const name of fields[kind]) if ((data[name]?.length ?? 0) > (long.has(name) ? 2000 : 300)) errors[name] = 'Too long';
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Invalid email';
  if (kind === 'venue' && (!/^\d+$/.test(data.capacity) || Number(data.capacity) < 1 || Number(data.capacity) > 100000)) errors.capacity = 'Invalid capacity';
  if (kind === 'feedback' && !/^[1-5]$/.test(data.rating)) errors.rating = 'Invalid rating';
  return errors;
}
