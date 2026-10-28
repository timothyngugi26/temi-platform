'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function ConsentToggle({ initialConsent }: { initialConsent: boolean }) {
  const [isDiscoverable, setIsDiscoverable] = useState(initialConsent)
  const [isUpdating, setIsUpdating] = useState(false)
  const supabase = createClient()

  const handleToggle = async () => {
    setIsUpdating(true)
    const newValue = !isDiscoverable

    const { error } = await supabase
      .from('profiles')
      .update({ is_discoverable: newValue })
      .eq('id', (await supabase.auth.getUser()).data.user?.id)

    if (error) {
      alert("Error updating consent: " + error.message)
    } else {
      setIsDiscoverable(newValue)
    }
    setIsUpdating(false)
  }

  return (
    <div className={`rounded-2xl p-6 border transition-colors ${
      isDiscoverable 
        ? 'bg-[#D8E9A8] border-[#4E9F3D]' 
        : 'bg-white border-[#E2E8E2]'
    }`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-[#0F380F] font-serif mb-1">
            {isDiscoverable ? 'You are Visible to Scouts' : 'Your Profile is Hidden'}
          </h3>
          <p className="text-sm text-[#1A2E1A] max-w-md">
            {isDiscoverable 
              ? 'Verified corporate scouts can see your projects, skills, and school badge. You can turn this off anytime.'
              : 'Your work is safe. Only you and your school can see it. Turn this on to let vetted corporate scouts discover your talent.'}
          </p>
        </div>
        
        {/* The Toggle Switch */}
        <button
          onClick={handleToggle}
          disabled={isUpdating}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${
            isDiscoverable ? 'bg-[#0F380F]' : 'bg-[#E2E8E2]'
          } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
              isDiscoverable ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  )
}