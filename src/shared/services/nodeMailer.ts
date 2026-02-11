import { createTransport } from 'nodemailer';
export const transporter = createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, 
  auth: {
    user: process.env.MAILER_EMAIL,
    pass: process.env.MAILER_SMTP_PASSWORD,
  },
});