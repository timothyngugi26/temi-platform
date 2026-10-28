'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// 500 KES per ticket. 
// Starter: 10,000 KES = 20 seats
// Pro: 50,000 KES = 100 seats
// Enterprise: 200,000 KES = 400 seats
const PLANS = [
  { id: 'basic', name: 'Starter Pack', seats: 20, price: 'KSh 10,000', priceRaw: 10000, popular: false },
  { id: 'pro', name: 'Campus Pro', seats: 100, price: 'KSh 50,000', priceRaw: 50000, popular: true },
  { id: 'enterprise', name: 'University Enterprise', seats: 400, price: 'KSh 200,000', priceRaw: 200000, popular: false },
]

export default function SchoolSignup() {
  const [step, setStep] = useState<1 | 2>(1)
  const [schoolName, setSchoolName] = useState('')
  const [prefix, setPrefix] = useState('')
  const [adminName, setAdminName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedPlan, setSelectedPlan] = useState(PLANS[1])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()
  const router = useRouter()

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(2) // Move to payment
  }

  const handlePaymentAndOnboard = async () => {
    setLoading(true)
    setError('')

    // 1. Mock Payment Processing Delay (Simulating M-Pesa STK Push)
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 2. Create the Auth User
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: adminName } }
    })

    if (authError || !authData.user) {
      setError(authError?.message || 'Failed to create account')
      setLoading(false)
      return
    }

    // 3. Create the Institution with the wallet balance
    const formattedPrefix = prefix.toUpperCase()
    const { data: instData, error: instError } = await supabase
      .from('institutions')
      .insert({ 
        name: schoolName, 
        prefix: formattedPrefix,
        wallet_balance: selectedPlan.priceRaw // Save the raw KES amount
      })
      .select()
      .single()

    if (instError) {
      setError('Error creating school: ' + instError.message)
      setLoading(false)
      return
    }

    // 4. Link the user as the School Admin
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        role: 'school_admin', 
        institution_id: instData.id 
      })
      .eq('id', authData.user.id)

    if (profileError) {
      setError('Error linking profile: ' + profileError.message)
      setLoading(false)
      return
    }

    // 5. Success! Redirect to the school portal
    window.location.href = '/school'
  }

  return (
    <div className="min-h-screen bg-[#F4F7F4] flex items-center justify-center p-4 font-sans">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-[#E2E8E2]">
        
        <div className="bg-[#0F380F] p-8 text-center relative">
          <h1 className="text-3xl font-bold text-white font-serif">
            {step === 1 ? 'Partner with Temi' : 'Complete Your Purchase'}
          </h1>
          <p className="text-[#D8E9A8] mt-2 text-sm">
            {step === 1 ? 'Onboard your institution to Temi.' : 'Select a plan to activate your school account.'}
          </p>
        </div>

        {error && <div className="bg-red-50 text-red-500 text-sm font-semibold p-3 text-center">{error}</div>}

        {/* STEP 1: Details */}
        {step === 1 && (
          <form onSubmit={handleDetailsSubmit} className="p-8 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#1A2E1A] mb-1">Institution Name</label>
              <input 
                type="text" 
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="e.g., Strathmore University"
                required
                className="w-full px-4 py-3 rounded-xl border border-[#E2E8E2] focus:outline-none focus:ring-2 focus:ring-[#4E9F3D] bg-[#F4F7F4]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A2E1A] mb-1">Ticket Prefix</label>
              <input 
                type="text" 
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="e.g., SU"
                maxLength={5}
                required
                className="w-full px-4 py-3 rounded-xl border border-[#E2E8E2] focus:outline-none focus:ring-2 focus:ring-[#4E9F3D] bg-[#F4F7F4] uppercase"
              />
            </div>

            <div className="pt-2 border-t border-[#E2E8E2]">
              <label className="block text-sm font-semibold text-[#1A2E1A] mb-1 mt-2">Your Full Name</label>
              <input 
                type="text" 
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-[#E2E8E2] focus:outline-none focus:ring-2 focus:ring-[#4E9F3D] bg-[#F4F7F4]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A2E1A] mb-1">Admin Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-[#E2E8E2] focus:outline-none focus:ring-2 focus:ring-[#4E9F3D] bg-[#F4F7F4]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A2E1A] mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-[#E2E8E2] focus:outline-none focus:ring-2 focus:ring-[#4E9F3D] bg-[#F4F7F4]"
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-[#1E5128] hover:bg-[#0F380F] text-white font-bold py-3 px-4 rounded-xl transition-colors mt-2"
            >
              Continue to Payment →
            </button>
            
            <div className="text-center mt-4">
              <Link href="/login" className="text-sm text-[#4E9F3D] hover:underline font-semibold">
                Already have an account? Log in here.
              </Link>
            </div>
          </form>
        )}

        {/* STEP 2: Payment */}
        {step === 2 && (
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {PLANS.map((plan) => (
                <div 
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative ${
                    selectedPlan.id === plan.id 
                      ? 'border-[#4E9F3D] bg-[#D8E9A8]/30' 
                      : 'border-[#E2E8E2] bg-white hover:border-[#4E9F3D]/50'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FFB703] text-[#0F380F] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                      Most Popular
                    </span>
                  )}
                  <h3 className="font-bold text-[#0F380F] mb-1">{plan.name}</h3>
                  <p className="text-2xl font-bold text-[#1A2E1A] mb-2">{plan.price}</p>
                  <p className="text-xs text-[#6B7C6B] font-semibold">{plan.seats} Student Seats</p>
                </div>
              ))}
            </div>

            <div className="bg-[#F4F7F4] rounded-xl p-4 border border-[#E2E8E2] mb-6 flex justify-between items-center">
              <div>
                <p className="text-xs text-[#6B7C6B] font-semibold">Total Due Today</p>
                <p className="text-2xl font-bold text-[#0F380F]">{selectedPlan.price}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#6B7C6B] font-semibold">Payment Method</p>
                <p className="font-bold text-[#1A2E1A] flex items-center gap-2">
                  <span className="text-xl">📱</span> M-Pesa / Card
                </p>
              </div>
            </div>

            <button 
              onClick={handlePaymentAndOnboard}
              disabled={loading}
              className="w-full bg-[#1E5128] hover:bg-[#0F380F] text-white font-bold py-4 px-4 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Processing Payment...
                </>
              ) : (
                `Pay ${selectedPlan.price} & Activate Account`
              )}
            </button>
            
            <button 
              onClick={() => setStep(1)}
              disabled={loading}
              className="w-full text-center text-sm font-semibold text-[#6B7C6B] hover:text-[#0F380F] mt-4 disabled:opacity-50"
            >
              ← Back to Details
            </button>
          </div>
        )}
      </div>
    </div>
  )
}