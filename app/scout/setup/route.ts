import { createAdminClient } from '@/utils/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabaseAdmin = createAdminClient()
  
  // 1. Create the Auth User
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: 'scout@techcorp.com',
    password: 'scoutpassword123',
    email_confirm: true,
  })

  if (authError) {
    return NextResponse.json({ error: authError.message })
  }

  // 2. Add them to the scout_organizations table
  const { error: dbError } = await supabaseAdmin
    .from('scout_organizations')
    .insert({
      id: authData.user.id,
      company_name: 'TechCorp Africa',
    })

  if (dbError) {
    return NextResponse.json({ error: dbError.message })
  }

  return NextResponse.json({ message: 'Scout account created! Email: scout@techcorp.com | Password: scoutpassword123' })
}