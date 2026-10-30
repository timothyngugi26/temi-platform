import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import LogoutButton from './LogoutButton'
import CreateProject from './CreateProject'
import ConsentToggle from './ConsentToggle'
import JoinButton from './JoinButton'
import AcceptRequestButton from './AcceptRequestButton'
import NotificationBell from './NotificationBell'
import Comments from './Comments'
import LikeButton from './LikeButton'
import MessageButton from './MessageButton'
import PostOptions from './PostOptions'
import GiftButton from './GiftButton'
import GiftWallet from './GiftWallet'
import ShareButton from './ShareButton'

async function FeedContent() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, institutions(name, prefix)')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'school_admin') {
    redirect('/school')
  }

  // 1. Fetch Posts (including likes, project requests, and gifts)
  const { data: posts } = await supabase
    .from('projects')
    .select('*, profiles(full_name, institution_id, avatar_url), project_requests(*, profiles(full_name, avatar_url)), likes(user_id), gifts(gift_type, is_anonymous, amount)')
    .order('created_at', { ascending: false })

  // 2. Fetch the Chapati Party Leaderboard
  const { data: schoolRankings } = await supabase
    .from('school_rankings')
    .select('*')
    .limit(3)

  // 3. Filter pending requests for MY projects
  const myPendingRequests = posts?.flatMap(post => 
    post.creator_id === user.id 
      ? post.project_requests?.filter((req: any) => req.status === 'pending') || [] 
      : []
  ) || []

  return (
    <div className="min-h-screen bg-[#F4F7F4] font-sans">
      <header className="bg-white border-b border-[#E2E8E2] px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="text-2xl font-bold text-[#0F380F] font-serif flex items-center gap-2">
          Temi.
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#F4F7F4] px-3 py-1 rounded-full border border-[#E2E8E2] hidden md:flex">
            <span className="text-sm font-semibold text-[#1A2E1A]">{profile?.full_name}</span>
            <span className="text-xs bg-[#0F380F] text-[#D8E9A8] px-2 py-0.5 rounded-full font-bold">
              {profile?.institutions?.prefix || 'ST'}
            </span>
            <span className="text-xs bg-[#FFB703] text-[#0F380F] px-2 py-0.5 rounded-full font-bold ml-1">
              {profile?.xp_points || 0} XP
            </span>
          </div>
          
          <NotificationBell />

          {/* ADMIN LINK (Only visible to admins) */}
          {profile?.role === 'admin' && (
            <Link href="/admin" className="text-sm font-semibold text-[#FFB703] hover:text-[#e5a503] transition-colors">
              Admin
            </Link>
          )}
          
          <Link href="/leaderboard" className="text-sm font-semibold text-[#6B7C6B] hover:text-[#0F380F] transition-colors">
            Leaderboard
          </Link>

          <Link href="/inbox" className="text-sm font-semibold text-[#6B7C6B] hover:text-[#0F380F] transition-colors">
            Inbox
          </Link>

          <Link href="/settings" className="text-sm font-semibold text-[#6B7C6B] hover:text-[#0F380F] transition-colors">
            Settings
          </Link>
          
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-3xl mx-auto mt-8 px-4 pb-20">
        
        <ConsentToggle initialConsent={profile?.is_discoverable || false} />

        {/* INBOX FOR PENDING REQUESTS */}
        {myPendingRequests.length > 0 && (
          <div className="mt-6 bg-white border-2 border-[#4E9F3D] rounded-2xl p-4 shadow-md">
            <h3 className="font-bold text-[#0F380F] mb-3">🔔 Collaboration Requests</h3>
            <div className="space-y-2">
              {myPendingRequests.map((req: any) => (
                <div key={req.id} className="flex justify-between items-center bg-[#F4F7F4] p-3 rounded-xl border border-[#E2E8E2]">
                  <span className="text-sm font-semibold">{req.profiles?.full_name} wants to join your team</span>
                  <AcceptRequestButton requestId={req.id} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHAPATI PARTY LEADERBOARD */}
        <Link href="/leaderboard" className="block mt-6 group">
          <div className="bg-gradient-to-r from-[#0F380F] to-[#1E5128] rounded-3xl p-6 shadow-lg text-white relative overflow-hidden group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-10 rounded-full"></div>
            
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🥞</span>
              <div>
                <h2 className="text-2xl font-bold font-serif group-hover:text-[#D8E9A8] transition-colors">The Chapati Party</h2>
                <p className="text-[#D8E9A8] text-sm">Click to see the full standings →</p>
              </div>
            </div>

            <div className="space-y-3">
              {schoolRankings?.map((school, index) => (
                <div key={school.institution_id} className="flex items-center justify-between bg-black/20 p-3 rounded-xl backdrop-blur-sm border border-white/10">
                  <div className="flex items-center gap-4">
                    <span className={`text-xl font-bold ${index === 0 ? 'text-[#FFB703]' : index === 1 ? 'text-gray-300' : 'text-amber-600'}`}>
                      #{index + 1}
                    </span>
                    <div>
                      <h3 className="font-bold text-white">{school.institution_name}</h3>
                      <p className="text-xs text-[#D8E9A8]">{school.total_students} builders competing</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-[#D8E9A8]">{school.total_xp.toLocaleString()} XP</p>
                    {index === 0 && <span className="text-[10px] font-bold bg-[#FFB703] text-[#0F380F] px-2 py-0.5 rounded-full uppercase tracking-wider">In The Lead 🏆</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Link>

        {/* GIFT WALLET */}
        <GiftWallet userId={user.id} />

        <div className="mt-6">
          <CreateProject userId={user.id} />
        </div>

        <div className="mt-8 space-y-6">
          <h2 className="text-xl font-bold text-[#0F380F] font-serif">Campus Feed</h2>
          
          {!posts || posts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-[#E2E8E2]">
              <p className="text-[#6B7C6B]">No posts yet. Be the first to share something!</p>
            </div>
          ) : (
            posts.map((post) => (
              <article key={post.id} className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8E2]">
                <div className="flex justify-between items-start mb-4">
                  <Link href={`/profile/${post.creator_id}`} className="flex items-center gap-3 group">
                    <div className={`w-10 h-10 text-white rounded-full flex items-center justify-center font-bold group-hover:bg-[#0F380F] transition-colors overflow-hidden ${post.post_type === 'community' ? 'bg-[#FFB703] text-[#1A2E1A] group-hover:text-white' : 'bg-[#4E9F3D]'}`}>
                      {post.profiles?.avatar_url ? (
                         <img src={post.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                         post.profiles?.full_name?.charAt(0) || 'U'
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1A2E1A] group-hover:underline flex items-center gap-2">
                        {post.profiles?.full_name || 'Student'}
                        {post.post_type === 'community' && <span className="text-[10px] bg-[#F4F7F4] text-[#6B7C6B] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Community</span>}
                      </h3>
                      <p className="text-xs text-[#6B7C6B]">Click to view profile</p>
                    </div>
                  </Link>

                  {/* Direct Message + Post Options Menu */}
                  <div className="flex items-center gap-2">
                    {post.creator_id !== user.id && (
                      <MessageButton receiverId={post.creator_id} />
                    )}
                    <PostOptions postId={post.id} isOwner={post.creator_id === user.id} />
                  </div>
                </div>
                
                <h4 className="text-xl font-bold text-[#0F380F] font-serif mb-2">{post.title}</h4>
                <p className="text-[#1A2E1A] mb-4">{post.description}</p>
                
                {/* TOTAL RAISED */}
                {post.gifts && post.gifts.length > 0 && (
                  <div className="flex items-center justify-between bg-[#D8E9A8]/30 rounded-xl p-3 border border-[#4E9F3D]/30 mb-4">
                    <span className="text-sm font-bold text-[#0F380F]">💰 Total Raised</span>
                    <span className="text-lg font-bold text-[#0F380F]">
                      ${post.gifts.reduce((sum: number, g: any) => sum + Number(g.amount || 0), 0).toFixed(2)} USD
                    </span>
                  </div>
                )}

                {/* GIFTS RECEIVED */}
                {post.gifts && post.gifts.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {['kabeji', 'chai', 'simba', 'taji', 'malaika'].map(type => {
                      const count = post.gifts.filter((g: any) => g.gift_type === type).length
                      if (count === 0) return null
                      const emojiMap: any = { kabeji: '🥬', chai: '☕', simba: '🦁', taji: '👑', malaika: '👼' }
                      return (
                        <span key={type} className="bg-[#FFB703]/20 text-[#0F380F] px-3 py-1 rounded-full text-sm font-bold border border-[#FFB703]/40 flex items-center gap-1">
                          <span className="text-base">{emojiMap[type]}</span> × {count}
                        </span>
                      )
                    })}
                  </div>
                )}

                {/* SMART MEDIA RENDERER */}
                {post.post_type === 'project' && post.artifact_url && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-[#E2E8E2]">
                    {post.artifact_type === 'image' ? (
                      <img src={post.artifact_url} alt="Project Artifact" className="w-full h-auto max-h-[500px] object-cover" />
                    ) : post.artifact_type === 'video' ? (
                      <video src={post.artifact_url} controls className="w-full h-auto max-h-[500px]" />
                    ) : (
                      <div className="bg-[#0F380F] text-[#D8E9A8] p-4 font-mono text-sm overflow-x-auto">
                        <span className="text-[#4E9F3D]">/* Artifact Link */</span><br/>
                        <a href={post.artifact_url} target="_blank" rel="noopener noreferrer" className="hover:underline text-white">
                          {post.artifact_url}
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* LIKE BUTTON + GIFT BUTTON + SHARE BUTTON */}
                <div className="mt-4 flex items-center gap-6">
                  <LikeButton 
                    projectId={post.id} 
                    initialLikes={post.likes?.length || 0} 
                    initialUserLiked={post.likes?.some((l: any) => l.user_id === user.id) || false} 
                  />
                  {post.creator_id !== user.id && (
                    <GiftButton projectId={post.id} receiverId={post.creator_id} />
                  )}
                  <ShareButton projectId={post.id} title={post.title} />
                </div>

                {/* JOIN TEAM OR WORKSPACE BUTTON */}
                {post.post_type === 'project' && (
                  <div className="mt-4 pt-4 border-t border-[#E2E8E2] flex justify-between items-center">
                    <span className="text-sm text-[#6B7C6B]">Collaboration:</span>
                    
                    {post.creator_id === user.id || post.project_requests?.some((r: any) => r.requester_id === user.id && r.status === 'accepted') ? (
                      <Link 
                        href={`/workspace/${post.id}`}
                        className="bg-[#FFB703] hover:bg-[#e5a503] text-[#0F380F] text-sm font-bold py-2 px-4 rounded-xl transition-colors flex items-center gap-2 shadow-sm"
                      >
                        💬 Open Workspace
                      </Link>
                    ) : (
                      <JoinButton projectId={post.id} creatorId={post.creator_id} />
                    )}
                  </div>
                )}

                {post.post_type === 'community' && (
                  <div className="flex gap-4 mt-4 pt-4 border-t border-[#E2E8E2]">
                    <button className="text-sm font-semibold text-[#6B7C6B] hover:text-[#FFB703] transition-colors">🔥 Respect</button>
                    <button className="text-sm font-semibold text-[#6B7C6B] hover:text-[#4E9F3D] transition-colors">🙌 Been There</button>
                  </div>
                )}

                {/* COMMENTS SECTION */}
                <Comments projectId={post.id} />
                
              </article>
            ))
          )}
        </div>
      </main>
    </div>
  )
}

export default function FeedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F4F7F4] flex items-center justify-center">
        <div className="text-[#0F380F] font-bold text-xl animate-pulse">Loading Temi...</div>
      </div>
    }>
      <FeedContent />
    </Suspense>
  )
}