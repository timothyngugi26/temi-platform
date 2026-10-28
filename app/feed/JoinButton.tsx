'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function JoinButton({ projectId, creatorId }: { projectId: string, creatorId: string }) {
  const [loading, setLoading] = useState(false)
  const [requested, setRequested] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleJoin = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase.from('project_requests').insert({
      project_id: projectId,
      requester_id: user.id,
      status: 'pending'
    })

    if (error) {
      if (error.code === '23505') alert("You already requested to join this project.")
      else alert("Error: " + error.message)
    } else {
      setRequested(true)
      router.refresh()
    }
    setLoading(false)
  }

  if (requested) {
    return <span className="text-sm font-bold text-[#4E9F3D]">Request Sent ✅</span>
  }

  return (
    <button 
      onClick={handleJoin}
      disabled={loading}
      className="bg-[#0F380F] hover:bg-[#1E5128] text-white text-sm font-bold py-2 px-4 rounded-xl transition-colors disabled:opacity-50"
    >
      {loading ? 'Sending...' : 'Request to Join Team'}
    </button>
  )
}