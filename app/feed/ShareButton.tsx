'use client'

import { useState } from 'react'

export default function ShareButton({ projectId, title }: { projectId: string, title: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  // In production, this should be your live Vercel URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://temi-platform.vercel.app'
  const shareUrl = `${baseUrl}/profile/` // Ideally we share the specific project, but profile is easier for now

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareToWhatsApp = () => {
    window.open(`https://wa.me/?text=Check out this project on Temi: "${title}" ${shareUrl}`, '_blank')
  }

  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=Check out this project on Temi: "${title}"&url=${shareUrl}`, '_blank')
  }

  const shareToLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`, '_blank')
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-sm font-semibold text-[#6B7C6B] hover:text-[#4E9F3D] transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Share
      </button>

      {isOpen && (
        <>
          {/* Invisible backdrop to close menu */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          
          <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-xl shadow-xl border border-[#E2E8E2] z-50 overflow-hidden py-1">
            <button onClick={shareToWhatsApp} className="w-full text-left px-4 py-2.5 text-sm font-semibold text-[#1A2E1A] hover:bg-[#F4F7F4] flex items-center gap-3">
              <span className="text-green-500 text-lg">📱</span> WhatsApp
            </button>
            <button onClick={shareToTwitter} className="w-full text-left px-4 py-2.5 text-sm font-semibold text-[#1A2E1A] hover:bg-[#F4F7F4] flex items-center gap-3">
              <span className="text-black text-lg">𝕏</span> Twitter / X
            </button>
            <button onClick={shareToLinkedIn} className="w-full text-left px-4 py-2.5 text-sm font-semibold text-[#1A2E1A] hover:bg-[#F4F7F4] flex items-center gap-3">
              <span className="text-blue-600 text-lg">💼</span> LinkedIn
            </button>
            <div className="h-px bg-[#E2E8E2] my-1"></div>
            <button onClick={handleCopyLink} className="w-full text-left px-4 py-2.5 text-sm font-semibold text-[#1A2E1A] hover:bg-[#F4F7F4] flex items-center gap-3">
              <span className="text-gray-500 text-lg">🔗</span> {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}