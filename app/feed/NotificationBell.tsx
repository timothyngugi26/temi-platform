'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    let channel: any = null

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. Fetch initial notifications
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        
      if (data) setNotifications(data)

      // 2. Setup Realtime Subscription for NEW notifications
      channel = supabase
        .channel(`notifs_${user.id}_${Date.now()}`)
        .on(
          'postgres_changes',
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'notifications',
            filter: `user_id=eq.${user.id}` 
          },
          (payload) => {
            setNotifications((prev) => [payload.new, ...prev])
          }
        )
        .subscribe()
    }

    init()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [supabase])

  const markAsRead = async () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
       const { data: { user } } = await supabase.auth.getUser()
       // Update the database
       await supabase.from('notifications').update({ is_read: true }).eq('user_id', user?.id)
       // Update the local state instantly
       setNotifications(notifications.map(n => ({...n, is_read: true})))
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="relative">
      <button onClick={markAsRead} className="relative p-2 text-[#6B7C6B] hover:text-[#0F380F] transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#E2E8E2] z-50 overflow-hidden">
          <div className="p-3 bg-[#F4F7F4] border-b border-[#E2E8E2] font-bold text-sm text-[#0F380F]">Notifications</div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-xs text-center text-[#6B7C6B]">No notifications yet.</p>
            ) : (
              notifications.map(n => (
                <Link href={n.link || '#'} key={n.id} className={`block p-3 border-b border-[#E2E8E2] text-sm hover:bg-[#F4F7F4] ${!n.is_read ? 'bg-[#D8E9A8]/30' : ''}`}>
                  {n.message}
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}