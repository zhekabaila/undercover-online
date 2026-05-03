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
      turnDurationSeconds: 5,
      discussionDurationSeconds: 5,
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
    <main className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] sm:w-[40%] h-[60%] sm:h-[40%] bg-purple-600/20 rounded-full blur-[80px] sm:blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] sm:w-[40%] h-[60%] sm:h-[40%] bg-blue-600/20 rounded-full blur-[80px] sm:blur-[120px] animate-pulse delay-700" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-md text-center px-2"
      >
        <div className="mb-6 sm:mb-8 flex flex-col items-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-4 rotate-3 hover:rotate-0 transition-transform">
            <Shield size={32} className="sm:text-[40px] text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tighter mb-2">
            UNDERCOVER
          </h1>
          <p className="text-sm sm:text-base text-gray-400 font-medium">
            Real-time Social Deduction Game
          </p>
          <div className="flex items-center gap-2 mt-4 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
            <div
              className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500 animate-pulse'}`}
            />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              {isConnected ? 'Server Connected' : 'Connecting to Server...'}
            </span>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6 bg-white/5 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl">
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 sm:py-4 px-6 focus:outline-none focus:border-purple-500/50 transition-colors text-base sm:text-lg"
              />
            </div>

            <div className="h-px bg-white/10 my-4 sm:my-6" />

            <div className="space-y-3">
              <button
                onClick={handleCreate}
                disabled={!name || isCreating || !isConnected}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 shadow-xl shadow-blue-500/10 active:scale-95 transition-all disabled:opacity-30 disabled:scale-100"
              >
                <Plus size={20} />
                Create New Room
              </button>

              <div className="flex gap-2 sm:gap-3">
                <input
                  type="text"
                  placeholder="Room Code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-3 sm:py-4 px-4 sm:px-6 focus:outline-none focus:border-blue-500/50 transition-colors text-base sm:text-lg text-center font-mono tracking-widest"
                />
                <button
                  onClick={handleJoin}
                  disabled={!name || !roomCode || !isConnected}
                  className="bg-white/10 hover:bg-white/20 p-3 sm:p-4 rounded-2xl transition-all active:scale-95 disabled:opacity-30"
                >
                  <Search size={20} />
                </button>
              </div>
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm font-medium"
            >
              {error.message}
            </motion.p>
          )}
        </div>

        <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Feature icon={<Users size={20} />} label="3-10 Players" />
          <Feature icon={<MessageSquare size={20} />} label="Real-time Chat" />
          <Feature icon={<Shield size={20} />} label="Secret Roles" />
        </div>
      </motion.div>
    </main>
  )
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="p-3 bg-white/5 rounded-xl text-gray-400">{icon}</div>
      <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500">
        {label}
      </span>
    </div>
  )
}
