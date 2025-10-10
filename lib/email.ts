interface EmailPayload {
  to: string
  subject: string
  html: string
  text?: string
}

const fromAddress = process.env.EMAIL_FROM || 'The Words Record <no-reply@thewordsrecord.com>'

export async function sendEmail({ to, subject, html, text }: EmailPayload): Promise<void> {
  const payload = {
    from: fromAddress,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]+>/g, '')
  }

  // For now we log to stdout so developers can integrate with their provider of choice.
  // Replace this with Nodemailer, Resend, SES, etc. in production.
  console.info('[Email:Queued]', JSON.stringify(payload, null, 2))
}
