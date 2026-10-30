'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

const GIFTS = [
  { id: 'kabeji', emoji: '🥬', name: 'Kabeji', desc: 'Even a small thing helps.', xp: 5, min: 1, max: 2, step: 0.5 },
  { id: 'chai', emoji: '☕', name: 'Chai', desc: 'Here is a cup while you work.', xp: 15, min: 3, max: 10, step: 0.5 },
  { id: 'simba', emoji: '🦁', name: 'Simba', desc: 'That was strong.', xp: 75, min: 10, max: 50, step: 1 },
  { id: 'taji', emoji: '👑', name: 'Taji', desc: 'This is outstanding.', xp: 250, min: 50, max: 100, step: 5 },
  { id: 'malaika', emoji: '👼', name: 'Malaika', desc: 'I believe in you.', xp: 500, min: 100, max: 500, step: 10 },
]

export default function GiftButton({ projectId, receiverId }: { projectId: string, receiverId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedGift, setSelectedGift] = useState(GIFTS[0])
  const [amount, setAmount] = useState(GIFTS[0].min)
  const [message, setMessage] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleGiftSelect = (gift: any) => {
    setSelectedGift(gift)
    setAmount(gift.min) // Reset amount to the minimum of the new gift
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Simulate Payment for all gifts since they all have an amount in USD
    alert(`💳 Card Payment Processed!\n\nAmount: $${amount.toFixed(2)}\n\n(Simulating Payment...)`)
    await new Promise(r => setTimeout(r, 1200))

    const { error } = await supabase.from('gifts').insert({
      project_id: projectId,
      sender_id: user.id,
      receiver_id: receiverId,
      gift_type: selectedGift.id,
      amount: amount,
      message: message || null,
      is_anonymous: isAnonymous,
    })

    if (error) {
      alert("Error sending gift: " + error.message)
    } else {
      alert(`Gift sent! ${selectedGift.emoji} Thank you for supporting Temi.`)
      setIsOpen(false)
      setMessage('')
      setIsAnonymous(false)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 text-sm font-semibold text-[#6B7C6B] hover:text-[#FFB703] transition-colors"
      >
        <span className="text-base">🎁</span> Support
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#E2E8E2]">
            
            {/* Header */}
            <div className="bg-[#0F380F] p-6 text-center relative">
              <h3 className="text-2xl font-bold text-white font-serif">Support This Project</h3>
              <p className="text-[#D8E9A8] text-sm mt-1">A gift is not a purchase. It's a moment of being seen.</p>
              <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-white/70 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <form onSubmit={handleSend} className="p-6 space-y-5">
              
              {/* Gift Selection */}
              <div className="grid grid-cols-5 gap-2">
                {GIFTS.map(gift => (
                  <button 
                    type="button"
                    key={gift.id}
                    onClick={() => handleGiftSelect(gift)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                      selectedGift.id === gift.id 
                        ? 'border-[#FFB703] bg-[#FFB703]/10' 
                        : 'border-[#E2E8E2] hover:border-[#FFB703]/50 bg-[#F4F7F4]'
                    }`}
                  >
                    <span className="text-2xl mb-1">{gift.emoji}</span>
                    <span className="text-[10px] font-bold text-[#0F380F]">{gift.name}</span>
                  </button>
                ))}
              </div>

              {/* Gift Description */}
              <div className="text-center bg-[#F4F7F4] p-4 rounded-xl border border-[#E2E8E2]">
                <p className="text-sm italic text-[#6B7C6B]">"{selectedGift.desc}"</p>
                <p className="text-xs font-bold text-[#4E9F3D] mt-2">+{selectedGift.xp} XP for the builder</p>
              </div>

              {/* Amount Slider (USD) */}
              <div>
                <div className="flex justify-between items-center text-sm font-semibold text-[#1A2E1A] mb-2">
                  <span>Choose Amount (USD)</span>
                  <span className="text-xl text-[#0F380F]">${amount.toFixed(2)}</span>
                </div>
                <input 
                  type="range" 
                  min={selectedGift.min} 
                  max={selectedGift.max} 
                  step={selectedGift.step}
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value))}
                  className="w-full accent-[#4E9F3D] h-2 bg-[#E2E8E2] rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-[#6B7C6B] mt-1 font-semibold">
                  <span>${selectedGift.min.toFixed(2)}</span>
                  <span>${selectedGift.max.toFixed(2)}</span>
                </div>
              </div>

              {/* Message */}
              <div>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a short message (optional)..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-[#E2E8E2] focus:outline-none focus:ring-2 focus:ring-[#4E9F3D] bg-[#F4F7F4] text-sm resize-none"
                />
              </div>

              {/* Anonymous Toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isAnonymous} 
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 accent-[#4E9F3D]"
                />
                <span className="text-sm text-[#6B7C6B]">Send anonymously</span>
              </label>

              {/* Submit */}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#0F380F] hover:bg-[#1E5128] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? 'Processing Payment...' : (
                  <>
                    {selectedGift.emoji} Send {selectedGift.name} (${amount.toFixed(2)})
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}