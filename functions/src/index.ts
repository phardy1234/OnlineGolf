import { initializeApp } from 'firebase-admin/app'
import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import { defineSecret } from 'firebase-functions/params'
import nodemailer from 'nodemailer'

initializeApp()

const gmailUser = defineSecret('GMAIL_USER')
const gmailAppPassword = defineSecret('GMAIL_APP_PASSWORD')
const contactRecipientEmail = defineSecret('CONTACT_RECIPIENT_EMAIL')

export const onContactMessageCreated = onDocumentCreated(
  { document: 'contactMessages/{messageId}', secrets: [gmailUser, gmailAppPassword, contactRecipientEmail] },
  async (event) => {
    const snapshot = event.data
    if (!snapshot) return

    const { name, email, message } = snapshot.data() as {
      name: string
      email: string
      message: string
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser.value(),
        pass: gmailAppPassword.value(),
      },
    })

    try {
      await transporter.sendMail({
        from: gmailUser.value(),
        to: contactRecipientEmail.value(),
        replyTo: email,
        subject: `Online Golf — new contact message from ${name}`,
        text: `From: ${name} <${email}>\n\n${message}`,
      })
      await snapshot.ref.update({ emailSent: true })
    } catch (err) {
      await snapshot.ref.update({
        emailSent: false,
        emailError: err instanceof Error ? err.message : String(err),
      })
    }
  },
)
