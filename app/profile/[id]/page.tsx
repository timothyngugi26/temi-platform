import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import MessageButton from '@/app/feed/MessageButton'

export const dynamic = 'force-dynamic'

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Get current logged-in user to check if viewing own profile
  const { data: { user } } = await supabase.auth.getUser()

  // 2. Fetch the profile
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*, institutions(name, prefix)')
    .eq('id', id)
    .maybeSingle()

  if (error || !profile) {
    notFound() 
  }

  // 3. Fetch the rank using our custom RPC function
  const { data: rank } = await supabase.rpc('get_rank', { xp: profile.xp_points || 0 })

  // 4. Fetch their projects
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('creator_id', profile.id)
    .order('created_at', { ascending: false })

  // Are we looking at our own profile?
  const isOwnProfile = user?.id === profile.id

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

      <main className="max-w-4xl mx-auto mt-8 px-4 pb-20 space-y-8">
        
        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#E2E8E2] flex flex-col md:flex-row items-center md:items-start gap-6 relative">
          
          {/* Rank Badge */}
          <div className="absolute top-0 right-0 bg-[#FFB703] text-[#0F380F] font-bold text-2xl px-6 py-2 rounded-bl-3xl shadow-sm z-20">
            Rank {rank || 'F'}
          </div>

          {/* Profile Picture */}
          <div className="w-24 h-24 bg-[#4E9F3D] text-white rounded-full flex items-center justify-center text-4xl font-bold shadow-inner overflow-hidden border-4 border-white z-10">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
            ) : (
              profile.full_name?.charAt(0) || 'S'
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left mt-4 md:mt-0 z-10">
            <h1 className="text-3xl font-bold text-[#0F380F] font-serif mb-2">{profile.full_name || 'Student'}</h1>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
              <span className="text-sm font-semibold bg-[#0F380F] text-[#D8E9A8] px-3 py-1 rounded-full">
                {profile.institutions?.name || 'Special Talent'}
              </span>
              <span className="text-sm text-[#6B7C6B] font-medium">
                {profile.xp_points || 0} XP
              </span>
              <span className="text-sm text-[#6B7C6B] font-medium">
                {projects?.length || 0} Projects
              </span>
            </div>
            
            <p className="text-[#1A2E1A] max-w-xl mb-6">
              {profile.bio || 'Building real projects, learning in public, and collaborating across schools on Temi.'}
            </p>

            {/* SEND MESSAGE BUTTON (Hidden if viewing own profile) */}
            {!isOwnProfile && user && (
              <div className="mt-4 flex justify-center md:justify-start">
                <MessageButton receiverId={profile.id} label="Send Message" />
              </div>
            )}
          </div>
        </div>

        {/* Projects Grid */}
        <div>
          <h2 className="text-2xl font-bold text-[#0F380F] font-serif mb-4">Portfolio</h2>
          
          {!projects || projects.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-[#E2E8E2]">
              <p className="text-[#6B7C6B]">This student hasn't published any projects yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((project) => (
                <article key={project.id} className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8E2] flex flex-col">
                  <h3 className="text-xl font-bold text-[#0F380F] font-serif mb-2">{project.title}</h3>
                  <p className="text-[#1A2E1A] mb-6 flex-1">{project.description}</p>
                  
                  {project.artifact_url && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-[#E2E8E2]">
                      {project.artifact_type === 'image' ? (
                        <img src={project.artifact_url} alt="Artifact" className="w-full h-auto max-h-[300px] object-cover" />
                      ) : project.artifact_type === 'video' ? (
                        <video src={project.artifact_url} controls className="w-full h-auto max-h-[300px]" />
                      ) : (
                        <a 
                          href={project.artifact_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block w-full text-center bg-[#F4F7F4] hover:bg-[#D8E9A8] text-[#0F380F] font-semibold py-2 transition-colors"
                        >
                          View Artifact
                        </a>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  )
}