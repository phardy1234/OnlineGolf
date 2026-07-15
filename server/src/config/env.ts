import 'dotenv/config'

function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  mongoUri: required('MONGODB_URI'),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  cookieName: process.env.COOKIE_NAME ?? 'token',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  gmailUser: process.env.GMAIL_USER ?? '',
  gmailAppPassword: process.env.GMAIL_APP_PASSWORD ?? '',
  contactRecipientEmail: process.env.CONTACT_RECIPIENT_EMAIL ?? '',
}

export const isProduction = config.nodeEnv === 'production'
