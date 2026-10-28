import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch ALL schools ranked by total XP
  const { data: rankings } = await supabase
    .from('school_rankings')
    .select('*')
    .order('total_xp', { ascending: false })

  const topSchool = rankings?.[0]

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
        
        {/* Hero Section */}
        <div className="text-center">
          <h1 className="text-5xl font-bold text-[#0F380F] font-serif mb-3 flex items-center justify-center gap-3">
            🥞 The Chapati Party
          </h1>
          <p className="text-lg text-[#6B7C6B] max-w-xl mx-auto">
            The school with the most XP wins a fully catered Chapati Party. Build projects, collaborate, and level up your school.
          </p>
        </div>

        {/* Top School Spotlight */}
        {topSchool && (
          <div className="bg-gradient-to-br from-[#0F380F] to-[#1E5128] rounded-3xl p-8 shadow-xl text-white relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#FFB703] opacity-20 rounded-full blur-3xl"></div>
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-[#4E9F3D] opacity-20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="text-7xl">🏆</div>
                <div>
                  <p className="text-[#D8E9A8] font-bold uppercase tracking-widest text-sm mb-1">Currently In The Lead</p>
                  <h2 className="text-4xl font-bold font-serif mb-2">{topSchool.institution_name}</h2>
                  <p className="text-white/80">{topSchool.total_students} builders competing</p>
                </div>
              </div>
              <div className="text-center md:text-right bg-black/20 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
                <p className="text-sm text-[#D8E9A8] font-semibold mb-1">Total XP</p>
                <p className="text-5xl font-bold text-[#FFB703]">{topSchool.total_xp.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Full Ranking List */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E2E8E2]">
          <h2 className="text-2xl font-bold text-[#0F380F] font-serif mb-6">Full Standings</h2>
          
          <div className="space-y-3">
            {rankings?.map((school, index) => {
              const isTop3 = index < 3
              return (
                <div 
                  key={school.institution_id} 
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    index === 0 ? 'bg-[#FFF8E1] border-[#FFB703] shadow-sm' : 
                    index === 1 ? 'bg-gray-50 border-gray-300' :
                    index === 2 ? 'bg-orange-50 border-orange-200' :
                    'bg-[#F4F7F4] border-[#E2E8E2]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`text-2xl font-bold w-10 text-center ${
                      index === 0 ? 'text-[#FFB703]' : 
                      index === 1 ? 'text-gray-500' :
                      index === 2 ? 'text-orange-600' :
                      'text-[#6B7C6B]'
                    }`}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </span>
                    <div>
                      <h3 className={`font-bold ${isTop3 ? 'text-[#0F380F]' : 'text-[#1A2E1A]'}`}>
                        {school.institution_name}
                        {school.prefix === 'ST' && <span className="ml-2 text-xs bg-[#FFB703] text-[#0F380F] px-2 py-0.5 rounded-full font-bold">Special Talent</span>}
                      </h3>
                      <p className="text-xs text-[#6B7C6B]">{school.total_students} builders</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-xl font-bold ${index === 0 ? 'text-[#0F380F]' : 'text-[#4E9F3D]'}`}>
                      {school.total_xp.toLocaleString()} XP
                    </p>
                  </div>
                </div>
              )
            })}
            {(!rankings || rankings.length === 0) && (
              <p className="text-center text-[#6B7C6B] py-8">No schools on the leaderboard yet.</p>
            )}
          </div>
        </div>

      </main>
    </div>
  )
}