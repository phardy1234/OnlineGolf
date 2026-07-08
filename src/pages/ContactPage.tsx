import { useState, type FormEvent } from 'react'
import { FormField } from '../components/common/FormField'
import { sendContactMessage } from '../firebase/contact'

export function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      await sendContactMessage(name, email, message)
      setStatus('sent')
      setName('')
      setEmail('')
      setMessage('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="contact-page">
      <h1>Contact Us</h1>
      <p>Have a question about a product or an order? Send us a message.</p>

      {status === 'sent' ? (
        <p className="form-success">Thanks — your message has been sent. We'll be in touch soon.</p>
      ) : (
        <form onSubmit={handleSubmit} className="contact-form">
          <FormField label="Name" id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          <FormField
            label="Email"
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <FormField
            label="Message"
            id="message"
            as="textarea"
            rows={6}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          {status === 'error' && (
            <p className="form-error">Something went wrong sending your message. Please try again.</p>
          )}
          <button type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Send Message'}
          </button>
        </form>
      )}
    </div>
  )
}
