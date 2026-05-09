'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, Plus, Shield, Users, MessageSquare } from 'lucide-react'
import { useGameState } from '../hooks/useGameState'

export default function Home() {
  const [name, setName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()
  const { createRoom, joinRoom, room, isConnected, error } = useGameState()

  const handleCreate = () => {
    if (!name) return
    createRoom(name, {
      maxPlayers: 8,
      turnDurationSeconds: 60,
      discussionDurationSeconds: 60,
    })
    setIsCreating(true)
  }

  const handleJoin = () => {
    if (!name || !roomCode) return
    joinRoom(roomCode, name)
  }

  useEffect(() => {
    if (room) {
      router.push(`/room/${room.id}`)
    }
  }, [room, router])

  return (
    <main className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '30px 30px' }} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="z-10 w-full max-w-md px-2"
      >
        <div className="mb-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-[#FFD600] neo-border neo-shadow-lg flex items-center justify-center mb-6 -rotate-3 hover:rotate-0 transition-transform">
            <Shield size={40} className="text-black" />
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-black tracking-tighter mb-2 uppercase italic">
            UNDER<span className="text-[#FF90E8]">COVER</span>
          </h1>
          <p className="text-sm sm:text-base text-black font-bold uppercase tracking-widest bg-[#00E699] px-4 py-1 neo-border neo-shadow-sm rotate-1">
            Real-time Social Deduction
          </p>
          
          <div className="flex items-center gap-2 mt-6 bg-white px-4 py-2 neo-border neo-shadow-sm">
            <div
              className={`w-3 h-3 neo-border ${isConnected ? 'bg-[#00E699]' : 'bg-[#FF4D4D] animate-pulse'}`}
            />
            <span className="text-xs font-black uppercase tracking-widest">
              {isConnected ? 'Server Linked' : 'Signal Lost...'}
            </span>
          </div>
        </div>

        <div className="space-y-6 bg-white p-6 sm:p-8 neo-card">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-left text-xs font-black uppercase tracking-widest">Your Codename</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full neo-input text-lg"
              />
            </div>

            <div className="h-1 bg-black w-full" />

            <div className="space-y-4">
              <button
                onClick={handleCreate}
                disabled={!name || isCreating || !isConnected}
                className="w-full neo-button bg-[#FFD600] text-black text-lg h-14"
              >
                <Plus size={24} strokeWidth={3} />
                Create New Room
              </button>

              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="CODE"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="flex-1 neo-input text-lg text-center font-mono tracking-widest uppercase"
                />
                <button
                  onClick={handleJoin}
                  disabled={!name || !roomCode || !isConnected}
                  className="neo-button bg-[#FF90E8] w-14 h-14 p-0"
                >
                  <Search size={24} strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#FF4D4D] text-white p-3 neo-border neo-shadow-sm font-bold text-sm"
            >
              {error.message}
            </motion.div>
          )}
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Feature icon={<Users size={24} />} label="3-10 Players" color="#FFD600" />
          <Feature icon={<MessageSquare size={24} />} label="Live Chat" color="#FF90E8" />
          <Feature icon={<Shield size={24} />} label="Secret Roles" color="#00E699" />
        </div>
      </motion.div>
    </main>
  )
}

function Feature({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="p-4 neo-border neo-shadow-sm transition-transform hover:-translate-y-1" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <span className="text-xs uppercase tracking-tighter font-black">
        {label}
      </span>
    </div>
  )
}
