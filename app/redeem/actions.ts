'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'

export async function redeemTicket(formData: FormData) {
  const ticketCode = formData.get('ticket') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  const supabaseAdmin = createAdminClient()

  // 1. Verify the ticket exists and is not redeemed
  const { data: ticket, error: ticketError } = await supabaseAdmin
    .from('tickets')
    .select('*')
    .eq('ticket_code', ticketCode)
    .eq('is_redeemed', false)
    .single()

  if (ticketError || !ticket) {
    return { error: 'Invalid or already redeemed ticket.' }
  }

  // 2. Create the user securely using the Admin client
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm for institutional onboarding
    user_metadata: { 
      full_name: fullName, 
      institution_id: ticket.institution_id 
    }
  })

  if (authError) {
    return { error: authError.message }
  }

  // 3. Mark the ticket as redeemed
  await supabaseAdmin
    .from('tickets')
    .update({ is_redeemed: true, redeemed_by: authData.user.id })
    .eq('id', ticket.id)

  // 4. Log the user in (using the standard client so cookies are set)
  const supabase = await createClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    return { error: 'Account created, but login failed. Please log in manually.' }
  }

  // 5. Redirect to the feed
  redirect('/feed')
}