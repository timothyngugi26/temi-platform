'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function LikeButton({ projectId, initialLikes, initialUserLiked }: { projectId: string, initialLikes: number, initialUserLiked: boolean }) {
  const [likes, setLikes] = useState(initialLikes)
  const [isLiked, setIsLiked] = useState(initialUserLiked)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const toggleLike = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (isLiked) {
      // Unlike
      await supabase.from('likes').delete().eq('project_id', projectId).eq('user_id', user.id)
      setLikes(likes - 1)
      setIsLiked(false)
    } else {
      // Like
      await supabase.from('likes').insert({ project_id: projectId, user_id: user.id })
      setLikes(likes + 1)
      setIsLiked(true)
    }
    setLoading(false)
  }

  return (
    <button 
      onClick={toggleLike}
      disabled={loading}
      className={`flex items-center gap-2 font-semibold text-sm transition-colors ${isLiked ? 'text-red-500' : 'text-[#6B7C6B] hover:text-red-500'}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isLiked ? 'fill-current' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      {likes} {likes === 1 ? 'Like' : 'Likes'}
    </button>
  )
}