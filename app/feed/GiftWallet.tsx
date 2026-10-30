'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

const GIFT_EMOJIS: any = {
  kabeji: '🥬',
  chai: '☕',
  simba: '🦁',
  taji: '👑',
  malaika: '👼'
}

export default function GiftWallet({ userId }: { userId: string }) {
  const [gifts, setGifts] = useState<any[]>([])
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [userId])

  const fetchData = async () => {
    // Fetch Gifts
    const { data: giftData } = await supabase
      .from('gifts')
      .select('*, profiles!sender_id(full_name)')
      .eq('receiver_id', userId)
      .order('created_at', { ascending: false })
    
    if (giftData) setGifts(giftData)

    // Fetch Withdrawals
    const { data: wdData } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('student_id', userId)
      .order('created_at', { ascending: false })

    if (wdData) setWithdrawals(wdData)
    
    setLoading(false)
  }

  const handleWithdrawRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    // Get student's institution
    const { data: profile } = await supabase
      .from('profiles')
      .select('institution_id')
      .eq('id', userId)
      .single()

    const { error } = await supabase.from('withdrawal_requests').insert({
      student_id: userId,
      institution_id: profile?.institution_id,
      amount: parseFloat(amount),
      reason: reason
    })

    if (error) {
      alert("Error: " + error.message)
    } else {
      alert("Withdrawal request sent! Your school will review it.")
      setIsWithdrawOpen(false)
      setAmount('')
      setReason('')
      fetchData()
    }
    setSubmitting(false)
  }

  if (loading) return null
  if (gifts.length === 0 && withdrawals.length === 0) return null

  // Calculate total USD raised minus approved/pending withdrawals
  const totalRaised = gifts.reduce((sum, g) => sum + Number(g.amount || 0), 0)
  const totalWithdrawn = withdrawals
    .filter(w => w.status === 'approved' || w.status === 'pending')
    .reduce((sum, w) => sum + Number(w.amount), 0)
  const availableBalance = totalRaised - totalWithdrawn

  // Count gifts by type
  const giftCounts = gifts.reduce((acc: any, g) => {
    acc[g.gift_type] = (acc[g.gift_type] || 0) + 1
    return acc
  }, {})

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8E2] mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-[#0F380F] font-serif flex items-center gap-2">
          🎁 Your Gift Wallet
        </h2>
        <div className="text-right">
          <p className="text-xs text-[#6B7C6B] font-semibold">Available Balance</p>
          <p className="text-xl font-bold text-[#4E9F3D]">${availableBalance.toFixed(2)}</p>
        </div>
      </div>

      {/* Gift Counts */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.keys(giftCounts).map(type => (
          <div key={type} className="bg-[#F4F7F4] border border-[#E2E8E2] px-3 py-1.5 rounded-xl flex items-center gap-2">
            <span className="text-lg">{GIFT_EMOJIS[type]}</span>
            <span className="font-bold text-[#0F380F]">{giftCounts[type]}</span>
          </div>
        ))}
      </div>

      {/* Recent Gifts List */}
      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 mb-4">
        {gifts.slice(0, 3).map((gift) => (
          <div key={gift.id} className="flex justify-between items-center bg-[#F4F7F4] p-3 rounded-xl border border-[#E2E8E2]">
            <div className="flex items-center gap-3">
              <span className="text-xl">{GIFT_EMOJIS[gift.gift_type]}</span>
              <div>
                <p className="text-sm font-semibold text-[#1A2E1A]">
                  {gift.is_anonymous ? 'Anonymous' : (gift.profiles?.full_name || 'Someone')}
                </p>
                <p className="text-xs text-[#6B7C6B]">{gift.message || `Sent you a ${gift.gift_type}`}</p>
              </div>
            </div>
            {gift.amount > 0 && <span className="font-bold text-[#4E9F3D] text-sm">${Number(gift.amount).toFixed(2)}</span>}
          </div>
        ))}
      </div>

      {/* Action Button */}
      <button 
        onClick={() => setIsWithdrawOpen(true)}
        disabled={availableBalance <= 0}
        className="w-full bg-[#1E5128] hover:bg-[#0F380F] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
      >
        Request Withdrawal
      </button>

      {/* WITHDRAWAL MODAL */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-[#0F380F] font-serif mb-2">Request Withdrawal</h3>
            <p className="text-xs text-[#6B7C6B] mb-4">
              Funds are for project needs only (equipment, internet, transport, etc.). Your school will review this request.
            </p>

            <form onSubmit={handleWithdrawRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#1A2E1A] mb-1">Amount (USD)</label>
                <input 
                  type="number" 
                  step="0.01"
                  max={availableBalance}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  placeholder={`Max: $${availableBalance.toFixed(2)}`}
                  className="w-full px-4 py-3 rounded-xl border border-[#E2E8E2] focus:outline-none focus:ring-2 focus:ring-[#4E9F3D] bg-[#F4F7F4]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1A2E1A] mb-1">What is this for?</label>
                <textarea 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  rows={3}
                  placeholder="e.g., Buying a used microphone for my podcast project."
                  className="w-full px-4 py-3 rounded-xl border border-[#E2E8E2] focus:outline-none focus:ring-2 focus:ring-[#4E9F3D] bg-[#F4F7F4] resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsWithdrawOpen(false)} className="text-sm font-bold text-[#6B7C6B] px-4 py-2">Cancel</button>
                <button type="submit" disabled={submitting} className="bg-[#1E5128] text-white font-bold px-6 py-2 rounded-xl">
                  {submitting ? 'Sending...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}