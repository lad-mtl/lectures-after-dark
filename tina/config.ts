import { defineConfig, LocalAuthProvider } from "tinacms";
import { UsernamePasswordAuthJSProvider } from "tinacms-authjs/dist/tinacms";

const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === "true";

export default defineConfig({
  contentApiUrlOverride: "/api/tina/gql",
  authProvider: isLocal
    ? new LocalAuthProvider()
    : new UsernamePasswordAuthJSProvider(),
  build: {
    host: true,
    outputFolder: "admin",
    publicFolder: "public",
  },
  server: {
    allowedOrigins: ["private", "http://cms-lad.s.abu.lan"],
  },
  media: {
    tina: {
      mediaRoot: "uploads",
      publicFolder: "public",
    },
  },
  schema: {
    collections: [
      {
        name: "speaker",
        label: "Speakers",
        path: "content/speakers",
        format: "json",
        fields: [
          {
            type: "string",
            name: "name",
            label: "Name",
            required: true,
            isTitle: true,
          },
          {
            type: "string",
            name: "topic",
            label: "Topic",
          },
          {
            type: "string",
            name: "bio",
            label: "Bio",
            ui: {
              component: "textarea",
            },
          },
          {
            type: "image",
            name: "image",
            label: "Photo",
          },
          {
            type: "string",
            name: "twitter",
            label: "Twitter URL",
          },
          {
            type: "string",
            name: "linkedin",
            label: "LinkedIn URL",
          },
          {
            type: "string",
            name: "website",
            label: "Website URL",
          },
          {
            type: "number",
            name: "order",
            label: "Display Order",
          },
        ],
      },
      {
        name: "venue",
        label: "Venues",
        path: "content/venues",
        format: "json",
        fields: [
          {
            type: "string",
            name: "name",
            label: "Name",
            required: true,
            isTitle: true,
          },
          {
            type: "string",
            name: "neighborhood",
            label: "Neighborhood",
            required: true,
          },
          {
            type: "string",
            name: "description",
            label: "Description",
            ui: {
              component: "textarea",
            },
          },
          {
            type: "image",
            name: "imageUrl",
            label: "Image",
          },
          {
            type: "string",
            name: "mapsLink",
            label: "Google Maps Link",
          },
          {
            type: "number",
            name: "order",
            label: "Display Order",
          },
        ],
      },
      {
        name: "faq",
        label: "FAQ",
        path: "content/faq",
        format: "json",
        fields: [
          {
            type: "object",
            name: "items",
            label: "FAQ Items",
            list: true,
            fields: [
              {
                type: "string",
                name: "question",
                label: "Question",
                required: true,
              },
              {
                type: "string",
                name: "answer",
                label: "Answer",
                ui: {
                  component: "textarea",
                },
              },
            ],
          },
        ],
      },
    ],
  },
});
