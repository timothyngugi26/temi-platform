'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      window.location.href = '/feed' // Hard refresh to ensure cookies are set
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F7F4] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-[#E2E8E2]">
        <div className="bg-[#0F380F] p-8 text-center">
          <h1 className="text-3xl font-bold text-white font-serif">Welcome Back</h1>
          <p className="text-[#D8E9A8] mt-2 text-sm">Log in to your Temi account.</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-500 text-sm font-semibold p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-semibold text-[#1A2E1A] mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-[#E2E8E2] focus:outline-none focus:ring-2 focus:ring-[#4E9F3D] bg-[#F4F7F4] text-[#1A2E1A]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1A2E1A] mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-[#E2E8E2] focus:outline-none focus:ring-2 focus:ring-[#4E9F3D] bg-[#F4F7F4] text-[#1A2E1A]"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#1E5128] hover:bg-[#0F380F] text-white font-bold py-3 px-4 rounded-xl transition-colors mt-4 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  )
}