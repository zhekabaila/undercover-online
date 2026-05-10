'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, Plus, Sparkles, Users, Zap, ChevronRight, Radio, ArrowRight, PartyPopper, Smile, Gamepad2 } from 'lucide-react'
import { useGameState } from '../hooks/useGameState'
import { FloatingShape } from '../components/ui/FloatingShape'

export default function Home() {
  const [name, setName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isPublic, setIsPublic] = useState(false)
  const [view, setView] = useState<'landing' | 'play'>('landing')
  const router = useRouter()
  const { createRoom, joinRoom, room, isConnected, error, publicRooms, refreshPublicRooms } = useGameState()

  const handleCreate = () => {
    if (!name) return
    createRoom(name, {
      maxPlayers: 8,
      turnDurationSeconds: 60,
      discussionDurationSeconds: 60,
      isPublic: isPublic
    })
    setIsCreating(true)
  }

  const handleJoin = (codeOrEvent?: string | React.MouseEvent) => {
    console.log("neo-shadow-sm relative z-10 neo", codeOrEvent)
    const targetCode = typeof codeOrEvent === 'string' ? codeOrEvent : roomCode
    if (!name || !targetCode) return
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

  return (
    <main className="min-h-screen bg-[var(--bg-cheerful)] text-black flex flex-col items-center justify-center p-2 sm:p-4 relative overflow-x-hidden overflow-y-auto selection:bg-[var(--secondary)]">
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
          <header className="mb-10 mt-4 flex flex-col items-center text-center relative w-full gap-8">
            <motion.div 
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: -12 }}
              whileHover={{ scale: 1.1, rotate: 10 }}
              className="w-24 h-24 bg-[var(--secondary)] neo-border neo-shadow flex items-center justify-center mb-6 transition-transform cursor-pointer relative"
            >
              <PartyPopper size={48} className="text-black" strokeWidth={3} />
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-4 -right-4 w-10 h-10 bg-[var(--success)] neo-border rounded-full flex items-center justify-center"             >
                <Sparkles size={20} className="text-black" fill="currentColor" />
              </motion.div>
            </motion.div>
            
            <div className="relative mb-2">
              <h1 
                className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-2 uppercase leading-[0.8] relative z-10 neo-text-layered neo-text-glow"
                data-text="UNDERCOVER"
              >
                UNDERCOVER
              </h1>
              <h2 className="text-sm sm:text-base md:text-lg font-black text-[var(--success)] tracking-tighter uppercase transform -rotate-2 relative z-20 mt-[-0.2rem]">
                <span className="relative inline-block drop-shadow-[3px_3px_0px_var(--secondary)]">
                  PARTY GAME
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
                  <span>PARTY</span>
                  <span className="text-white">TIME!</span>
                </div>
              </motion.div>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
              <motion.span 
                className="neo-badge bg-[var(--secondary)] py-2.5 px-5 text-base rotate-1 cursor-default neo-shadow-sm"
              >
                SOCIAL FUN
              </motion.span>
              <motion.span 
                whileHover={{ scale: 1.1, rotate: -3 }}
                className="neo-badge bg-[var(--warning)] py-2.5 px-5 text-base -rotate-1 cursor-default neo-shadow-sm"
              >
                PLAY WITH FRIENDS
              </motion.span>
              <motion.span 
                whileHover={{ scale: 1.1, rotate: 2 }}
                className="neo-badge bg-white py-2.5 px-5 text-base rotate-2 cursor-default neo-shadow-sm"
              >
                FREE FOREVER
              </motion.span>
            </div>

            <button 
              onClick={() => setView('play')}
              className="neo-button w-full max-w-[200px] bg-white text-sm py-2 px-6 h-auto hover:bg-[var(--primary)] font-black tracking-widest active:translate-y-1 active:shadow-none transition-colors neo-pop"
            >
              START GAME
            </button>
          </header>
        )}

        {view === "play" && (
          <>
            <div className="grid grid-cols-1 gap-8 w-full items-stretch mb-10 pt-24">
              {/* Main Action Card */}
              <div className="bg-white p-6 md:p-8 neo-card relative overflow-hidden flex flex-col justify-between border-t-[4px] border-t-[var(--primary)]">
                <div className="neo-accent-corner-tl opacity-50" />
                <div className="neo-accent-corner-tr opacity-50" />
                <div className="neo-accent-corner-bl opacity-10" />
                <div className="neo-accent-corner-br opacity-10" />
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none animate-spin-slow">
                  <Smile size={160} className="rotate-12" />
                </div>
                
                <div className="space-y-8 relative z-10">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-left text-base font-black uppercase tracking-[0.2em] text-black italic leading-none">
                        <Smile size={24} className="text-[var(--secondary)]" /> WHO ARE YOU?
                      </label>
                      <motion.div 
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-sm font-black uppercase bg-[var(--primary)] text-black px-5 py-2 neo-border-sm neo-shadow-sm"
                      >
                        REQUIRED
                      </motion.div>
                    </div>
                    <div className="relative group">
                      <input
                        type="text"
                        placeholder="CHOOSE A COOL NICKNAME..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full neo-input text-lg py-4 px-5 uppercase placeholder:text-black/20 font-black focus:bg-[var(--bg-cheerful)] transition-all italic tracking-tighter"
                      />
                      <div className="absolute top-1/2 -translate-y-1/2 right-4 opacity-10 group-focus-within:opacity-40 transition-opacity">
                        <Gamepad2 size={28} className="text-black" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 py-2">
                    <div className="h-[2px] bg-black/10 flex-1 neo-border-b-sm border-black/5" />
                    <div className="text-sm font-black text-black/60 uppercase tracking-[0.3em] italic">JOIN THE CHAOS</div>
                    <div className="h-[2px] bg-black/10 flex-1 neo-border-b-sm border-black/5" />
                  </div>

                  <div className="grid grid-cols-1 gap-8">
                    <div className="space-y-4">
                      <button
                        onClick={() => handleCreate()}
                        disabled={!name || isCreating || !isConnected}
                        className="w-full neo-button bg-[var(--primary)] text-black min-h-[70px] flex flex-col gap-1 items-center justify-center group relative overflow-hidden animate-shimmer neo-pop"
                      >
                        <div className="flex items-center gap-2 relative z-10 font-black italic tracking-tighter text-xl">
                          <Plus size={24} strokeWidth={4} />
                          <span>NEW PARTY</span>
                        </div>
                        <span className="text-sm font-black opacity-40 uppercase tracking-[0.1em] relative z-10 leading-none">Host a Room</span>
                      </button>
                      
                      <label className="flex items-center gap-3 cursor-pointer p-4 bg-[var(--neutral)] neo-border hover:bg-white transition-all group active:translate-y-1 hover:neo-shadow-md border-l-[4px] border-l-[var(--success)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-12 h-full neo-strip opacity-10" />
                        <div className="relative w-7 h-7 shrink-0">
                          <input 
                            type="checkbox" 
                            checked={isPublic} 
                            onChange={(e) => setIsPublic(e.target.checked)}
                            className="peer absolute inset-0 opacity-0 cursor-pointer z-10"
                          />
                          <div className="w-7 h-7 neo-border bg-white peer-checked:bg-[var(--success)] flex items-center justify-center transition-colors neo-shadow-sm peer-active:shadow-none peer-active:translate-x-[1px] peer-active:translate-y-[1px]">
                            <motion.div 
                              animate={{ scale: isPublic ? 1 : 0 }}
                              className="w-3.5 h-3.5 bg-black rounded-sm"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col relative z-10">
                          <span className="text-base font-black uppercase tracking-wider select-none group-hover:text-[var(--success)] transition-colors">Show in Lobby</span>
                          <span className="text-sm font-bold opacity-30 uppercase tracking-tighter">Let strangers join</span>
                        </div>
                      </label>
                    </div>

                    <div className="space-y-4">
                      <div className="flex flex-col gap-4">
                        <div className="relative group">
                          <input
                            type="text"
                            placeholder="CODE"
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                            maxLength={6}
                            className="w-full neo-input text-2xl text-center font-mono tracking-[0.3em] uppercase py-4 bg-[var(--neutral)] group-focus-within:bg-white group-focus-within:neo-shadow-md transition-all placeholder:opacity-10"
                          />
                          <div className="absolute -top-3 left-4 bg-black text-white text-sm px-4 py-1.5 font-black uppercase tracking-[0.2em] italic neo-shadow-sm leading-none">
                            JOIN CODE
                          </div>
                        </div>
                        <button
                          onClick={() => handleJoin()}
                          disabled={!name || !roomCode || !isConnected}
                          className="w-full neo-button bg-[var(--secondary)] min-h-[70px] flex items-center justify-center gap-3 group animate-shimmer neo-pop"
                        >
                          <ArrowRight size={28} strokeWidth={4} className="group-hover:translate-x-2 transition-transform duration-500" />
                          <span className="text-xl font-black italic tracking-tighter">JOIN PARTY</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>


                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="bg-[var(--danger)] text-white p-4 neo-border neo-shadow-sm font-black text-sm mt-6 uppercase tracking-wider flex items-center gap-4 rotate-1"
                  >
                    <div className="w-12 h-12 bg-white flex items-center justify-center text-[var(--danger)] shrink-0 neo-border-sm animate-wiggle">
                      <Zap size={24} fill="currentColor" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-sm opacity-80 italic font-black mb-1">PARTY CRASHED!</span>
                      <span className="text-lg leading-tight tracking-tight">{error.message}</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="w-full pb-24">
              <motion.div 
                key="browse"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-3 flex-1 flex flex-col"
              >
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg font-black uppercase tracking-tighter flex items-center gap-2 italic neo-text-glow">
                    <Radio className="text-[var(--secondary)] animate-pulse" size={20} strokeWidth={4} />
                    OPEN PARTIES
                  </h2>
                  <button 
                    onClick={refreshPublicRooms}
                    className="neo-button bg-white text-sm py-2 px-6 h-auto hover:bg-[var(--primary)] font-black tracking-widest active:translate-y-1 active:shadow-none transition-colors neo-pop"
                  >
                    REFRESH
                  </button>
                </div>

                <div className="flex-1 bg-white neo-border p-4 min-h-[250px] flex flex-col neo-shadow bg-grid-pattern bg-[length:20px_20px] relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/60 pointer-events-none" />
                  
                  {publicRooms.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 relative z-10">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 bg-[var(--bg-cheerful)] neo-border flex items-center justify-center mb-4 rounded-full opacity-40 neo-shadow-sm"
                      >
                        <Search size={32} className="text-black" strokeWidth={1.5} />
                      </motion.div>
                      <p className="text-base font-black uppercase text-black tracking-tighter italic">NO PARTIES YET!</p>
                      <p className="text-sm uppercase font-bold text-black/30 mt-2 max-w-[200px] leading-relaxed">Quiet here. Start the celebration!</p>
                    </div>
                  ) : (
                    <div className="space-y-3 overflow-y-auto max-h-[400px] pr-1.5 custom-scrollbar flex-1 relative z-10">
                      {publicRooms.map((r, i) => (
                        <motion.div
                          key={r.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          whileHover={{ x: 8, scale: 1.02 }}
                          className="bg-white p-4 neo-border neo-shadow flex items-center justify-between group cursor-pointer border-l-[8px] border-l-[var(--primary)] relative overflow-hidden"
                          onClick={() => handleJoin(r.id)}
                        >
                          <div className="absolute top-0 right-0 w-24 h-full neo-strip opacity-[0.03]" />
                          <div className="flex-1 min-w-0 pr-4 text-left relative z-10">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-black uppercase text-white bg-black px-3 py-1.5 neo-border-sm tracking-[0.1em]">{r.id}</span>
                              <span className="text-lg font-black uppercase truncate tracking-tighter italic group-hover:text-[var(--secondary)] transition-colors">{r.name}'S ROOM</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="neo-badge bg-[var(--success)] px-5 py-2.5 text-base italic neo-shadow-sm leading-none h-auto">
                                <Users size={20} strokeWidth={4} />
                                <span>{r.playerCount} / {r.maxPlayers}</span>
                              </div>
                              <span className="text-sm font-black uppercase text-black/40 italic flex items-center gap-2 tracking-[0.1em]">
                                <div className="w-3.5 h-3.5 bg-[var(--success)] rounded-full animate-pulse shadow-[0_0_6px_var(--success)]" />
                                JOIN
                              </span>
                            </div>
                          </div>
                          <div className="neo-button bg-[var(--secondary)] p-2 group-hover:rotate-12 transition-transform neo-shadow-sm relative z-10 neo-pop">
                            <ChevronRight size={24} strokeWidth={5} />
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
