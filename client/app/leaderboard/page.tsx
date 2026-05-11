'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Medal, Crown, ArrowLeft, Users, Ghost, Search, Filter } from 'lucide-react'
import { FloatingShape } from '../../components/ui/FloatingShape'

interface LeaderboardEntry {
  userId: string
  username: string
  wins: number
}

type LeaderboardRole = 'all' | 'civilian' | 'undercover' | 'mrwhite'

export default function LeaderboardPage() {
  const router = useRouter()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeRole, setActiveRole] = useState<LeaderboardRole>('all')

  const API_URL = process.env.NEXT_PUBLIC_WS_URL 
    ? process.env.NEXT_PUBLIC_WS_URL.replace(/^ws:/, 'http:').replace(/^wss:/, 'https:') 
    : 'http://localhost:3021'

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true)
      try {
        const url = activeRole === 'all' 
          ? `${API_URL}/api/leaderboard` 
          : `${API_URL}/api/leaderboard?role=${activeRole}`
        
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          setLeaderboard(data.leaderboard)
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
  }, [activeRole, API_URL])

  const roles = [
    { id: 'all', label: 'Global', icon: <Trophy className="w-4 h-4" />, color: 'var(--primary)' },
    { id: 'civilian', label: 'Civilian', icon: <Users className="w-4 h-4" />, color: 'var(--success)' },
    { id: 'undercover', label: 'Undercover', icon: <Search className="w-4 h-4" />, color: 'var(--danger)' },
    { id: 'mrwhite', label: 'Mr. White', icon: <Ghost className="w-4 h-4" />, color: 'var(--warning)' },
  ]

  return (
    <main className="min-h-screen bg-[var(--bg-cheerful)] text-black p-4 sm:p-8 relative overflow-x-hidden flex flex-col items-center">
      {/* Decorative Background Elements */}
      <FloatingShape color="var(--primary)" size={120} top="10%" left="5%" delay={0} shape="circle" />
      <FloatingShape color="var(--secondary)" size={80} bottom="15%" right="10%" delay={2} shape="square" rotate={45} />
      <FloatingShape color="var(--success)" size={60} top="20%" right="15%" delay={4} shape="triangle" />
      <div className="absolute inset-0 bg-dot-pattern opacity-10 pointer-events-none" />

      <div className="w-full max-w-2xl z-10 mt-12 sm:mt-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="neo-button bg-white p-3 neo-shadow-sm hover:bg-[var(--secondary)] transition-colors group"
              title="Kembali"
            >
              <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </button>
            <h1 className="text-4xl sm:text-5xl font-black uppercase italic tracking-tighter" data-text="LEADERBOARD">
              LEADERBOARD
            </h1>
          </div>
          
          <div className="hidden sm:flex items-center gap-2 bg-white neo-border px-4 py-2 neo-shadow-sm">
            <Trophy className="w-5 h-5 text-[var(--primary)]" />
            <span className="font-black text-sm italic uppercase">Top 20 Legends</span>
          </div>
        </div>

        {/* Role Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setActiveRole(role.id as LeaderboardRole)}
              className={`neo-button text-xs sm:text-sm flex items-center justify-center gap-2 py-4 transition-all ${
                activeRole === role.id 
                ? 'translate-x-[2px] translate-y-[2px] shadow-none' 
                : ''
              }`}
              style={{ 
                backgroundColor: activeRole === role.id ? role.color : 'white',
              }}
            >
              <span className="flex-shrink-0">{role.icon}</span>
              <span className="font-black uppercase tracking-wider">{role.label}</span>
            </button>
          ))}
        </div>

        {/* Leaderboard Table Content */}
        <div className="bg-white neo-border neo-shadow-lg overflow-hidden mb-12">
          <div className="bg-black text-white p-4 flex justify-between font-black uppercase text-sm italic tracking-widest border-b-[2px] border-black">
            <span className="flex-1">Rank & Player</span>
            <span>Total Wins</span>
          </div>

          <div className="divide-y-[2px] divide-black">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-16 text-center"
                >
                  <div className="inline-block animate-spin mb-6">
                    <Trophy className="w-16 h-16 text-[var(--primary)]" strokeWidth={3} />
                  </div>
                  <p className="font-black uppercase italic text-xl tracking-widest">Memuat Legenda...</p>
                </motion.div>
              ) : leaderboard.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-16 text-center"
                >
                  <div className="mb-4 opacity-20 flex justify-center">
                    <Users className="w-16 h-16" />
                  </div>
                  <p className="font-black uppercase italic text-gray-500">Belum ada data kemenangan di kategori ini</p>
                </motion.div>
              ) : (
                <motion.div
                  key={activeRole}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {leaderboard.map((entry, index) => {
                    const rank = index + 1
                    return (
                      <motion.div 
                        key={entry.userId}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-5 flex items-center justify-between hover:bg-[var(--neutral)] transition-colors group ${
                          rank === 1 ? 'bg-[#fffbeb]' : 
                          rank === 2 ? 'bg-[#f8fafc]' : 
                          rank === 3 ? 'bg-[#fff7ed]' : 'white'
                        }`}
                      >
                        <div className="flex items-center gap-5">
                          <div className={`w-12 h-12 flex items-center justify-center neo-border font-black text-xl transition-transform group-hover:scale-110 ${
                            rank === 1 ? 'bg-[var(--primary)] rotate-3' : 
                            rank === 2 ? 'bg-gray-200 -rotate-3' : 
                            rank === 3 ? 'bg-[#fb923c] rotate-2' : 'bg-white'
                          }`}>
                            {rank === 1 ? <Crown className="w-6 h-6" /> : rank}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black uppercase text-xl truncate max-w-[150px] sm:max-w-[300px] tracking-tight">
                              {entry.username}
                            </span>
                            {rank <= 3 && (
                              <span className="text-[10px] font-black text-gray-500 uppercase italic">
                                {rank === 1 ? 'Maha Legenda' : rank === 2 ? 'Ksatria Elite' : 'Pejuang Tangguh'}
                              </span>
                            )}
                          </div>
                          {rank <= 3 && (
                            <Medal className={`w-6 h-6 ${
                              rank === 1 ? 'text-[var(--primary)]' : 
                              rank === 2 ? 'text-gray-400' : 
                              'text-[#c2410c]'
                            }`} />
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-3xl font-black italic tabular-nums">{entry.wins}</span>
                          <div className="flex flex-col">
                             <span className="text-[10px] font-black uppercase text-gray-500 leading-none">Total</span>
                             <span className="text-[10px] font-black uppercase text-gray-500 leading-none">Wins</span>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Info Box */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex items-center gap-4 bg-white neo-border p-6 neo-shadow-md relative overflow-hidden"
        >
          <div className="bg-[var(--secondary)] p-3 neo-border neo-shadow-sm z-10">
            <Filter className="w-6 h-6" />
          </div>
          <div className="z-10">
            <h4 className="font-black uppercase text-sm mb-1 italic">Sistem Pemeringkatan</h4>
            <p className="text-xs font-bold uppercase leading-relaxed text-gray-700">
              Leaderboard dihitung berdasarkan jumlah kemenangan total di setiap peran. 
              Data diperbarui secara realtime setelah setiap permainan selesai.
            </p>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-24 neo-strip-secondary opacity-10 pointer-events-none" />
        </motion.div>
      </div>
    </main>
  )
}
