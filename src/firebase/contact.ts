import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from './config'

export async function sendContactMessage(name: string, email: string, message: string) {
  await addDoc(collection(db, 'contactMessages'), {
    name,
    email,
    message,
    createdAt: serverTimestamp(),
  })
}
