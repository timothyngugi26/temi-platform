'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function Comments({ projectId }: { projectId: string }) {
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchComments()
  }, [])

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(full_name, avatar_url)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })
    
    if (data) setComments(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('comments').insert({
      project_id: projectId,
      author_id: user.id,
      content: newComment
    })

    if (!error) {
      setNewComment('')
      fetchComments()
    }
    setLoading(false)
  }

  return (
    <div className="mt-4 pt-4 border-t border-[#E2E8E2]">
      {/* Comment List */}
      <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
        {comments.length === 0 ? (
          <p className="text-xs text-[#6B7C6B]">No comments yet. Start the conversation!</p>
        ) : (
          comments.map(c => (
            <div key={c.id} className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-[#4E9F3D] text-white flex items-center justify-center text-[10px] font-bold overflow-hidden flex-shrink-0">
                {c.profiles?.avatar_url ? (
                  <img src={c.profiles.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  c.profiles?.full_name?.charAt(0) || 'U'
                )}
              </div>
              <div className="bg-[#F4F7F4] p-2 rounded-lg text-sm text-[#1A2E1A] flex-1">
                <span className="font-bold text-[#0F380F] mr-2">{c.profiles?.full_name || 'Student'}</span>
                {c.content}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Comment Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 px-3 py-2 rounded-xl border border-[#E2E8E2] focus:outline-none focus:ring-2 focus:ring-[#4E9F3D] bg-[#F4F7F4] text-sm"
        />
        <button 
          type="submit" 
          disabled={loading}
          className="bg-[#0F380F] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#1E5128] disabled:opacity-50"
        >
          Post
        </button>
      </form>
    </div>
  )
}