import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function InboxPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all DMs involving this user
  const { data: messages } = await supabase
    .from('direct_messages')
    .select('*, sender:profiles!sender_id(full_name, avatar_url), receiver:profiles!receiver_id(full_name, avatar_url)')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#F4F7F4] font-sans">
      <header className="bg-white border-b border-[#E2E8E2] px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <Link href="/feed" className="text-2xl font-bold text-[#0F380F] font-serif flex items-center gap-2 hover:opacity-80 transition-opacity">
          Temi.
        </Link>
        <Link href="/feed" className="text-sm font-semibold text-[#4E9F3D] hover:text-[#0F380F] transition-colors">
          Back to Feed
        </Link>
      </header>

      <main className="max-w-3xl mx-auto mt-8 px-4 pb-20">
        <h1 className="text-3xl font-bold text-[#0F380F] font-serif mb-6">Your Inbox</h1>
        
        {!messages || messages.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#E2E8E2]">
            <p className="text-[#6B7C6B]">No direct messages yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const isMe = msg.sender_id === user.id
              const otherPerson = isMe ? msg.receiver : msg.sender
              return (
                <div key={msg.id} className={`p-4 rounded-2xl border ${isMe ? 'bg-white border-[#E2E8E2]' : 'bg-[#D8E9A8]/30 border-[#4E9F3D]'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#4E9F3D] text-white flex items-center justify-center text-xs font-bold overflow-hidden">
                      {otherPerson?.avatar_url ? (
                        <img src={otherPerson.avatar_url} className="w-full h-full object-cover" />
                      ) : (
                        otherPerson?.full_name?.charAt(0) || 'U'
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0F380F]">{isMe ? `To: ${otherPerson?.full_name}` : `From: ${otherPerson?.full_name}`}</p>
                      <p className="text-sm text-[#1A2E1A]">{msg.content}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}