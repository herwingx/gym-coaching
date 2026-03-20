import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const EMAIL_FROM =
  process.env.EMAIL_FROM ?? 'GymCoach <onboarding@resend.dev>'

function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return 'https://tu-app.com'
}

export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY
}

/**
 * Envía el código de invitación al asesorado cuando el admin lo da de alta.
 * El asesorado usa el código para registrarse (crear usuario + contraseña).
 */
export async function sendClientInvitationEmail(params: {
  to: string
  clientName: string
  code: string
}): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn('Resend no configurado (RESEND_API_KEY). No se envió el correo.')
    return { success: false, error: 'Email no configurado' }
  }

  const signUpUrl = `${getAppUrl()}/auth/sign-up?code=${params.code}`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tu código de acceso - GymCoach</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 480px; background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 32px;">
              <div style="width: 48px; height: 48px; background: #e5a84d; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
                <span style="font-size: 24px;">💪</span>
              </div>
              <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #18181b;">
                Bienvenido a GymCoach
              </h1>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #71717a;">
                Hola <strong>${escapeHtml(params.clientName)}</strong>, tu entrenador te ha registrado. Usa el siguiente código para crear tu cuenta y acceder a la app.
              </p>
              <div style="background: #f4f4f5; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
                <p style="margin: 0 0 8px; font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px;">Código de acceso</p>
                <p style="margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 4px; font-family: monospace; color: #18181b;">${escapeHtml(params.code)}</p>
              </div>
              <p style="margin: 0 0 24px; font-size: 14px; line-height: 22px; color: #71717a;">
                Ve a la página de registro, ingresa este código y crea tu usuario (email) y contraseña. El código expira en 30 días.
              </p>
              <a href="${escapeHtml(signUpUrl)}" style="display: inline-block; background: #e5a84d; color: #18181b; font-weight: 600; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-size: 16px;">
                Crear mi cuenta
              </a>
              <p style="margin: 24px 0 0; font-size: 12px; color: #a1a1aa;">
                Si no esperabas este correo, puedes ignorarlo.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: [params.to],
      subject: `Tu código de acceso - GymCoach`,
      html,
    })
    if (error) {
      console.error('Error enviando email de invitación:', error)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (err) {
    console.error('Error enviando email:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error desconocido',
    }
  }
}

/**
 * Envía el código de invitación cuando el admin crea una invitación manual.
 */
export async function sendManualInvitationEmail(params: {
  to: string
  code: string
}): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    return { success: false, error: 'Email no configurado' }
  }

  const signUpUrl = `${getAppUrl()}/auth/sign-up?code=${params.code}`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitación - GymCoach</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 480px; background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 32px;">
              <div style="width: 48px; height: 48px; background: #e5a84d; border-radius: 10px; margin-bottom: 24px;">💪</div>
              <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #18181b;">Invitación a GymCoach</h1>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #71717a;">
                Te han invitado a unirte. Usa este código para registrarte y crear tu cuenta:
              </p>
              <div style="background: #f4f4f5; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 4px; font-family: monospace; color: #18181b;">${escapeHtml(params.code)}</p>
              </div>
              <a href="${escapeHtml(signUpUrl)}" style="display: inline-block; background: #e5a84d; color: #18181b; font-weight: 600; padding: 14px 28px; border-radius: 8px; text-decoration: none;">Registrarme</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: [params.to],
      subject: `Invitación a GymCoach`,
      html,
    })
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error desconocido',
    }
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
