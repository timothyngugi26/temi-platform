'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function PostOptions({ postId, isOwner }: { postId: string, isOwner: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  if (!isOwner) return null // Don't show the menu if it's not your post

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post? This cannot be undone.")) return
    
    setLoading(true)
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', postId)

    if (error) {
      alert("Error deleting post: " + error.message)
      setLoading(false)
    } else {
      router.refresh() // Refresh the feed to remove the post
    }
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-[#E2E8E2] z-50 overflow-hidden">
          <button 
            onClick={handleDelete}
            disabled={loading}
            className="w-full text-left px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {loading ? 'Deleting...' : '🗑️ Delete Post'}
          </button>
        </div>
      )}
    </div>
  )
}