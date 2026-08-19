import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST', 'smtp.mx.cloudflare.net'),
        port: env.int('SMTP_PORT', 465),
        secure: env.bool('SMTP_SECURE', true),
        auth: {
          user: env('SMTP_USERNAME', 'api_token'),
          pass: env('SMTP_PASSWORD', 'replace-with-cloudflare-api-token'),
        },
      },
      settings: {
        defaultFrom: env(
          'SMTP_DEFAULT_FROM',
          'Lectures After Dark <noreply@mail.lecturesafterdark.ca>'
        ),
        defaultReplyTo: env('SMTP_DEFAULT_REPLY_TO', 'core@lecturesafterdark.ca'),
      },
    },
  },
});

export default config;
