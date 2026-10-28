'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminDashboard() {
  const [institutions, setInstitutions] = useState<any[]>([])
  const [name, setName] = useState('')
  const [prefix, setPrefix] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState('')

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        return router.push('/feed') // Kick out non-admins
      }

      fetchInstitutions()
    }
    checkAdminAndFetch()
  }, [supabase, router])

  const fetchInstitutions = async () => {
    const { data } = await supabase
      .from('institutions')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setInstitutions(data)
    setLoading(false)
  }

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setMessage('')

    // Force prefix to be uppercase
    const formattedPrefix = prefix.toUpperCase()

    const { error } = await supabase
      .from('institutions')
      .insert({ name, prefix: formattedPrefix })

    if (error) {
      setMessage('Error creating school: ' + error.message)
    } else {
      setMessage('School onboarded successfully!')
      setName('')
      setPrefix('')
      fetchInstitutions()
    }
    setCreating(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white font-bold">Loading Admin Portal...</div>

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <header className="bg-black border-b border-gray-800 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-lg">
        <div className="text-2xl font-bold text-white font-serif flex items-center gap-2">
          Temi <span className="text-[#FFB703]">Admin</span>
        </div>
        <Link href="/feed" className="text-sm font-semibold text-gray-400 hover:text-white transition-colors">
          Back to Feed
        </Link>
      </header>

      <main className="max-w-4xl mx-auto mt-8 px-4 pb-20">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white font-serif mb-2">Institutional Onboarding</h1>
          <p className="text-gray-400">Register new universities and colleges to Temi.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Create School Form */}
          <div className="bg-gray-800 p-6 rounded-3xl border border-gray-700 shadow-xl h-fit">
            <h2 className="text-xl font-bold text-white font-serif mb-4">Onboard New School</h2>
            
            {message && (
              <div className={`p-3 rounded-lg text-sm font-semibold mb-4 ${message.includes('Error') ? 'bg-red-900/50 text-red-400' : 'bg-green-900/50 text-green-400'}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleCreateSchool} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">Institution Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Strathmore University"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FFB703] bg-gray-900 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">Ticket Prefix</label>
                <input 
                  type="text" 
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  placeholder="e.g., SU"
                  maxLength={5}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FFB703] bg-gray-900 text-white uppercase"
                />
                <p className="text-xs text-gray-500 mt-1">This will prefix tickets (e.g., SU-1, SU-2).</p>
              </div>

              <button 
                type="submit" 
                disabled={creating}
                className="w-full bg-[#FFB703] hover:bg-[#e5a503] text-gray-900 font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50"
              >
                {creating ? 'Onboarding...' : 'Onboard School'}
              </button>
            </form>
          </div>

          {/* List of Schools */}
          <div className="bg-gray-800 p-6 rounded-3xl border border-gray-700 shadow-xl">
            <h2 className="text-xl font-bold text-white font-serif mb-4">Registered Schools</h2>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {institutions.length === 0 ? (
                <p className="text-gray-500 text-sm">No schools registered yet.</p>
              ) : (
                institutions.map((inst) => (
                  <div key={inst.id} className="flex justify-between items-center bg-gray-900 p-4 rounded-xl border border-gray-700">
                    <div>
                      <h3 className="font-bold text-white">{inst.name}</h3>
                      <p className="text-xs text-gray-500">ID: {inst.id.split('-')[0]}...</p>
                    </div>
                    <span className="bg-gray-800 text-[#FFB703] font-bold px-3 py-1 rounded-lg text-sm">
                      {inst.prefix}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}