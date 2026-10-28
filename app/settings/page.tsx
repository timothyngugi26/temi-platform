'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SettingsPage() {
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data } = await supabase
        .from('profiles')
        .select('full_name, bio, avatar_url')
        .eq('id', user.id)
        .single()

      if (data) {
        setFullName(data.full_name || '')
        setBio(data.bio || '')
        setAvatarUrl(data.avatar_url || '')
      }
      setLoading(false)
    }
    fetchProfile()
  }, [supabase, router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const { data: { user } } = await supabase.auth.getUser()
    let finalAvatarUrl = avatarUrl

    // 1. Upload new profile picture if selected
    if (file) {
      const fileExt = file.name.split('.').pop()
      const fileName = `avatar-${user?.id}-${Math.random()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('artifacts') // We reuse the same public bucket
        .upload(fileName, file)

      if (uploadError) {
        setMessage('Error uploading image: ' + uploadError.message)
        setSaving(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('artifacts')
        .getPublicUrl(fileName)
        
      finalAvatarUrl = publicUrl
    }

    // 2. Update the profile in the database
    const { error } = await supabase
      .from('profiles')
      .update({ 
        full_name: fullName, 
        bio,
        avatar_url: finalAvatarUrl
      })
      .eq('id', user?.id)

    if (error) {
      setMessage('Error saving profile: ' + error.message)
      setSaving(false)
    } else {
      setMessage('Profile updated successfully!')
      setTimeout(() => router.push('/feed'), 1500)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F4F7F4]">Loading...</div>

  return (
    <div className="min-h-screen bg-[#F4F7F4] p-8 font-sans flex justify-center items-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-[#E2E8E2]">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#0F380F] font-serif">Edit Profile</h1>
          <Link href="/feed" className="text-sm font-semibold text-[#6B7C6B] hover:text-[#0F380F]">Cancel</Link>
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-sm font-semibold mb-4 ${message.includes('Error') ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          
          {/* Profile Picture Upload */}
          <div className="flex flex-col items-center mb-4">
            <div className="w-24 h-24 rounded-full bg-[#4E9F3D] flex items-center justify-center overflow-hidden mb-3 border-4 border-[#F4F7F4] shadow-inner">
              {file ? (
                <img src={URL.createObjectURL(file)} alt="New Avatar" className="w-full h-full object-cover" />
              ) : avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-3xl font-bold">{fullName.charAt(0) || 'U'}</span>
              )}
            </div>
            <label className="cursor-pointer bg-[#F4F7F4] hover:bg-[#D8E9A8] text-[#0F380F] text-xs font-bold py-2 px-4 rounded-full border border-[#E2E8E2] transition-colors">
              Change Photo
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => e.target.files && setFile(e.target.files[0])}
                className="hidden" 
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1A2E1A] mb-1">Full Name</label>
            <input 
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-[#E2E8E2] focus:outline-none focus:ring-2 focus:ring-[#4E9F3D] bg-[#F4F7F4]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1A2E1A] mb-1">Bio</label>
            <textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Tell scouts and collaborators about what you build..."
              className="w-full px-4 py-3 rounded-xl border border-[#E2E8E2] focus:outline-none focus:ring-2 focus:ring-[#4E9F3D] bg-[#F4F7F4] resize-none"
            />
          </div>

          <button 
            type="submit" 
            disabled={saving}
            className="w-full bg-[#1E5128] hover:bg-[#0F380F] text-white font-bold py-3 px-4 rounded-xl transition-colors mt-2 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}