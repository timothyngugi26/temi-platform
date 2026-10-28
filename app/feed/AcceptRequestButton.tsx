'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function AcceptRequestButton({ requestId }: { requestId: string }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleAccept = async () => {
    setLoading(true)
    const { error } = await supabase
      .from('project_requests')
      .update({ status: 'accepted' })
      .eq('id', requestId)

    if (error) {
      alert("Error accepting: " + error.message)
    } else {
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <button 
      onClick={handleAccept}
      disabled={loading}
      className="bg-[#4E9F3D] hover:bg-[#0F380F] text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-colors disabled:opacity-50"
    >
      {loading ? '...' : 'Accept'}
    </button>
  )
}