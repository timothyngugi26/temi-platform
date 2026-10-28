import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If the user is already logged in, send them to the right portal
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
      
    if (profile?.role === 'school_admin') {
      redirect('/school')
    } else if (profile?.role === 'scout') {
      redirect('/scout')
    } else {
      redirect('/feed')
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F7F4] font-sans text-[#1A2E1A]">
      
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="text-3xl font-bold text-[#0F380F] font-serif flex items-center gap-2">
          Temi.
        </div>
        <div className="flex items-center gap-6">
          <a href="#how-it-works" className="text-sm font-semibold text-[#1A2E1A] hover:text-[#0F380F] transition-colors hidden md:block">
            How it Works
          </a>
          <Link href="/contact" className="text-sm font-semibold text-[#1A2E1A] hover:text-[#0F380F] transition-colors hidden md:block">
            Partner with us
          </Link>
          <Link href="/login" className="text-sm font-semibold text-[#1A2E1A] hover:text-[#0F380F] transition-colors hidden md:block">
            Log In
          </Link>
          <Link href="/redeem" className="text-sm font-bold bg-[#1E5128] text-white px-5 py-2.5 rounded-full hover:bg-[#0F380F] transition-colors shadow-sm">
            Redeem Ticket
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-6 pt-12 pb-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-5xl md:text-6xl font-bold text-[#0F380F] font-serif leading-tight mb-6">
            Where World builders become visible.
          </h1>
          <p className="text-lg text-[#6B7C6B] mb-8 max-w-lg">
            Temi is the collaborative platform where students build real projects, share the culture of building, earn verified recognition, and get discovered by vetted organizations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/redeem" className="bg-[#1E5128] hover:bg-[#0F380F] text-white font-bold text-center px-8 py-4 rounded-xl transition-colors shadow-lg">
              Claim Your Seat
            </Link>
            <a href="#how-it-works" className="bg-white hover:bg-[#D8E9A8] text-[#0F380F] border border-[#E2E8E2] font-bold text-center px-8 py-4 rounded-xl transition-colors">
              How it Works
            </a>
          </div>
        </div>
        
        {/* Hero Images */}
        <div className="relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
           <img 
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop" 
            alt="Students collaborating" 
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-6 left-6 w-40 h-40 rounded-2xl overflow-hidden border-4 border-white shadow-lg hidden md:block">
            <img 
              src="https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=2069&auto=format&fit=crop" 
              alt="Student laughing" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </header>

      {/* The Problem/Value Statement */}
      <section className="bg-white border-y border-[#E2E8E2] py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-[#0F380F] font-serif mb-6">Work is the Signal.</h2>
          <p className="text-lg text-[#6B7C6B] leading-relaxed">
            Grades don't reflect capability. Projects die in folders nobody opens. Opportunity depends on who your family knows. Temi changes the game by making real, shipped work the primary signal for opportunity.
          </p>
        </div>
      </section>

      {/* Three Pillars */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Students */}
          <div className="bg-white rounded-3xl p-8 border border-[#E2E8E2] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-[#D8E9A8] text-[#0F380F] rounded-2xl flex items-center justify-center text-2xl mb-6">🎓</div>
            <h3 className="text-2xl font-bold text-[#0F380F] font-serif mb-3">For Students</h3>
            <p className="text-[#6B7C6B] mb-6">
              Build cross-school teams, ship real projects, earn XP, and control your own privacy. Your work becomes your portfolio.
            </p>
            <Link href="/redeem" className="text-[#4E9F3D] font-semibold hover:underline">Claim your ticket →</Link>
          </div>

          {/* Schools */}
          <div className="bg-white rounded-3xl p-8 border border-[#E2E8E2] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-[#D8E9A8] text-[#0F380F] rounded-2xl flex items-center justify-center text-2xl mb-6">🏫</div>
            <h3 className="text-2xl font-bold text-[#0F380F] font-serif mb-3">For Schools</h3>
            <p className="text-[#6B7C6B] mb-6">
              Retain institutional oversight. Generate secure tickets for your students and prove your student outcomes to industry.
            </p>
            <Link href="/school/signup" className="text-[#4E9F3D] font-semibold hover:underline">Partner with us →</Link>
          </div>

          {/* Corporates */}
          <div className="bg-[#0F380F] rounded-3xl p-8 border border-[#0F380F] shadow-lg">
            <div className="w-14 h-14 bg-[#1E5128] text-[#D8E9A8] rounded-2xl flex items-center justify-center text-2xl mb-6">💼</div>
            <h3 className="text-2xl font-bold text-white font-serif mb-3">For Scouts</h3>
            <p className="text-[#A7F3D0] mb-6">
              Discover verified talent before your competitors do. See real artifacts, not just CVs. Consent-first access.
            </p>
            <Link href="/contact" className="text-[#D8E9A8] font-semibold hover:underline">Apply as a Scout →</Link>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E2E8E2] py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-2xl font-bold text-[#0F380F] font-serif">Temi.</div>
          <p className="text-sm text-[#6B7C6B]">© 2026 Temi by HomeHub. Consent and Dignity as Non-Negotiables.</p>
        </div>
      </footer>

    </div>
  )
}