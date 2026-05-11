'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, Plus, Sparkles, Users, Zap, ChevronRight, Radio, ArrowRight, PartyPopper, Smile, Gamepad2, Info, X, ChevronLeft, HelpCircle, LogOut, KeyRound, History, Trophy } from 'lucide-react'
import { useGameState } from '../hooks/useGameState'
import { FloatingShape } from '../components/ui/FloatingShape'

export default function Home() {
  const [name, setName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isPublic, setIsPublic] = useState(false)
  const [view, setView] = useState<'landing' | 'play'>('landing')
  const [isGuideOpen, setIsGuideOpen] = useState(false)
  const [guideStep, setGuideStep] = useState(0)
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [authForm, setAuthForm] = useState({ username: '', password: '' })
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [isNameAlertOpen, setIsNameAlertOpen] = useState(false)
  const [codeOrEventState, setCodeOrEventState] = useState<string | React.MouseEvent | undefined>(undefined)
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create')
  
  const [user, setUser] = useState<{ id: string, username: string } | null>(null)
  const [token, setToken] = useState<string | null>(null)

  const router = useRouter()
  const { createRoom, joinRoom, room, isConnected, error, publicRooms, refreshPublicRooms } = useGameState()

  const API_URL = process.env.NEXT_PUBLIC_WS_URL 
    ? process.env.NEXT_PUBLIC_WS_URL.replace(/^ws:/, 'http:').replace(/^wss:/, 'https:') 
    : 'http://localhost:3021'

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      setToken(savedToken)
      fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${savedToken}` }
      }).then(res => res.json()).then(data => {
        if (data.user) {
          setUser(data.user)
          setName(data.user.username)
        } else {
          localStorage.removeItem('token')
        }
      }).catch(err => console.error('Auth check error:', err))
    }
  }, [API_URL])

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    setName('')
  }

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)
    try {
      const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register'
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Authentication failed')
      }
      localStorage.setItem('token', data.token)
      setToken(data.token)
      setUser(data.user)
      setName(data.user.username)
      setIsAuthModalOpen(false)
      setAuthForm({ username: '', password: '' })
    } catch (err: any) {
      setAuthError(err.message)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleCreate = () => {
    if (!name) {
      setIsNameAlertOpen(true)
      return
    }
    createRoom(name, {
      maxPlayers: 8,
      turnDurationSeconds: 60,
      discussionDurationSeconds: 60,
      isPublic: isPublic
    })
    setIsCreating(true)
  }

  const handleJoin = (codeOrEvent?: string | React.MouseEvent) => {
    const targetCode = typeof codeOrEvent === 'string' ? codeOrEvent : roomCode
    if (!name) {
      setIsNameAlertOpen(true)
      setCodeOrEventState(codeOrEvent)
      return
    }
    if (!targetCode) {
      setFormError('KODE RUANGAN BELUM DIISI!')
      setTimeout(() => setFormError(''), 3000)
      return
    }
    joinRoom(targetCode, name)
  }

  useEffect(() => {
    if (room) {
      router.push(`/room/${room.id}`)
    }
  }, [room, router])

  useEffect(() => {
    if (isConnected && view === 'play') {
      refreshPublicRooms()
      const interval = setInterval(refreshPublicRooms, 5000)
      return () => clearInterval(interval)
    }
  }, [view, isConnected, refreshPublicRooms])

  const guideSteps = [
    {
      title: "Civilian",
      icon: <Users className="w-12 h-12 sm:w-16 sm:h-16" strokeWidth={3} />,
      color: "var(--primary)",
      content: "Mereka semua menerima kata rahasia yang sama. Tujuan mereka adalah membuka kedok Undercover & Mr. White."
    },
    {
      title: "Deskripsi",
      icon: <Radio className="w-12 h-12 sm:w-16 sm:h-16" strokeWidth={3} />,
      color: "var(--secondary)",
      content: "Tiap pemain memberikan deskripsi kata mereka. Mr. White harus berimprovisasi. Dengarkan baik-baik, ini adalah kesempatan kamu untuk menemukan peran teman kamu dan peran kamu sendiri!"
    },
    {
      title: "Mr. White",
      icon: <Smile className="w-12 h-12 sm:w-16 sm:h-16" strokeWidth={3} />,
      color: "var(--warning)",
      content: "Dia tidak menerima sepatah kata pun. Tujuannya adalah bertindak seolah-olah dia memiliki kata, sementara mencoba menebak kata Civilian."
    },
    {
      title: "Undercover",
      icon: <Search className="w-12 h-12 sm:w-16 sm:h-16" strokeWidth={3} />,
      color: "var(--danger)",
      content: "Dia menerima kata yang sedikit berbeda dari Civilian. Tujuannya adalah berpura-pura menjadi salah satu dari mereka!"
    },
    {
      title: "Waktu Diskusi",
      icon: <Zap className="w-12 h-12 sm:w-16 sm:h-16" strokeWidth={3} />,
      color: "var(--success)",
      content: "Pemain yang tidak tereliminasi berdiskusi dan saling mempengaruhi untuk memutuskan siapa yang harus dihilangkan! Hilangkan Mr. White dulu! Semakin lama dia tinggal, semakin mudah dia menebak kata Civilian dengan benar dan menang!"
    },
    {
      title: "Voting",
      icon: <Gamepad2 className="w-12 h-12 sm:w-16 sm:h-16" strokeWidth={3} />,
      color: "var(--primary)",
      content: "Pilih pemain yang memiliki peran berbeda dari Anda. Berikan suara Anda dengan mengetuk avatar mereka. Pemain dengan suara terbanyak dieliminasi."
    },
    {
      title: "Kemenangan",
      icon: <PartyPopper className="w-12 h-12 sm:w-16 sm:h-16" strokeWidth={3} />,
      color: "var(--secondary)",
      content: "Civilian menang jika mereka mengeliminasi semua peran lainnya. The Undercover & Mr. White menang ketika hanya ada 1 Civilian yang tersisa. Mr. White juga menang jika mereka menebak kata Civilian."
    }
  ]

  const nextStep = () => {
    if (guideStep < guideSteps.length - 1) setGuideStep(guideStep + 1)
  }

  const prevStep = () => {
    if (guideStep > 0) setGuideStep(guideStep - 1)
  }

  return (
    <main className="min-h-screen bg-[var(--bg-cheerful)] text-black flex flex-col items-center justify-center p-2 sm:p-4 relative overflow-x-hidden overflow-y-auto selection:bg-[var(--secondary)]">
      {/* Top Bar for Auth */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[110] flex items-center gap-2 sm:gap-4">
        <button 
          onClick={() => router.push('/leaderboard')} 
          className="neo-button bg-[var(--primary)] text-black p-2 neo-shadow-sm group hover:bg-white hover:text-[var(--primary)] transition-colors"
          title="Leaderboard"
        >
           <Trophy className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
        {user ? (
          <div className="flex items-center gap-2">
            <span className="neo-badge bg-[var(--primary)] text-sm sm:text-base px-4 py-2 italic tracking-widest font-black neo-shadow-sm flex items-center gap-2">
              <Smile className="w-4 h-4" />
              {user.username.toUpperCase()}
            </span>
            <button 
              onClick={() => router.push('/history')} 
              className="neo-button bg-[var(--accent)] text-black p-2 neo-shadow-sm group hover:bg-white hover:text-[var(--accent)] transition-colors"
              title="History"
            >
               <History className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
            <button 
              onClick={handleLogout} 
              className="neo-button bg-[var(--danger)] text-white p-2 neo-shadow-sm group hover:bg-white hover:text-[var(--danger)] transition-colors"
              title="Logout"
            >
               <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }}
            className="neo-button bg-[var(--primary)] px-4 py-2 font-black italic uppercase tracking-wider text-xs neo-shadow-sm hover:bg-white hover:text-[var(--primary)] transition-colors flex items-center gap-2"
          >
            <KeyRound className="w-3.5 h-3.5" />
            LOGIN / DAFTAR
          </button>
        )}
      </div>

      {/* Premium Decorative Accents */}
      <div className="fixed top-0 left-0 w-full h-4 neo-strip z-[100]" />
      <div className="fixed bottom-0 left-0 w-full h-4 neo-strip-secondary z-[100]" />
      
      {/* Background patterns and shapes */}
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none bg-grid-pattern" />
      
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <FloatingShape color="var(--primary)" size={100} top="-5%" left="-5%" delay={0} rotate={12} shape="circle" opacity={0.4} />
        <FloatingShape color="var(--secondary)" size={80} top="10%" right="-5%" delay={1} rotate={-15} shape="square" opacity={0.4} />
        <FloatingShape color="var(--success)" size={90} bottom="5%" left="-5%" delay={2} rotate={25} shape="triangle" opacity={0.4} />
        <FloatingShape color="var(--warning)" size={110} bottom="-10%" right="-5%" delay={3} rotate={-5} shape="circle" opacity={0.4} />
        <FloatingShape color="var(--danger)" size={60} top="45%" right="5%" delay={1.5} rotate={45} shape="square" opacity={0.3} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 min-h-screen w-full max-w-4xl px-4 flex flex-col justify-center items-center"
      >
        {view === "landing" && (
          <header className="mb-12 sm:mb-20 mt-8 sm:mt-12 flex flex-col items-center text-center relative w-full gap-10 sm:gap-14">
            <motion.div 
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: -12 }}
              whileHover={{ scale: 1.1, rotate: 10 }}
              className="w-16 h-16 sm:w-20 sm:h-20 bg-[var(--secondary)] neo-border neo-shadow flex items-center justify-center mb-4 transition-transform cursor-pointer relative"
            >
              <PartyPopper className="w-8 h-8 sm:w-10 sm:h-10 text-black" strokeWidth={3} />
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-8 h-8 sm:w-10 sm:h-10 bg-[var(--success)] neo-border rounded-full flex items-center justify-center"             >
                <Sparkles className="w-4 lg:w-5 h-4 lg:h-5 text-black" fill="currentColor" />
              </motion.div>
            </motion.div>
            
            <div className="relative mb-2">
              <h1 
                className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-3 uppercase leading-[0.8] relative z-10 neo-text-layered neo-text-glow"
                data-text="UNDERCOVER"
              >
                UNDERCOVER
              </h1>
              <h2 className="text-sm sm:text-base md:text-lg font-black text-[var(--success)] tracking-tighter uppercase transform -rotate-2 relative z-20 mt-[-0.2rem]">
                <span className="relative inline-block drop-shadow-[3px_3px_0px_var(--secondary)]">
                  PESTA GAME
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '115%' }}
                    transition={{ delay: 0.8, duration: 1 }}
                    className="absolute -bottom-1.5 -left-[7.5%] h-2 bg-[var(--primary)] -z-10 rotate-1 neo-border-b"
                  />
                </span>
              </h2>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, type: 'spring' }}
                className="absolute -top-6 -right-12 hidden lg:block"
              >
                <div className="bg-[var(--warning)] neo-border neo-shadow-sm px-5 py-2.5 rotate-12 font-black text-sm uppercase flex flex-col items-center gap-1 leading-tight">
                  <span className="text-3xl">🔥</span>
                  <span>WAKTUNYA</span>
                  <span className="text-white">PESTA!</span>
                </div>
              </motion.div>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-8 sm:mt-12">
              <motion.span 
                className="neo-badge bg-[var(--secondary)] py-1 px-3 sm:py-1.5 sm:px-4 text-[10px] sm:text-xs md:text-sm rotate-1 cursor-default neo-shadow-sm"
              >
                SERU-SERUAN
              </motion.span>
              <motion.span 
                whileHover={{ scale: 1.1, rotate: -3 }}
                className="neo-badge bg-[var(--warning)] py-1 px-3 sm:py-1.5 sm:px-4 text-[10px] sm:text-xs md:text-sm -rotate-1 cursor-default neo-shadow-sm"
              >
                MAIN BARENG TEMAN
              </motion.span>
              <motion.span 
                whileHover={{ scale: 1.1, rotate: 2 }}
                className="neo-badge bg-white py-1 px-3 sm:py-1.5 sm:px-4 text-[10px] sm:text-xs md:text-sm rotate-2 cursor-default neo-shadow-sm"
              >
                GRATIS SELAMANYA
              </motion.span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-10 sm:mt-12 w-full max-w-[500px]">
              <button 
                onClick={() => setView('play')}
                className="neo-button flex-1 w-full bg-white text-sm sm:text-base py-3.5 px-8 h-auto hover:bg-[var(--primary)] font-black tracking-widest active:translate-y-1 active:shadow-none transition-colors neo-pop"
              >
                MULAI BERMAIN
              </button>
              <button 
                onClick={() => {
                  setGuideStep(0)
                  setIsGuideOpen(true)
                }}
                className="neo-button flex-1 w-full bg-[var(--secondary)] text-sm sm:text-base py-3.5 px-8 h-auto hover:bg-white font-black tracking-widest active:translate-y-1 active:shadow-none transition-colors neo-pop flex items-center justify-center gap-2"
              >
                <HelpCircle className="w-5 h-5" strokeWidth={3} />
                CARA BERMAIN
              </button>
            </div>
          </header>
        )}

        {view === "play" && (
          <>
            <div className="grid grid-cols-1 gap-6 lg:gap-10 w-full items-stretch mb-8 pt-20 sm:pt-24">
              {/* Main Action Card */}
              <div className="bg-white p-4 sm:p-5 neo-card relative overflow-hidden flex flex-col justify-between border-t-[4px] border-t-[var(--primary)]">
                <div className="neo-accent-corner-tl opacity-50" />
                <div className="neo-accent-corner-tr opacity-50" />
                <div className="neo-accent-corner-bl opacity-10" />
                <div className="neo-accent-corner-br opacity-10" />
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none animate-spin-slow">
                  <Smile className="w-20 h-20 sm:w-32 sm:h-32 rotate-12" />
                </div>
                
                <div className="space-y-6 lg:space-y-8 relative z-10">
                  <div className="space-y-6 sm:space-y-8">
                    <div className="flex items-center justify-between gap-4">
                      <label className="flex items-center gap-2 text-left text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-black italic leading-none">
                        <Smile className="w-4 lg:w-5 h-4 lg:h-5 text-[var(--secondary)]" strokeWidth={3} /> SIAPA KAMU?
                      </label>
                      <motion.div 
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-[9px] sm:text-[10px] font-black uppercase bg-[var(--primary)] text-black px-3 py-1 sm:px-4 sm:py-1.5 neo-border-sm neo-shadow-sm whitespace-nowrap"
                      >
                        WAJIB ISI
                      </motion.div>
                    </div>
                    <div className="relative group">
                      <input
                        id="name-input"
                        type="text"
                        placeholder="PILIH NAMA KERENMU..."
                        value={user ? user.username : name}
                        onChange={(e) => !user && setName(e.target.value)}
                        disabled={!!user}
                        className="w-full neo-input text-sm sm:text-base py-3 px-4 uppercase placeholder:text-black/10 font-black focus:bg-[var(--bg-cheerful)] transition-all italic tracking-tighter disabled:opacity-60"
                      />
                      <div className="absolute top-1/2 -translate-y-1/2 right-4 opacity-10 group-focus-within:opacity-40 transition-opacity">
                        <Gamepad2 className="w-4 lg:w-5 h-4 lg:h-5 text-black" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 py-1 sm:py-2">
                    <div className="h-[2px] bg-black/10 flex-1 neo-border-b-sm border-black/5" />
                    <div className="text-xs sm:text-sm font-black text-black/60 uppercase tracking-[0.3em] italic whitespace-nowrap">OPSI PESTA</div>
                    <div className="h-[2px] bg-black/10 flex-1 neo-border-b-sm border-black/5" />
                  </div>

                  <div className="flex p-1 bg-[var(--neutral)] neo-border neo-shadow-sm mb-4">
                    <button
                      onClick={() => setActiveTab('create')}
                      className={`flex-1 py-3 px-4 font-black uppercase italic tracking-tighter text-sm transition-all flex items-center justify-center gap-2 ${
                        activeTab === 'create'
                          ? 'bg-[var(--primary)] text-black neo-border-sm'
                          : 'text-black/40 hover:text-black'
                      }`}
                    >
                      <Plus className="w-4 h-4" strokeWidth={4} />
                      BUAT PESTA
                    </button>
                    <button
                      onClick={() => setActiveTab('join')}
                      className={`flex-1 py-3 px-4 font-black uppercase italic tracking-tighter text-sm transition-all flex items-center justify-center gap-2 ${
                        activeTab === 'join'
                          ? 'bg-[var(--secondary)] text-black neo-border-sm'
                          : 'text-black/40 hover:text-black'
                      }`}
                    >
                      <ArrowRight className="w-4 h-4" strokeWidth={4} />
                      GABUNG PESTA
                    </button>
                  </div>

                  <div className="min-h-[140px]">
                    <AnimatePresence mode="wait">
                      {activeTab === 'create' ? (
                        <motion.div
                          key="create-form"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="space-y-6"
                        >
                          <label className="flex items-center gap-3 cursor-pointer p-3 sm:p-4 bg-[var(--neutral)] neo-border hover:bg-white transition-all group active:translate-y-1 hover:neo-shadow-md border-l-[6px] border-l-[var(--success)] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-12 h-full neo-strip opacity-10" />
                            <div className="relative w-6 h-6 shrink-0">
                              <input 
                                type="checkbox" 
                                checked={isPublic} 
                                onChange={(e) => setIsPublic(e.target.checked)}
                                className="peer absolute inset-0 opacity-0 cursor-pointer z-10"
                              />
                              <div className="w-6 h-6 neo-border bg-white peer-checked:bg-[var(--success)] flex items-center justify-center transition-colors neo-shadow-sm peer-active:shadow-none peer-active:translate-x-[1px] peer-active:translate-y-[1px]">
                                <motion.div 
                                  animate={{ scale: isPublic ? 1 : 0 }}
                                  className="w-3 h-3 bg-black rounded-sm"
                                />
                              </div>
                            </div>
                            <div className="flex flex-col relative z-10 gap-0.5">
                              <span className="text-sm sm:text-base font-black uppercase tracking-wider select-none group-hover:text-[var(--success)] transition-colors">Tampilkan di Lobi</span>
                              <span className="text-[10px] sm:text-xs font-bold opacity-30 uppercase tracking-tighter leading-tight">Izinkan pemain lain untuk bergabung</span>
                            </div>
                          </label>
                          
                          <button
                            onClick={() => handleCreate()}
                            disabled={isCreating || !isConnected}
                            className="w-full neo-button bg-[var(--primary)] text-black min-h-[56px] sm:min-h-[64px] flex flex-col gap-0.5 items-center justify-center group relative overflow-hidden animate-shimmer neo-pop"
                          >
                            <div className="flex items-center gap-2 relative z-10 font-black italic tracking-tighter text-lg lg:text-xl">
                              <Plus className="w-4 lg:w-5 h-4 lg:h-5" strokeWidth={4} />
                              <span>MULAI PESTA BARU</span>
                            </div>
                          </button>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="join-form"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-6"
                        >
                          <div className="relative group">
                            <input
                              type="text"
                              placeholder="KODE"
                              value={roomCode}
                              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                              maxLength={6}
                              className="w-full neo-input text-xl sm:text-2xl text-center font-mono tracking-[0.3em] uppercase py-3 sm:py-4 bg-[var(--neutral)] group-focus-within:bg-white group-focus-within:neo-shadow-md transition-all placeholder:opacity-10"
                            />
                            <div className="absolute -top-3 left-3 bg-black text-white text-[9px] sm:text-[10px] px-3 py-1 font-black uppercase tracking-[0.2em] italic neo-shadow-sm leading-none whitespace-nowrap">
                              KODE GABUNGAN
                            </div>
                          </div>
                          <button
                            onClick={() => handleJoin()}
                            disabled={!roomCode || !isConnected}
                            className="w-full neo-button bg-[var(--secondary)] min-h-[56px] sm:min-h-[64px] flex items-center justify-center gap-2 group animate-shimmer neo-pop"
                          >
                            <ArrowRight className="w-4 lg:w-5 h-4 lg:h-5 group-hover:translate-x-2 transition-transform duration-500" strokeWidth={4} />
                            <span className="text-lg lg:text-xl font-black italic tracking-tighter">MASUK KE PESTA</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>


                {(error || formError) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="bg-[var(--danger)] text-white p-3 neo-border neo-shadow-sm font-black text-xs mt-6 uppercase tracking-wider flex items-center gap-3 rotate-1"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white flex items-center justify-center text-[var(--danger)] shrink-0 neo-border-sm animate-wiggle">
                      <Zap className="w-5 h-5 lg:w-6 lg:h-6" fill="currentColor" />
                    </div>
                    <div className="flex flex-col text-left gap-0.5">
                      <span className="text-[10px] sm:text-xs opacity-80 italic font-black">ADA MASALAH!</span>
                      <span className="text-base sm:text-lg leading-tight tracking-tight">{error?.message || formError}</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="w-full pb-32">
              <motion.div 
                key="browse"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6 flex-1 flex flex-col"
              >
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg sm:text-xl font-black uppercase tracking-tighter flex items-center gap-2 sm:gap-3 italic neo-text-glow">
                    <Radio className="text-[var(--secondary)] animate-pulse w-5 h-5 lg:w-6 lg:h-6" strokeWidth={4} />
                    PESTA YANG TERBUKA
                  </h2>
                  <button 
                    onClick={refreshPublicRooms}
                    className="neo-button bg-white text-[10px] sm:text-xs py-2 px-4 sm:px-6 h-auto hover:bg-[var(--primary)] font-black tracking-widest active:translate-y-1 active:shadow-none transition-colors neo-pop"
                  >
                    SEGARKAN
                  </button>
                </div>

                <div className="flex-1 bg-white neo-border p-4 sm:p-6 min-h-[250px] flex flex-col neo-shadow bg-grid-pattern bg-[length:20px_20px] relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/70 pointer-events-none" />
                  
                  {publicRooms.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 relative z-10 gap-3">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 bg-[var(--bg-cheerful)] neo-border flex items-center justify-center mb-1 rounded-full opacity-40 neo-shadow-sm"
                      >
                        <Search className="w-8 h-8 lg:w-10 lg:h-10 text-black" strokeWidth={1.5} />
                      </motion.div>
                      <p className="text-lg font-black uppercase text-black tracking-tighter italic">BELUM ADA PESTA!</p>
                      <p className="text-[10px] sm:text-xs uppercase font-bold text-black/30 max-w-[200px] leading-relaxed">Sepertinya semua orang sedang sibuk. Yuk mulai pestamu sendiri!</p>
                    </div>
                  ) : (
                    <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar flex-1 relative z-10">
                      {publicRooms.map((r, i) => (
                        <motion.div
                          key={r.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          whileHover={{ x: 10, scale: 1.01 }}
                          className="bg-white p-3 sm:p-4 neo-border neo-shadow flex items-center justify-between group cursor-pointer border-l-[10px] border-l-[var(--primary)] relative overflow-hidden"
                          onClick={() => handleJoin(r.id)}
                        >
                          <div className="absolute top-0 right-0 w-32 h-full neo-strip opacity-[0.03]" />
                          <div className="flex-1 min-w-0 pr-4 text-left relative z-10 flex flex-col gap-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] sm:text-xs font-black uppercase text-white bg-black px-2 py-1 sm:px-3 sm:py-1.5 neo-border-sm tracking-[0.1em]">{r.id}</span>
                                <span className="text-lg sm:text-xl font-black uppercase truncate tracking-tighter italic group-hover:text-[var(--secondary)] transition-colors">RUANGAN {r.name.toUpperCase()}</span>
                              </div>
                            <div className="flex items-center gap-4">
                              <div className="neo-badge bg-[var(--success)] px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm italic neo-shadow-sm leading-none h-auto gap-2">
                                <Users className="w-4 lg:w-5 h-4 lg:h-5 text-black" strokeWidth={4} />
                                <span>{r.playerCount} / {r.maxPlayers}</span>
                              </div>
                              <span className="text-[10px] sm:text-xs font-black uppercase text-black/40 italic flex items-center gap-2 tracking-[0.1em]">
                                <div className="w-2 h-2 bg-[var(--success)] rounded-full animate-pulse shadow-[0_0_6px_var(--success)]" />
                                SEDANG AKTIF
                              </span>
                            </div>
                          </div>
                          <div className="neo-button bg-[var(--secondary)] p-2 sm:p-3 group-hover:rotate-12 transition-transform neo-shadow-sm relative z-10 neo-pop shrink-0">
                            <ChevronRight className="w-5 lg:w-6 h-5 lg:h-6 text-black" strokeWidth={5} />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}

        {/* <footer className="mt-12 mb-6 py-8 border-t-[2px] border-[var(--border)] w-full flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left relative">
          <div className="absolute top-[-5px] left-0 w-12 h-[5px] bg-[var(--primary)]" />
          <div className="absolute top-[-5px] right-0 w-12 h-[5px] bg-[var(--secondary)]" />

          <div className="flex flex-wrap justify-center gap-3">
             {[Trophy, Users, PartyPopper, Smile].map((Icon, i) => (
               <motion.div 
                 key={i}
                 whileHover={{ y: -6, rotate: i % 2 === 0 ? -15 : 15, scale: 1.2 }} 
                 className={`w-12 h-12 neo-border neo-shadow-sm flex items-center justify-center cursor-help transition-all ${
                   i === 0 ? 'bg-[var(--primary)]' : i === 1 ? 'bg-[var(--secondary)]' : i === 2 ? 'bg-[var(--success)]' : 'bg-[var(--warning)]'
                 }`}
               >
                 <Icon size={24} strokeWidth={3} />
               </motion.div>
             ))}
          </div>

          <div className="text-sm font-black uppercase tracking-[0.2em] text-black/50 lg:max-w-[300px] leading-tight italic">
            CRAFTED WITH <span className="text-black bg-[var(--primary)] px-4 py-2 neo-border-sm mx-1 not-italic neo-shadow-sm">JOY</span> BY THE PARTIERS
          </div>
        </footer>
        <div className="w-full flex flex-row items-center justify-center text-center">
          <div className="flex flex-col gap-1">
            <h4 className="text-lg font-black uppercase tracking-tighter drop-shadow-[2px_2px_0px_var(--secondary)] italic">UNDERCOVER ONLINE</h4>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-black/30">
              &copy; 2026 FUN PARTY SYSTEM • SOCIAL CHAOS
            </p>
          </div>
        </div> */}
      </motion.div>

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white w-full max-w-md neo-card relative z-10 overflow-hidden flex flex-col border-t-[4px] border-t-[var(--primary)]"
          >
            <div className="bg-black text-white p-4 sm:p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <KeyRound className="w-6 h-6 text-[var(--primary)]" strokeWidth={3} />
                <h3 className="font-black uppercase tracking-tighter text-xl sm:text-2xl italic leading-none">
                  {authMode === 'login' ? 'LOGIN' : 'DAFTAR'}
                </h3>
              </div>
              <button 
                onClick={() => setIsAuthModalOpen(false)}
                className="w-10 h-10 bg-white/10 hover:bg-white/20 neo-border-sm flex items-center justify-center transition-colors"
              >
                <X className="w-6 h-6" strokeWidth={3} />
              </button>
            </div>

            <div className="p-6 sm:p-8 flex flex-col gap-6">
              {authError && (
                <div className="bg-[var(--danger)] text-white p-3 font-bold text-sm neo-border-sm italic uppercase flex items-center gap-2">
                  <Zap className="w-4 h-4 shrink-0" />
                  {authError}
                </div>
              )}
              
              <form onSubmit={handleAuthSubmit} className="flex flex-col gap-5">
                <div className="space-y-2">
                  <label className="font-black uppercase tracking-widest text-sm text-black/60">USERNAME</label>
                  <input 
                    type="text" 
                    value={authForm.username}
                    onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                    required
                    maxLength={20}
                    className="w-full neo-input py-3 px-4 font-bold text-lg focus:bg-[var(--bg-cheerful)] transition-colors"
                    placeholder="Masukkan nama kerenmu"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-black uppercase tracking-widest text-sm text-black/60">PASSWORD</label>
                  <input 
                    type="password" 
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    required
                    className="w-full neo-input py-3 px-4 font-bold text-lg focus:bg-[var(--bg-cheerful)] transition-colors"
                    placeholder="Rahasia tingkat tinggi"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={authLoading}
                  className="neo-button w-full bg-[var(--primary)] text-black mt-2 py-4 font-black text-lg tracking-widest italic flex justify-center items-center gap-2 hover:bg-black hover:text-white transition-colors disabled:opacity-50"
                >
                  {authLoading ? 'TUNGGU...' : (authMode === 'login' ? 'MASUK' : 'BUAT AKUN')}
                </button>
              </form>

              <div className="text-center mt-2 border-t-[2px] border-black/10 pt-6">
                <p className="font-bold text-sm text-black/60 mb-3 uppercase tracking-wider">
                  {authMode === 'login' ? 'BELUM PUNYA AKUN?' : 'SUDAH PUNYA AKUN?'}
                </p>
                <button 
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === 'login' ? 'register' : 'login')
                    setAuthError('')
                  }}
                  className="neo-badge bg-[var(--secondary)] text-sm px-6 py-2 hover:scale-105 transition-transform"
                >
                  {authMode === 'login' ? 'DAFTAR SEKARANG' : 'LOGIN SAJA'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Name Alert Modal */}
      {isNameAlertOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsNameAlertOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white w-full max-w-[340px] neo-card relative z-10 overflow-hidden flex flex-col border-t-[4px] border-t-[var(--danger)]"
          >
            <div className="bg-black text-white p-4 sm:p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6 text-[var(--danger)]" strokeWidth={3} />
                <h3 className="font-black uppercase tracking-tighter text-xl sm:text-2xl italic leading-none">
                  TUNGGU DULU!
                </h3>
              </div>
              <button 
                onClick={() => setIsNameAlertOpen(false)}
                className="w-10 h-10 bg-white/10 hover:bg-white/20 neo-border-sm flex items-center justify-center transition-colors"
              >
                <X className="w-6 h-6" strokeWidth={3} />
              </button>
            </div>

            <div className="p-4 sm:p-6 flex flex-col gap-4 text-center">
              <div className="flex justify-center">
                <Smile className="w-12 h-12 text-[var(--danger)] -rotate-12" />
              </div>
              <p className="font-black text-base uppercase tracking-wider text-black/40 italic">
                SIAPA NAMA KAMU?
              </p>
              
              <div className="relative group">
                <input
                  autoFocus
                  type="text"
                  placeholder="MASUKKAN NAMAMU..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && name.trim()) {
                      setIsNameAlertOpen(false);
                    }
                  }}
                  className="w-full neo-input text-base sm:text-lg py-3 px-4 uppercase placeholder:text-black/10 font-black focus:bg-[var(--bg-cheerful)] transition-all italic tracking-tighter"
                />
                <div className="absolute top-1/2 -translate-y-1/2 right-4 opacity-10">
                  <Gamepad2 className="w-5 lg:w-7 h-5 lg:h-7 text-black" />
                </div>
              </div>

              <button 
                onClick={() => {
                  if (name.trim()) {
                    handleJoin(codeOrEventState)
                    setIsNameAlertOpen(false)
                  }
                }}
                disabled={!name.trim()}
                className="neo-button w-full bg-[var(--primary)] text-black py-3 font-black text-base tracking-widest italic flex justify-center items-center gap-2 hover:bg-white transition-colors disabled:opacity-50 disabled:grayscale"
              >
                OKE, SIAP!
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Guide Modal */}
      {isGuideOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsGuideOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white w-full max-w-lg neo-card relative z-10 overflow-hidden flex flex-col"
          >
            {/* Modal Header */}
            <div className="bg-black text-white p-4 sm:p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Info className="w-6 h-6 text-[var(--primary)]" strokeWidth={3} />
                <h3 className="font-black uppercase tracking-tighter text-xl sm:text-2xl italic leading-none">PANDUAN GAME</h3>
              </div>
              <button 
                onClick={() => setIsGuideOpen(false)}
                className="w-10 h-10 bg-white/10 hover:bg-white/20 neo-border-sm flex items-center justify-center transition-colors"
              >
                <X className="w-6 h-6" strokeWidth={3} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-10 flex flex-col items-center text-center gap-8">
              <div className="relative">
                <motion.div 
                  key={guideStep}
                  initial={{ scale: 0, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  style={{ backgroundColor: guideSteps[guideStep].color }}
                  className="w-24 h-24 sm:w-32 sm:h-32 neo-border neo-shadow flex items-center justify-center"
                >
                  {guideSteps[guideStep].icon}
                </motion.div>
                <div className="absolute -top-3 -right-3 bg-black text-white px-3 py-1 font-black text-xs sm:text-sm neo-border-sm italic">
                  {guideStep + 1} / {guideSteps.length}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter italic leading-none">
                  {guideSteps[guideStep].title}
                </h4>
                <p className="text-sm sm:text-lg font-bold uppercase text-black/60 leading-relaxed tracking-tight">
                  {guideSteps[guideStep].content}
                </p>
              </div>

              {/* Progress dots */}
              <div className="flex gap-2">
                {guideSteps.map((_, i) => (
                  <div 
                    key={i}
                    className={`h-2 transition-all duration-300 ${i === guideStep ? 'w-8 bg-black' : 'w-2 bg-black/10'} neo-border-sm`}
                  />
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 sm:p-8 bg-[var(--neutral)] border-t-[4px] border-black flex gap-4">
              <button 
                onClick={prevStep}
                disabled={guideStep === 0}
                className={`neo-button flex-1 py-4 px-6 font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-opacity ${guideStep === 0 ? 'opacity-30 cursor-not-allowed' : 'bg-white hover:bg-[var(--primary)]'}`}
              >
                <ChevronLeft className="w-5 h-5" strokeWidth={4} />
                <span>KEMBALI</span>
              </button>
              
              <button 
                onClick={guideStep === guideSteps.length - 1 ? () => setIsGuideOpen(false) : nextStep}
                className="neo-button flex-1 py-4 px-6 bg-[var(--secondary)] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white transition-colors"
              >
                <span>{guideStep === guideSteps.length - 1 ? "MENGERTI!" : "LANJUT"}</span>
                {guideStep !== guideSteps.length - 1 && <ChevronRight className="w-5 h-5" strokeWidth={4} />}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </main>

  )
}

function Feature({ icon, label, desc, color, rotate }: { icon: React.ReactNode; label: string; desc: string; color: string; rotate: number }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02, x: 12, rotate: rotate * 0.5 }}
      style={{ rotate: `${rotate}deg` }}
      className="flex items-center gap-4 p-4 bg-white neo-card group cursor-default relative overflow-hidden h-full border-l-[8px] border-l-[var(--border)] transition-all"
    >
      <div className="absolute top-0 left-0 w-full h-full bg-black/0 group-hover:bg-black/[0.02] transition-colors pointer-events-none" />
      <div className="absolute top-0 right-0 w-24 h-full neo-strip opacity-[0.03] group-hover:opacity-6 transition-opacity" />
      
      <div 
        className="p-3 neo-border neo-shadow-sm transition-transform group-hover:scale-105 group-hover:-rotate-6 shrink-0 flex items-center justify-center relative z-10" 
        style={{ backgroundColor: color }}
      >
        <div className="scale-100">
          {icon}
        </div>
      </div>
      <div className="flex flex-col text-left relative z-10">
        <span className="text-lg font-black uppercase tracking-tighter leading-none mb-1 group-hover:text-[var(--secondary)] transition-colors italic">
          {label}
        </span>
        <span className="text-sm font-bold uppercase opacity-30 tracking-[0.1em] leading-tight">
          {desc}
        </span>
      </div>
    </motion.div>
  )
}
