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
      <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center border-b border-[#E2E8E2]">
        <div className="text-3xl font-bold text-[#0F380F] font-serif flex items-center gap-2">
          Temi.
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm font-semibold text-[#6B7C6B] hover:text-[#0F380F] transition-colors">
            How it Works
          </a>
          <a href="#why-temi" className="text-sm font-semibold text-[#6B7C6B] hover:text-[#0F380F] transition-colors">
            Why Temi?
          </a>
          <Link href="/contact" className="text-sm font-semibold text-[#6B7C6B] hover:text-[#0F380F] transition-colors">
            Partner with us
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-semibold text-[#0F380F] px-4 py-2 rounded-lg hover:bg-white transition-colors">
            Log In
          </Link>
          <Link href="/redeem" className="text-sm font-bold bg-[#1E5128] text-white px-5 py-2.5 rounded-full hover:bg-[#0F380F] transition-colors shadow-sm">
            Redeem Ticket
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-6 pt-20 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#D8E9A8] text-[#0F380F] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
            <span className="w-2 h-2 bg-[#0F380F] rounded-full animate-pulse"></span>
            Lets build the world
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold text-[#0F380F] font-serif leading-[1.1] mb-6">
            Where World's builders become visible.
          </h1>
          <p className="text-lg text-[#6B7C6B] mb-10 max-w-lg leading-relaxed">
            Temi is the collaborative platform where students build real projects, share the culture of building, earn verified recognition, and get discovered by vetted organizations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/redeem" className="bg-[#1E5128] hover:bg-[#0F380F] text-white font-bold text-center px-8 py-4 rounded-xl transition-colors shadow-lg shadow-[#1E5128]/20">
              Claim Your Seat
            </Link>
            <a href="#how-it-works" className="bg-white hover:bg-[#D8E9A8] text-[#0F380F] border border-[#E2E8E2] font-bold text-center px-8 py-4 rounded-xl transition-colors">
              How it Works
            </a>
          </div>
        </div>
        
        {/* Hero Image */}
        <div className="relative h-[400px] lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
           <img 
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop" 
            alt="Students collaborating" 
            className="w-full h-full object-cover"
          />
          {/* Floating card */}
          <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg flex items-center gap-4">
            <div className="w-12 h-12 bg-[#FFB703] rounded-full flex items-center justify-center text-2xl shadow-inner">🥞</div>
            <div>
              <p className="text-sm font-bold text-[#0F380F]">Chapati Party Leaderboard</p>
              <p className="text-xs text-[#6B7C6B]">Kenyatta University is in the lead!</p>
            </div>
          </div>
        </div>
      </header>

      {/* The Problem/Value Statement */}
      <section className="bg-white border-y border-[#E2E8E2] py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-[#0F380F] font-serif mb-6">Work is the Signal.</h2>
          <p className="text-xl text-[#6B7C6B] leading-relaxed">
            Grades don't reflect capability. Projects die in folders nobody opens. Opportunity depends on who your family knows. Temi changes the game by making real, shipped work the primary signal for opportunity.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#0F380F] font-serif mb-4">How Temi Works</h2>
          <p className="text-lg text-[#6B7C6B]">Three steps to building a verified portfolio.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white rounded-3xl p-8 border border-[#E2E8E2] shadow-sm relative">
            <div className="absolute -top-4 left-8 bg-[#0F380F] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">1</div>
            <div className="w-16 h-16 bg-[#D8E9A8] text-[#0F380F] rounded-2xl flex items-center justify-center text-3xl mb-6">🎫</div>
            <h3 className="text-2xl font-bold text-[#0F380F] font-serif mb-3">Get Your Ticket</h3>
            <p className="text-[#6B7C6B]">
              Your school buys seats and issues you a unique ticket. Redeem it to prove you are a vetted student.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-3xl p-8 border border-[#E2E8E2] shadow-sm relative">
            <div className="absolute -top-4 left-8 bg-[#0F380F] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">2</div>
            <div className="w-16 h-16 bg-[#D8E9A8] text-[#0F380F] rounded-2xl flex items-center justify-center text-3xl mb-6">🛠️</div>
            <h3 className="text-2xl font-bold text-[#0F380F] font-serif mb-3">Build & Collaborate</h3>
            <p className="text-[#6B7C6B]">
              Post projects, upload media, and join cross-school teams. Earn XP and climb the school leaderboard.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-3xl p-8 border border-[#E2E8E2] shadow-sm relative">
            <div className="absolute -top-4 left-8 bg-[#0F380F] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">3</div>
            <div className="w-16 h-16 bg-[#D8E9A8] text-[#0F380F] rounded-2xl flex items-center justify-center text-3xl mb-6">🤝</div>
            <h3 className="text-2xl font-bold text-[#0F380F] font-serif mb-3">Get Discovered</h3>
            <p className="text-[#6B7C6B]">
              Turn on your consent toggle. Verified corporate scouts can then see your real work and reach out.
            </p>
          </div>
        </div>
      </section>

      {/* Three Pillars (Audience) */}
      <section id="why-temi" className="bg-[#0F380F] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white font-serif mb-4">Built for Everyone</h2>
            <p className="text-lg text-[#D8E9A8]">A three-sided marketplace for opportunity.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Students */}
            <div className="bg-white/10 rounded-3xl p-8 border border-white/10 backdrop-blur-sm">
              <div className="w-14 h-14 bg-[#D8E9A8] text-[#0F380F] rounded-2xl flex items-center justify-center text-2xl mb-6">🎓</div>
              <h3 className="text-2xl font-bold text-white font-serif mb-3">For Students</h3>
              <p className="text-white/70 mb-6">
                Build a portfolio that speaks for itself. Control your privacy. Earn XP and real support for your projects.
              </p>
              <Link href="/redeem" className="text-[#D8E9A8] font-semibold hover:underline">Claim your ticket →</Link>
            </div>

            {/* Schools */}
            <div className="bg-white/10 rounded-3xl p-8 border border-white/10 backdrop-blur-sm">
              <div className="w-14 h-14 bg-[#D8E9A8] text-[#0F380F] rounded-2xl flex items-center justify-center text-2xl mb-6">🏫</div>
              <h3 className="text-2xl font-bold text-white font-serif mb-3">For Schools</h3>
              <p className="text-white/70 mb-6">
                Retain oversight. Buy seat plans, generate tickets, and prove your student outcomes to industry.
              </p>
              <Link href="/school/signup" className="text-[#D8E9A8] font-semibold hover:underline">Partner with us →</Link>
            </div>

            {/* Corporates */}
            <div className="bg-white/10 rounded-3xl p-8 border border-white/10 backdrop-blur-sm">
              <div className="w-14 h-14 bg-[#D8E9A8] text-[#0F380F] rounded-2xl flex items-center justify-center text-2xl mb-6">💼</div>
              <h3 className="text-2xl font-bold text-white font-serif mb-3">For Scouts</h3>
              <p className="text-white/70 mb-6">
                Discover verified talent before your competitors. See real artifacts. Consent-first access.
              </p>
              <Link href="/contact" className="text-[#D8E9A8] font-semibold hover:underline">Apply as a Scout →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E2E8E2] py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="text-3xl font-bold text-[#0F380F] font-serif mb-4">Temi.</div>
            <p className="text-sm text-[#6B7C6B] max-w-sm">
              The collaborative platform where World brightest students become visible, connected, and hireable. Consent and dignity as non-negotiables.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-[#0F380F] mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-[#6B7C6B]">
              <li><Link href="/redeem" className="hover:text-[#0F380F]">For Students</Link></li>
              <li><Link href="/school/signup" className="hover:text-[#0F380F]">For Schools</Link></li>
              <li><Link href="/contact" className="hover:text-[#0F380F]">For Scouts</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[#0F380F] mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-[#6B7C6B]">
              <li><Link href="/contact" className="hover:text-[#0F380F]">Contact Us</Link></li>
              <li><a href="#" className="hover:text-[#0F380F]">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#0F380F]">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-[#E2E8E2] text-center text-sm text-[#6B7C6B]">
          © 2026 Temi by HomeHub. All rights reserved.
        </div>
      </footer>

    </div>
  )
}