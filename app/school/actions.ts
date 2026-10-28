'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function buySeats(formData: FormData) {
  const amount = parseInt(formData.get('amount') as string)
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in' }

  // Fix: Add the type cast here to fix the 'prefix' error
  const { data: profile } = await supabase
    .from('profiles')
    .select('institution_id, institutions(prefix)')
    .eq('id', user.id)
    .single() as { data: any, error: any }

  if (!profile?.institution_id) return { error: 'No institution linked' }

  // MOCK PAYMENT GATEWAY: Imagine an M-Pesa STK push happens here
  // await processPayment(user.id, amount * 500)

  const prefix = profile.institutions?.prefix || 'SCH'
  const newTickets = Array.from({ length: amount }).map(() => ({
    institution_id: profile.institution_id,
    ticket_code: `${prefix}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  }))

  const { error } = await supabase.from('tickets').insert(newTickets)

  if (error) return { error: error.message }

  revalidatePath('/school')
  return { success: true }
}