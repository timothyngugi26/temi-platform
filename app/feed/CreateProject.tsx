'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function CreateProject({ userId }: { userId: string }) {
  const [postType, setPostType] = useState<'project' | 'community'>('project')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [artifactUrl, setArtifactUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        alert("You are not logged in!")
        return
      }

      let finalArtifactUrl = artifactUrl
      let finalArtifactType = 'link'

      // 1. Upload File to Supabase Storage if a file was selected
      if (postType === 'project' && file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}-${Math.random()}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('artifacts')
          .upload(fileName, file)

        if (uploadError) {
          alert("Error uploading file: " + uploadError.message)
          setIsSubmitting(false)
          return
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('artifacts')
          .getPublicUrl(fileName)
          
        finalArtifactUrl = publicUrl
        
        // Determine the type
        if (file.type.startsWith('image/')) finalArtifactType = 'image'
        else if (file.type.startsWith('video/')) finalArtifactType = 'video'
        else finalArtifactType = 'file'
      }

      // 2. Insert the post into the database
      const { error } = await supabase.from('projects').insert({
        creator_id: user.id, 
        title,
        description,
        artifact_url: postType === 'project' ? finalArtifactUrl : null,
        artifact_type: finalArtifactType,
        post_type: postType
      })

      if (error) {
        console.error("SUPABASE ERROR:", error);
        alert('Database rejected post: ' + error.message)
      } else {
        setTitle('')
        setDescription('')
        setArtifactUrl('')
        setFile(null)
        router.refresh() 
      }
    } catch (err) {
      console.error("CATCH ERROR:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8E2]">
      <div className="flex gap-4 mb-6 border-b border-[#E2E8E2] pb-4">
        <button
          onClick={() => setPostType('project')}
          className={`font-bold pb-2 transition-colors ${postType === 'project' ? 'text-[#0F380F] border-b-2 border-[#0F380F]' : 'text-[#6B7C6B] hover:text-[#1A2E1A]'}`}
        >
          🚀 Ship a Project
        </button>
        <button
          onClick={() => setPostType('community')}
          className={`font-bold pb-2 transition-colors ${postType === 'community' ? 'text-[#0F380F] border-b-2 border-[#0F380F]' : 'text-[#6B7C6B] hover:text-[#1A2E1A]'}`}
        >
          ☕ Community Post
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder={postType === 'project' ? "Project Title (e.g., Agri-Track API)" : "What's on your mind? (e.g., Finally fixed the CSS bug 😭)"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-[#E2E8E2] focus:outline-none focus:ring-2 focus:ring-[#4E9F3D] bg-[#F4F7F4] font-semibold"
          />
        </div>
        <div>
          <textarea
            placeholder={postType === 'project' ? "What did you build and how does it work?" : "Share a win, a meme, or a thought with the community..."}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-[#E2E8E2] focus:outline-none focus:ring-2 focus:ring-[#4E9F3D] bg-[#F4F7F4] resize-none"
          />
        </div>
        
        {postType === 'project' && (
          <div className="space-y-3 p-4 bg-[#F4F7F4] rounded-xl border border-[#E2E8E2]">
            <p className="text-sm font-semibold text-[#1A2E1A]">Add an Artifact (Optional)</p>
            
            <div>
              <label className="block text-xs text-[#6B7C6B] mb-1">Upload a Photo or Video</label>
              <input
                type="file"
                accept="image/*, video/*"
                onChange={handleFileChange}
                className="w-full text-sm text-[#6B7C6B] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#D8E9A8] file:text-[#0F380F] hover:file:bg-[#4E9F3D] transition-colors"
              />
            </div>
            
            <div className="text-center text-xs text-[#6B7C6B] py-1">OR</div>
            
            <div>
              <label className="block text-xs text-[#6B7C6B] mb-1">Paste a Link (GitHub, Figma, Live Demo)</label>
              <input
                type="text"
                placeholder="https://github.com/..."
                value={artifactUrl}
                onChange={(e) => setArtifactUrl(e.target.value)}
                disabled={!!file} // Disable link input if a file is selected
                className="w-full px-4 py-2 text-sm rounded-lg border border-[#E2E8E2] focus:outline-none focus:ring-2 focus:ring-[#4E9F3D] disabled:opacity-50"
              />
            </div>
          </div>
        )}
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#1E5128] hover:bg-[#0F380F] text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Uploading...' : postType === 'project' ? 'Publish Project' : 'Share with Community'}
        </button>
      </form>
    </div>
  )
}