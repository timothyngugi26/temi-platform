'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

export default function ContactPage() {
  const [formType, setFormType] = useState<'school' | 'scout'>('school')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form State
  const [companyName, setCompanyName] = useState('')
  const [contactName, setContactName] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formType === 'scout') {
      // Save Scout Application to DB
      const { error: dbError } = await supabase.from('scout_applications').insert({
        company_name: companyName,
        contact_name: contactName,
        work_email: email,
        website: website
      })

      if (dbError) {
        setError(dbError.message)
        setLoading(false)
        return
      }
    } else {
      // School Partnership is currently a mock form
      await new Promise(r => setTimeout(r, 1000))
    }

    setLoading(false)
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-[#F4F7F4] font-sans">
      <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <Link href="/" className="text-3xl font-bold text-[#0F380F] font-serif">
          Temi.
        </Link>
        <Link href="/" className="text-sm font-semibold text-[#6B7C6B] hover:text-[#0F380F] transition-colors">
          ← Back to Home
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto mt-12 px-6 pb-24">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#0F380F] font-serif mb-4">
            Partner with Temi
          </h1>
          <p className="text-lg text-[#6B7C6B] max-w-xl mx-auto">
            Whether you are a university looking to showcase your students, or a company looking for vetted talent, we'd love to hear from you.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-[#E2E8E2] overflow-hidden">
          
          {/* Toggle */}
          <div className="flex border-b border-[#E2E8E2]">
            <button 
              onClick={() => { setFormType('school'); setSubmitted(false); setError('') }}
              className={`flex-1 py-4 text-center font-bold transition-colors ${formType === 'school' ? 'bg-[#F4F7F4] text-[#0F380F] border-b-2 border-[#0F380F]' : 'text-[#6B7C6B] hover:bg-gray-50'}`}
            >
              🏫 For Schools
            </button>
            <button 
              onClick={() => { setFormType('scout'); setSubmitted(false); setError('') }}
              className={`flex-1 py-4 text-center font-bold transition-colors ${formType === 'scout' ? 'bg-[#F4F7F4] text-[#0F380F] border-b-2 border-[#0F380F]' : 'text-[#6B7C6B] hover:bg-gray-50'}`}
            >
              💼 For Corporates
            </button>
          </div>

          <div className="p-8">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-[#D8E9A8] text-[#0F380F] rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                  ✅
                </div>
                <h2 className="text-2xl font-bold text-[#0F380F] font-serif mb-2">Application Received!</h2>
                <p className="text-[#6B7C6B]">
                  Our team will review your application and get back to you within 24 hours.
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="mt-8 text-[#4E9F3D] font-bold hover:underline"
                >
                  Submit another application
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && <div className="bg-red-50 text-red-500 text-sm font-semibold p-3 rounded-lg">{error}</div>}
                
                <div>
                  <label className="block text-sm font-semibold text-[#1A2E1A] mb-1">
                    {formType === 'school' ? 'Institution Name' : 'Company Name'}
                  </label>
                  <input 
                    type="text" 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    placeholder={formType === 'school' ? 'e.g., University of Nairobi' : 'e.g., Safaricom PLC'}
                    className="w-full px-4 py-3 rounded-xl border border-[#E2E8E2] focus:outline-none focus:ring-2 focus:ring-[#4E9F3D] bg-[#F4F7F4]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#1A2E1A] mb-1">Contact Person</label>
                    <input 
                      type="text" 
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      required
                      placeholder="Full Name"
                      className="w-full px-4 py-3 rounded-xl border border-[#E2E8E2] focus:outline-none focus:ring-2 focus:ring-[#4E9F3D] bg-[#F4F7F4]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1A2E1A] mb-1">Work Email</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@organization.com"
                      className="w-full px-4 py-3 rounded-xl border border-[#E2E8E2] focus:outline-none focus:ring-2 focus:ring-[#4E9F3D] bg-[#F4F7F4]"
                    />
                  </div>
                </div>

                {formType === 'scout' && (
                  <div>
                    <label className="block text-sm font-semibold text-[#1A2E1A] mb-1">Company Website / LinkedIn</label>
                    <input 
                      type="url" 
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      required
                      placeholder="https://linkedin.com/company/..."
                      className="w-full px-4 py-3 rounded-xl border border-[#E2E8E2] focus:outline-none focus:ring-2 focus:ring-[#4E9F3D] bg-[#F4F7F4]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-[#1A2E1A] mb-1">
                    {formType === 'school' ? 'How many students are you looking to onboard?' : 'What kind of talent are you looking for?'}
                  </label>
                  <textarea 
                    required
                    rows={3}
                    placeholder={formType === 'school' ? 'e.g., We want to onboard 200 final-year CS students.' : 'e.g., We are hiring junior frontend developers and UI designers.'}
                    className="w-full px-4 py-3 rounded-xl border border-[#E2E8E2] focus:outline-none focus:ring-2 focus:ring-[#4E9F3D] bg-[#F4F7F4] resize-none"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#1E5128] hover:bg-[#0F380F] text-white font-bold py-4 rounded-xl transition-colors mt-4 shadow-md disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>
            )}
          </div>
        </div>

      </main>
    </div>
  )
}