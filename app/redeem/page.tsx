import { redeemTicket } from './actions'

export default function RedeemPage() {
  return (
    <div className="min-h-screen bg-[#F4F7F4] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-[#E2E8E2]">
        
        <div className="bg-[#0F380F] p-8 text-center">
          <h1 className="text-3xl font-bold text-white font-serif">Claim Your Seat</h1>
          <p className="text-[#D8E9A8] mt-2 text-sm">
            Your institution has vouched for you. Enter your ticket code to join Temi.
          </p>
        </div>

        {/* The action is now typed correctly as Promise<void> */}
        <form action={redeemTicket} className="p-8 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#1A2E1A] mb-1">Ticket Code</label>
            <input 
              name="ticket" 
              type="text" 
              placeholder="e.g., KU-1" 
              required
              className="w-full px-4 py-3 rounded-xl border border-[#E2E8E2] focus:outline-none focus:ring-2 focus:ring-[#4E9F3D] bg-[#F4F7F4] text-[#1A2E1A] uppercase"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1A2E1A] mb-1">Full Name</label>
            <input 
              name="fullName" 
              type="text" 
              placeholder="Alex Mwangi" 
              required
              className="w-full px-4 py-3 rounded-xl border border-[#E2E8E2] focus:outline-none focus:ring-2 focus:ring-[#4E9F3D] bg-[#F4F7F4] text-[#1A2E1A]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1A2E1A] mb-1">Email</label>
            <input 
              name="email" 
              type="email" 
              placeholder="alex@student.ku.ac.ke" 
              required
              className="w-full px-4 py-3 rounded-xl border border-[#E2E8E2] focus:outline-none focus:ring-2 focus:ring-[#4E9F3D] bg-[#F4F7F4] text-[#1A2E1A]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1A2E1A] mb-1">Password</label>
            <input 
              name="password" 
              type="password" 
              required
              className="w-full px-4 py-3 rounded-xl border border-[#E2E8E2] focus:outline-none focus:ring-2 focus:ring-[#4E9F3D] bg-[#F4F7F4] text-[#1A2E1A]"
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#1E5128] hover:bg-[#0F380F] text-white font-bold py-3 px-4 rounded-xl transition-colors mt-4"
          >
            Redeem Ticket & Enter Temi
          </button>
          
          <div className="text-center mt-4">
            <a href="/login" className="text-sm text-[#4E9F3D] hover:underline font-semibold">
              Already have an account? Log in here.
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}