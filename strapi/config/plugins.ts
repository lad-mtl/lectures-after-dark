import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST', 'smtp.resend.com'),
        port: env.int('SMTP_PORT', 465),
        secure: env.bool('SMTP_SECURE', true),
        auth: {
          user: env('SMTP_USERNAME', 'resend'),
          pass: env('SMTP_PASSWORD', 'replace-with-resend-api-key'),
        },
      },
      settings: {
        defaultFrom: env(
          'SMTP_DEFAULT_FROM',
          'Lectures After Dark <noreply@example.com>'
        ),
        defaultReplyTo: env('SMTP_DEFAULT_REPLY_TO', 'reply@example.com'),
      },
    },
  },
});

export default config;
