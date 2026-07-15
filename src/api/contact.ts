import { apiRequest } from './client'

export async function sendContactMessage(name: string, email: string, message: string) {
  await apiRequest('/api/contact', {
    method: 'POST',
    body: JSON.stringify({ name, email, message }),
  })
}
