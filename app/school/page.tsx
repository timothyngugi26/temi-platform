'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function SchoolDashboard() {
  const [tickets, setTickets] = useState<any[]>([])
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [walletBalance, setWalletBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generateAmount, setGenerateAmount] = useState('10')
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')

    // Fetch Wallet Balance
    const { data: profile } = await supabase
      .from('profiles')
      .select('institutions(wallet_balance)')
      .eq('id', user.id)
      .single()
    
    if (profile?.institutions) {
      // @ts-ignore
      setWalletBalance(profile.institutions.wallet_balance || 0)
    }

    // Fetch Tickets
    const { data: ticketData } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false })

    if (ticketData) setTickets(ticketData)

    // Fetch Pending Withdrawals (Only for this admin's school)
    const { data: wdData } = await supabase
      .from('withdrawal_requests')
      .select('*, profiles!student_id(full_name, institution_id)')
      .eq('status', 'pending')
    
    if (wdData) setWithdrawals(wdData)
    
    setLoading(false)
  }

  const handleGenerate = async () => {
    const amount = parseInt(generateAmount)
    if (isNaN(amount) || amount <= 0) return alert("Enter a valid number")

    setGenerating(true)
    
    // Call the secure database function
    const { error } = await supabase.rpc('generate_school_tickets', {
      amount_to_generate: amount
    })

    if (error) {
      alert("Error: " + error.message)
    } else {
      alert(`Successfully generated ${amount} tickets!`)
      fetchData()
    }
    setGenerating(false)
  }

  const handleWithdrawalAction = async (id: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('withdrawal_requests')
      .update({ status })
      .eq('id', id)
      
    if (error) {
      alert("Error updating request: " + error.message)
    } else {
      fetchData()
    }
  }

  // Math for the UI
  const totalAllowed = Math.floor(walletBalance / 500)
  const totalGenerated = tickets.length
  const seatsLeft = totalAllowed - totalGenerated
  const redeemedSeats = tickets.filter(t => t.is_redeemed).length

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F4F7F4] font-bold text-[#0F380F]">Loading Portal...</div>

  return (
    <div className="min-h-screen bg-[#F4F7F4] p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-3xl shadow-sm border border-[#E2E8E2] gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0F380F] font-serif">School Wallet</h1>
            <p className="text-[#6B7C6B] mt-1">Manage your seat allocation and student tickets.</p>
          </div>
          <div className="flex gap-3 items-center">
            <div className="text-right mr-4">
              <p className="text-xs text-[#6B7C6B] font-semibold">Wallet Balance</p>
              <p className="text-xl font-bold text-[#0F380F]">KSh {walletBalance.toLocaleString()}</p>
            </div>
            <input 
              type="number" 
              value={generateAmount}
              onChange={(e) => setGenerateAmount(e.target.value)}
              max={seatsLeft}
              className="w-20 px-3 py-2 rounded-xl border border-[#E2E8E2] text-center font-bold text-[#0F380F]"
            />
            <button 
              onClick={handleGenerate}
              disabled={generating || seatsLeft <= 0}
              className="bg-[#1E5128] hover:bg-[#0F380F] text-white font-bold py-3 px-6 rounded-xl transition-colors disabled:opacity-50"
            >
              {generating ? 'Generating...' : 'Generate Tickets'}
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-[#E2E8E2] shadow-sm">
            <p className="text-sm font-semibold text-[#6B7C6B] mb-1">Total Seats Paid For</p>
            <p className="text-4xl font-bold text-[#0F380F]">{totalAllowed}</p>
            <p className="text-xs text-[#6B7C6B] mt-1">Based on KSh {walletBalance.toLocaleString()} balance</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-[#E2E8E2] shadow-sm">
            <p className="text-sm font-semibold text-[#6B7C6B] mb-1">Tickets Generated</p>
            <p className="text-4xl font-bold text-[#4E9F3D]">{totalGenerated}</p>
            <p className="text-xs text-[#6B7C6B] mt-1">{redeemedSeats} students onboarded</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-[#E2E8E2] shadow-sm">
            <p className="text-sm font-semibold text-[#6B7C6B] mb-1">Seats Available</p>
            <p className={`text-4xl font-bold ${seatsLeft > 0 ? 'text-[#FFB703]' : 'text-red-500'}`}>{seatsLeft}</p>
            <p className="text-xs text-[#6B7C6B] mt-1">{seatsLeft === 0 ? 'Top up to generate more' : 'Ready to generate'}</p>
          </div>
        </div>

        {/* Ticket List */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E2E8E2]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#0F380F] font-serif">Ticket Directory</h2>
          </div>
          
          {tickets.length === 0 ? (
            <div className="text-center py-12 bg-[#F4F7F4] rounded-xl border border-[#E2E8E2]">
              <p className="text-[#6B7C6B]">No tickets generated yet. Click "Generate Tickets" to start.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {tickets.map((ticket) => (
                <div 
                  key={ticket.id} 
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center ${
                    ticket.is_redeemed 
                      ? 'bg-gray-50 border-gray-200 opacity-60' 
                      : 'bg-[#F4F7F4] border-[#E2E8E2] hover:border-[#4E9F3D] transition-colors'
                  }`}
                >
                  <p className="font-mono text-sm font-bold text-[#0F380F] tracking-wider mb-1">{ticket.ticket_code}</p>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    ticket.is_redeemed ? 'bg-gray-200 text-gray-500' : 'bg-[#D8E9A8] text-[#0F380F]'
                  }`}>
                    {ticket.is_redeemed ? 'Used' : 'Active'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PENDING WITHDRAWALS */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E2E8E2]">
          <h2 className="text-xl font-bold text-[#0F380F] font-serif mb-4">🔔 Pending Withdrawals</h2>
          
          {withdrawals.length === 0 ? (
            <div className="text-center py-8 bg-[#F4F7F4] rounded-xl border border-[#E2E8E2]">
              <p className="text-[#6B7C6B] text-sm">No pending withdrawal requests.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {withdrawals.map((w) => (
                <div key={w.id} className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#F4F7F4] p-4 rounded-xl border border-[#E2E8E2] gap-4">
                  <div>
                    <p className="font-bold text-[#0F380F]">
                      {w.profiles?.full_name} — <span className="text-[#4E9F3D]">${Number(w.amount).toFixed(2)}</span>
                    </p>
                    <p className="text-sm text-[#6B7C6B] mt-1">"{w.reason}"</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleWithdrawalAction(w.id, 'rejected')} 
                      className="px-4 py-2 text-sm font-bold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => handleWithdrawalAction(w.id, 'approved')} 
                      className="px-4 py-2 text-sm font-bold text-white bg-[#4E9F3D] rounded-lg hover:bg-[#0F380F] transition-colors"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}