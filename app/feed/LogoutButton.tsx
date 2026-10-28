'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/redeem')
  }

  return (
    <button 
      onClick={handleLogout}
      className="text-sm font-semibold text-[#6B7C6B] hover:text-red-500 transition-colors"
    >
      Log Out
    </button>
  )
}