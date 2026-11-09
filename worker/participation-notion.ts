import { participationForms, type ParticipationKind } from './participation-fields.ts';

function text(content: string) {
  return Array.from({ length: Math.ceil(content.length / 2000) }, (_, index) => ({ type: 'text', text: { content: content.slice(index * 2000, (index + 1) * 2000) } }));
}
const rich = (value: string) => ({ rich_text: text(value) });
const title = (value: string) => ({ title: text(value) });

export function notionSubmission(data: Record<string, string>, eventName?: string) {
  const kind = data.kind as ParticipationKind;
  const properties: Record<string, unknown> = { Source: { select: { name: 'website' } } };
  const sources = {
    volunteer: '2ff0b85f-8229-814c-99d9-000bdb38a25d',
    speaker: '2f90b85f-8229-81fd-b93c-000b95426d50',
    venue: '2f90b85f-8229-817d-8da4-000bee495870',
    topic: '2ef0b85f-8229-8006-8f18-000b2b7e141c',
    feedback: '0250b85f-8229-8388-ae56-87ec4917640b',
  };
  if (kind === 'volunteer') Object.assign(properties, { Name: title(data.name), Email: { email: data.email }, Notes: rich(`How would you like to get involved?: ${data.interests}\n\nAnything else we should know?: ${data.comments || '(not provided)'}`), Status: { select: { name: 'New inquiry' } } });
  if (kind === 'speaker') Object.assign(properties, { Name: title(data.name), Email: { email: data.email }, 'Desired Topic(s)': rich(data.title), 'Past Experience': rich(data.bio), Notes: rich(data.summary), Status: { select: { name: 'Candidate' } } });
  if (kind === 'venue') Object.assign(properties, { 'Venue Name': title(data.venueName), 'Contact Name': rich(data.name), 'Contact Email': { email: data.email }, Capacity: { number: Number(data.capacity) }, Notes: rich(data.accessibility), Status: { status: { name: 'Received' } } });
  if (kind === 'topic') Object.assign(properties, { Topic: title(data.topic), 'Topic Status': { status: { name: 'From form' } } });
  if (kind === 'feedback') Object.assign(properties, {
    Name: title(`Website feedback — ${eventName}`),
    'What event(s) did you attend?': rich(eventName!),
    'Did you like the event(s)?': { multi_select: [{ name: data.rating }] },
    'What did we do good?': rich(data.enjoyed || ''),
    'What could have we done better? (1)': rich(data.improvements || ''),
    Status: { status: { name: 'Received' } },
  });
  const labels = new Map(participationForms[kind].fields.map(field => [field.name, field.label]));
  const children = Object.entries(data).filter(([key]) => key !== 'companyFax').map(([key, value]) => ({
    object: 'block', type: 'paragraph', paragraph: rich(`${labels.get(key) ?? key}: ${value || '(not provided)'}`),
  }));
  return { parent: { type: 'data_source_id', data_source_id: sources[kind] }, properties, children };
}
