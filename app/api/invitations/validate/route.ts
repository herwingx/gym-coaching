import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false, error: 'Código requerido' }, { status: 400 })
    }

    const normalizedCode = code.toUpperCase().trim()

    // ADMIN_SETUP_CODE: el primer usuario que lo use se convierte en admin/coach
    const adminSetupCode = process.env.ADMIN_SETUP_CODE?.toUpperCase().trim()
    if (adminSetupCode && normalizedCode === adminSetupCode) {
      const supabase = createAdminClient()
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin')

      const isFirstAdmin = (count ?? 0) === 0

      if (!isFirstAdmin) {
        return NextResponse.json({ valid: false, error: 'Este código ya fue utilizado. Usa un código de invitación de tu coach.' })
      }

      return NextResponse.json({
        valid: true,
        invitation: { email: null, code: normalizedCode },
        role: 'admin',
      })
    }

    const supabase = createAdminClient()

    const { data: invitation, error } = await supabase
      .from('invitation_codes')
      .select('*')
      .eq('code', normalizedCode)
      .eq('is_active', true)
      .single()

    if (error || !invitation) {
      return NextResponse.json({ valid: false, error: 'Código de invitación inválido' })
    }

    const expiresAt = invitation.expires_at ? new Date(invitation.expires_at) : null
    if (expiresAt && expiresAt < new Date()) {
      return NextResponse.json({ valid: false, error: 'Código expirado' })
    }

    const timesUsed = invitation.times_used ?? 0
    const maxUses = invitation.max_uses ?? 1
    if (timesUsed >= maxUses) {
      return NextResponse.json({ valid: false, error: 'Código ya utilizado' })
    }

    // for_role: el admin puede crear códigos para cliente o para otro admin
    const role = invitation.for_role === 'admin' ? 'admin' : 'client'

    return NextResponse.json({
      valid: true,
      invitation: {
        email: invitation.email,
        code: invitation.code,
      },
      role,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error al validar'
    if (msg.includes('SUPABASE_SERVICE_ROLE_KEY')) {
      return NextResponse.json(
        { valid: false, error: 'Configuración del servidor incompleta' },
        { status: 500 }
      )
    }
    return NextResponse.json({ valid: false, error: 'Error al validar' }, { status: 500 })
  }
}
