import { createAdminClient } from '@/utils/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabaseAdmin = createAdminClient()
  
  // 1. Create the Auth User
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: 'admin@ku.ac.ke',
    password: 'adminpassword123',
    email_confirm: true,
  })

  if (authError) return NextResponse.json({ error: authError.message })

  // 2. Find Kenyatta University's ID
  const { data: inst } = await supabaseAdmin
    .from('institutions')
    .select('id')
    .eq('prefix', 'KU')
    .single()

  // 3. Update the profile to be a school_admin for KU
  await supabaseAdmin
    .from('profiles')
    .update({ 
      role: 'school_admin',
      institution_id: inst?.id,
      full_name: 'KU Admin'
    })
    .eq('id', authData.user.id)

  // 4. Update the institution to show who the admin is
  await supabaseAdmin
    .from('institutions')
    .update({ admin_id: authData.user.id })
    .eq('id', inst?.id)

  return NextResponse.json({ message: 'School Admin created! Email: admin@ku.ac.ke | Password: adminpassword123' })
}