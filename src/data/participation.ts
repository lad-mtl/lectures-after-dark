export type ParticipationKind = "speaker" | "venue" | "topic" | "feedback" | "volunteer";
export interface ParticipationField {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: "email" | "number" | "textarea" | "event" | "rating";
}
export interface ParticipationForm {
  label: string;
  title: string;
  description: string;
  submit: string;
  privacy: string;
  fields: ParticipationField[];
}
export const participationForms: Record<ParticipationKind, ParticipationForm> =
  {
    speaker: {
      label: "Speaker",
      title: "Bring your ideas to the room.",
      description:
        "Have something worth sharing? Tell us about your work and the talk you have in mind.",
      submit: "Submit speaker proposal",
      privacy:
        "Your details are used to review this proposal and contact you about it.",
      fields: [
        {
          name: "name",
          label: "Full name",
          placeholder: "Your name",
          required: true,
        },
        {
          name: "email",
          label: "Email",
          type: "email",
          placeholder: "you@example.com",
          required: true,
        },
        {
          name: "affiliation",
          label: "Affiliation / role",
          placeholder: "University, organization, or independent work",
        },
        {
          name: "title",
          label: "Proposed talk title",
          placeholder: "The idea you want people to leave with",
          required: true,
        },
        {
          name: "summary",
          label: "Talk summary",
          placeholder:
            "What is the talk about, and why should a curious audience care?",
          type: "textarea",
          required: true,
        },
        {
          name: "bio",
          label: "Short bio",
          placeholder:
            "Tell us about your background and connection to the topic.",
          type: "textarea",
          required: true,
        },
        {
          name: "links",
          label: "Relevant links",
          placeholder: "Writing, past talks, website, or social profile",
        },
      ],
    },
    venue: {
      label: "Venue",
      title: "Make room for good conversation.",
      description:
        "Bring Lectures After Dark to your space. Tell us about your venue and how a talk could fit.",
      submit: "Submit venue inquiry",
      privacy:
        "Your details are used to review your venue and follow up on hosting.",
      fields: [
        {
          name: "venueName",
          label: "Venue name",
          placeholder: "Name of your bar or venue",
          required: true,
        },
        {
          name: "name",
          label: "Contact name",
          placeholder: "Who should we speak with?",
          required: true,
        },
        {
          name: "email",
          label: "Contact email",
          placeholder: "you@venue.com",
          type: "email",
          required: true,
        },
        {
          name: "address",
          label: "Address / neighbourhood",
          placeholder: "Street address, city, and neighbourhood",
          required: true,
        },
        {
          name: "capacity",
          label: "Seated capacity",
          placeholder: "Approximate number of seated guests",
          type: "number",
          required: true,
        },
        {
          name: "accessibility",
          label: "Space, equipment & accessibility",
          placeholder:
            "Tell us about the room, microphone / sound, and step-free access.",
          type: "textarea",
          required: true,
        },
        {
          name: "availability",
          label: "Availability & other details",
          placeholder:
            "Preferred nights, venue website, and anything we should know.",
          type: "textarea",
        },
      ],
    },
    topic: {
      label: "Topics",
      title: "What are you curious about?",
      description:
        "Suggest a question, a big idea, or a subject you would love to explore at a future night.",
      submit: "Send topic suggestion",
      privacy:
        "Contact details are optional and used only to follow up on your suggestion.",
      fields: [
        {
          name: "topic",
          label: "Topic or question",
          placeholder: "What would you like to hear about?",
          required: true,
        },
        {
          name: "reason",
          label: "Why this topic?",
          placeholder:
            "What makes it interesting, timely, or worth talking about?",
          type: "textarea",
          required: true,
        },
        {
          name: "links",
          label: "Suggested speaker / links",
          placeholder:
            "Someone we should hear from, or something we should read",
        },
        {
          name: "name",
          label: "Your name",
          placeholder: "How should we address you?",
        },
        {
          name: "email",
          label: "Your email",
          placeholder: "Only if you would like us to follow up",
          type: "email",
        },
      ],
    },
    feedback: {
      label: "Feedback",
      title: "How was your night?",
      description:
        "Tell us what worked and what could be better. You can leave feedback without sharing your name.",
      submit: "Send feedback",
      privacy:
        "No name or email is required. If you leave an email, we use it only to reply.",
      fields: [
        {
          name: "eventId",
          label: "Which event?",
          type: "event",
          required: true,
        },
        {
          name: "rating",
          label: "Overall experience",
          type: "rating",
          required: true,
        },
        {
          name: "enjoyed",
          label: "What did you enjoy?",
          placeholder:
            "The talk, the conversation, the venue, or something else?",
          type: "textarea",
        },
        {
          name: "improvements",
          label: "What could we improve?",
          placeholder: "Help us make the next night better.",
          type: "textarea",
        },
        {
          name: "email",
          label: "Email for a reply",
          placeholder: "Leave this blank if you do not want a follow-up",
          type: "email",
        },
      ],
    },
    volunteer: {
      label: "Get Involved",
      title: "Be part of Lectures After Dark.",
      description:
        "Help bring curious people together. Whether you’d like to lend a hand at events or contribute behind the scenes, tell us how you’d like to get involved.",
      submit: "Get involved",
      privacy: "Your details are used to review your interest and contact you about getting involved.",
      fields: [
        { name: "name", label: "Name", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "interests", label: "How would you like to get involved?", type: "textarea", required: true },
        { name: "comments", label: "Anything else we should know?", type: "textarea" },
      ],
    },
  };
export function validateParticipation(
  kind: ParticipationKind,
  values: Record<string, string>,
) {
  const errors: Record<string, string> = {};
  for (const field of participationForms[kind].fields) {
    const value = (values[field.name] || "").trim();
    if (field.required && !value)
      errors[field.name] = `${field.label} is required.`;
    else if (
      value &&
      field.type === "email" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    )
      errors[field.name] = "Enter a valid email address.";
    else if (
      value &&
      field.type === "number" &&
      (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 100000)
    )
      errors[field.name] = "Enter a seated capacity between 1 and 100,000.";
    else if (value && field.type === "rating" && !/^[1-5]$/.test(value))
      errors[field.name] = "Choose a rating from 1 to 5.";
    else if (value.length > (field.type === "textarea" ? 2000 : 300))
      errors[field.name] = "Please shorten your answer.";
  }
  return errors;
}
