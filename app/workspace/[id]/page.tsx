'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Workspace({ params }: { params: Promise<{ id: string }> }) {
  const [project, setProject] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState('')
  
  const supabase = createClient()
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const projectIdPromise = params

  useEffect(() => {
    let channel: any = null

    const init = async () => {
      const { id } = await projectIdPromise
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')
      setUserId(user.id)

      // 1. Fetch Project & Verify Access
      const { data: proj, error: projErr } = await supabase
        .from('projects')
        .select('*, profiles(full_name, avatar_url)')
        .eq('id', id)
        .single()

      if (projErr || !proj) {
        setError("Project not found or you don't have access.")
        setLoading(false)
        return
      }

      // 2. Check if user is creator or accepted collaborator
      const isCreator = proj.creator_id === user.id
      const { data: request } = await supabase
        .from('project_requests')
        .select('status')
        .eq('project_id', id)
        .eq('requester_id', user.id)
        .eq('status', 'accepted')
        .maybeSingle()

      if (!isCreator && !request) {
        setError("You must be an accepted collaborator to view this workspace.")
        setLoading(false)
        return
      }

      setProject(proj)

      // 3. Fetch existing messages
      const { data: msgs } = await supabase
        .from('messages')
        .select('*, profiles(full_name, avatar_url)')
        .eq('project_id', id)
        .order('created_at', { ascending: true })

      if (msgs) setMessages(msgs)
      setLoading(false)

      // 4. Setup Realtime Channel
      // We create a unique channel name to avoid conflicts in strict mode
      const channelName = `chat_${id}_${Date.now()}`
      
      channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `project_id=eq.${id}`
          },
          async (payload) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('id', payload.new.sender_id)
              .single()

            setMessages((prev) => [...prev, { ...payload.new, profiles: profile }])
          }
        )
        .subscribe()
    }

    init()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [supabase, router, projectIdPromise])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !project) return

    const msg = newMessage
    setNewMessage('')

    const { id } = await projectIdPromise
    await supabase.from('messages').insert({
      project_id: id,
      sender_id: userId,
      content: msg
    })
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F4F7F4] font-bold text-[#0F380F]">Connecting to Workspace...</div>

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7F4]">
      <div className="bg-white p-8 rounded-2xl border border-red-200 text-center">
        <p className="text-red-500 font-bold mb-4">{error}</p>
        <Link href="/feed" className="text-[#0F380F] hover:underline">Back to Feed</Link>
      </div>
    </div>
  )

  return (
    <div className="h-screen bg-[#F4F7F4] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-[#E2E8E2] px-6 py-4 flex justify-between items-center shadow-sm flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-[#0F380F] font-serif">Workspace: {project.title}</h1>
          <p className="text-xs text-[#6B7C6B]">Private collaboration channel</p>
        </div>
        <Link href="/feed" className="text-sm font-semibold text-[#6B7C6B] hover:text-[#0F380F] bg-[#F4F7F4] px-4 py-2 rounded-xl border border-[#E2E8E2]">
          ← Back to Feed
        </Link>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#6B7C6B]">This is the start of your collaboration. Say hi! 👋</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender_id === userId
            return (
              <div key={msg.id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[75%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className="w-8 h-8 rounded-full bg-[#4E9F3D] text-white flex items-center justify-center text-xs font-bold overflow-hidden flex-shrink-0 mt-1">
                    {msg.profiles?.avatar_url ? (
                      <img src={msg.profiles.avatar_url} className="w-full h-full object-cover" />
                    ) : (
                      msg.profiles?.full_name?.charAt(0) || 'U'
                    )}
                  </div>
                  <div>
                    <p className={`text-[10px] text-[#6B7C6B] mb-1 ${isMe ? 'text-right' : 'text-left'}`}>
                      {msg.profiles?.full_name}
                    </p>
                    <div className={`p-3 rounded-2xl text-sm ${isMe ? 'bg-[#0F380F] text-white rounded-tr-sm' : 'bg-white border border-[#E2E8E2] text-[#1A2E1A] rounded-tl-sm'}`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-[#E2E8E2] flex-shrink-0">
        <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-5 py-3 rounded-full border border-[#E2E8E2] focus:outline-none focus:ring-2 focus:ring-[#4E9F3D] bg-[#F4F7F4] text-sm"
          />
          <button 
            type="submit"
            className="bg-[#1E5128] hover:bg-[#0F380F] text-white font-bold px-6 py-3 rounded-full transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}