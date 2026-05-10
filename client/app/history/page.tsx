'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface GameHistory {
  id: string
  roomId: string
  roomName: string
  role: string
  word: string | null
  winner: string
  isWinner: boolean
  createdAt: string
}

export default function HistoryPage() {
  const router = useRouter()
  const [histories, setHistories] = useState<GameHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/')
          return
        }

        const res = await fetch('http://localhost:3021/auth/me/history', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        if (res.ok) {
          const data = await res.json()
          setHistories(data.histories)
        } else {
          console.error('Failed to fetch history')
        }
      } catch (err) {
        console.error('Error fetching history:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistory()
  }, [router])

  return (
    <div className="min-h-screen bg-[var(--bg-cheerful)] text-black flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-4xl mt-12">
        <div className="flex justify-between items-center mb-8 border-b-[2px] border-black pb-4">
          <h1 className="text-2xl font-black text-black tracking-widest uppercase italic">Match History</h1>
          <button
            onClick={() => router.push('/')}
            className="neo-button bg-[var(--accent)] font-black uppercase text-sm"
          >
            Back to Home
          </button>
        </div>

        {isLoading ? (
          <div className="text-center font-black text-lg uppercase italic animate-pulse">Loading Records...</div>
        ) : histories.length === 0 ? (
          <div className="bg-white neo-border p-6 text-center neo-shadow-sm transform hover:-translate-y-1 transition-transform">
            <h2 className="text-xl font-black uppercase mb-3 italic">No Matches Played</h2>
            <p className="font-bold text-base text-gray-700">Join a game to start recording your history!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {histories.map((history) => (
              <div 
                key={history.id} 
                className={`neo-border p-5 flex flex-col md:flex-row justify-between items-start md:items-center neo-shadow-sm hover:neo-shadow-md transition-all hover:-translate-y-1 ${history.isWinner ? 'bg-[#bbf7d0]' : 'bg-[#fecaca]'}`}
              >
                <div className="mb-4 md:mb-0">
                  <h3 className="text-xl font-black uppercase mb-1 italic">{history.roomName}</h3>
                  <div className="text-xs font-bold text-gray-700">
                    {new Date(history.createdAt).toLocaleString()}
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                  <div className="bg-white neo-border px-4 py-2 flex flex-col items-center w-full md:w-32 neo-shadow-sm">
                    <span className="text-[10px] font-bold uppercase text-gray-600 mb-1">Role</span>
                    <span className="font-black uppercase text-base">{history.role}</span>
                  </div>
                  
                  {history.word && (
                    <div className="bg-white neo-border px-4 py-2 flex flex-col items-center w-full md:w-40 neo-shadow-sm">
                      <span className="text-[10px] font-bold uppercase text-gray-600 mb-1">Word</span>
                      <span className="font-black uppercase text-base truncate w-full text-center">{history.word}</span>
                    </div>
                  )}
                  
                  <div className={`neo-border px-4 py-2 flex flex-col items-center w-full md:w-36 neo-shadow-sm ${history.isWinner ? 'bg-[var(--primary)]' : 'bg-[var(--danger)] text-white'}`}>
                    <span className={`text-[10px] font-bold uppercase mb-1 ${history.isWinner ? 'text-black' : 'text-white'}`}>Result</span>
                    <span className="font-black uppercase text-lg italic">{history.isWinner ? 'Victory' : 'Defeat'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
