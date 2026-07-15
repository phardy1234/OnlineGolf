import nodemailer from 'nodemailer'
import { config } from '../config/env.js'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.gmailUser,
    pass: config.gmailAppPassword,
  },
})

export async function sendContactEmail(name: string, email: string, message: string) {
  await transporter.sendMail({
    from: config.gmailUser,
    to: config.contactRecipientEmail,
    replyTo: email,
    subject: `Online Golf — new contact message from ${name}`,
    text: `From: ${name} <${email}>\n\n${message}`,
  })
}
