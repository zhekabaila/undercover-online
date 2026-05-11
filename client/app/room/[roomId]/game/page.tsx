'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  Send,
  Timer as TimerIcon,
  Smile,
  Vote,
  AlertCircle,
  Trophy,
  ArrowLeft,
  Loader2,
  X,
  ChevronRight,
  PartyPopper, Ghost, Gamepad2, Search,
  Sparkles,
  Fingerprint,
  Target,
  Shield,
  Activity,
  Terminal,
  Lock,
  Wifi,
  Radio,
  Check
} from 'lucide-react'
import { useGameState } from '../../../../hooks/useGameState'
import { FloatingShape } from '../../../../components/ui/FloatingShape'

import {
  Player,
  GamePhase,
  Room,
  ChatMessage as ChatMessageType,
} from '../../../../types/game'

// --- Constants & Config ---

const PHASE_CONFIG: Record<
  GamePhase,
  { label: string; color: string; shadow: string; icon: any; accent: string }
> = {
  lobby: {
    label: 'PUSAT KOMANDO',
    color: 'bg-[var(--surface)]',
    shadow: 'neo-shadow-sm',
    icon: Shield,
    accent: 'text-black/40',
  },
  starting: {
    label: 'INISIALISASI OPERASI',
    color: 'bg-[var(--primary)]',
    shadow: 'neo-shadow-sm',
    icon: Terminal,
    accent: 'text-black',
  },
  speaking: {
    label: 'INTERSEPSI KOMUNIKASI',
    color: 'bg-[var(--success)]',
    shadow: 'neo-shadow-sm',
    icon: Radio,
    accent: 'text-black',
  },
  discussion: {
    label: 'ANALISIS SINYAL',
    color: 'bg-[var(--secondary)]',
    shadow: 'neo-shadow-sm',
    icon: Activity,
    accent: 'text-black',
  },
  voting: {
    label: 'ELIMINASI TARGET',
    color: 'bg-[var(--danger)]',
    shadow: 'neo-shadow-sm',
    icon: Target,
    accent: 'text-white',
  },
  mrwhite_guessing: {
    label: "DEKRIPSI PENYUSUP",
    color: 'bg-[var(--warning)]',
    shadow: 'neo-shadow-sm',
    icon: Search,
    accent: 'text-black',
  },
  ended: {
    label: 'MISI SELESAI',
    color: 'bg-black',
    shadow: 'neo-shadow-sm',
    icon: Trophy,
    accent: 'text-white',
  },
}




// --- Main Component ---

export default function GameScreen() {
  const params = useParams()
  const router = useRouter()

  // Call useGameState ONLY ONCE
  const {
    room,
    playerId,
    messages,
    sendChat,
    castVote,
    passVote,
    turnDone,
    mrWhiteGuess,
    leaveRoom,
    clearSession,
    submitDescription,
    error,
  } = useGameState()

  const [chatInput, setChatInput] = useState('')
  const [descriptionInput, setDescriptionInput] = useState('')
  const [guessInput, setGuessInput] = useState('')
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [showRoleOverlay, setShowRoleOverlay] = useState(false)
  const [mounted, setMounted] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const roleShownRef = useRef(false) // Track if role has been auto-shown for current game

  // Handle hydration and initial desktop state
  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-scroll chat and play notification sound
  useEffect(() => {
    if (messages.length > 0) {
      // Scroll to bottom
      const timer = setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
      
      // Play notification sound
      try {
        const audio = new Audio('/sounds/notification.mp3')
        audio.volume = 0.5
        audio.play().catch(() => {}) // Silently fail if audio fails
      } catch (e) {
        // Silently ignore audio errors
      }
      
      return () => clearTimeout(timer)
    }
  }, [messages])

  // Auto-show role overlay for 5 seconds when game starts
  useEffect(() => {
    if (room?.game?.phase === 'starting' && !roleShownRef.current) {
      roleShownRef.current = true
      setShowRoleOverlay(true)
      
      const timer = setTimeout(() => {
        setShowRoleOverlay(false)
      }, 5000) // 5 seconds
      
      return () => clearTimeout(timer)
    }
    
    // Reset ref when game ends or returns to lobby
    if (room?.game?.phase === 'lobby' || room?.game?.phase === 'ended') {
      roleShownRef.current = false
    }
  }, [room?.game?.phase])

  // Redirect to lobby if game not active
  useEffect(() => {
    const roomId = params?.roomId
    if (room && roomId && (!room.game || room.game.phase === 'lobby')) {
      router.push(`/room/${roomId}`)
    }
  }, [room, room?.game?.phase, params?.roomId, router])

  // Memoized current player
  const currentPlayer = useMemo(
    () => room?.players.find((p: Player) => p.id === playerId),
    [room?.players, playerId],
  )

  const isMyTurn = useMemo(
    () =>
      room?.game?.phase === 'speaking' &&
      room?.game?.turnOrder?.playerIds[room.game.turnOrder.currentIndex] ===
        playerId,
    [room?.game, playerId],
  )

  const infiltratorStats = useMemo(() => {
    return {
      undercover: room?.game?.remainingUndercover ?? 0,
      mrWhite: room?.game?.remainingMrWhite ?? 0,
    }
  }, [room?.game?.remainingUndercover, room?.game?.remainingMrWhite])

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    sendChat(chatInput)
    setChatInput('')
  }

  const handleSendDescription = (e: React.FormEvent) => {
    e.preventDefault()
    if (!descriptionInput.trim() || currentPlayer?.description) return
    submitDescription(descriptionInput.trim())
    turnDone() // Finalize turn after submitting description
    setDescriptionInput('')
  }

  const handleMrWhiteGuess = (e: React.FormEvent) => {
    e.preventDefault()
    if (!guessInput.trim()) return
    mrWhiteGuess(guessInput.trim())
    setGuessInput('')
  }

  if (!room || !room.game) {
    return <LoadingState roomId={params.roomId as string} />
  }

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-cheerful)] text-[var(--text)] font-sans selection:bg-[var(--primary)] overflow-hidden relative">
      {/* Global Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-dot-pattern opacity-10" />
        
        {/* Decorative Floating Shapes */}
        <FloatingShape color="var(--primary)" size={60} top="-2%" left="-2%" delay={0} shape="circle" />
        <FloatingShape color="var(--secondary)" size={40} top="70%" left="3%" delay={1} shape="square" />
        <FloatingShape color="var(--success)" size={70} top="5%" left="85%" delay={2} shape="triangle" />
        <FloatingShape color="var(--danger)" size={35} top="85%" left="88%" delay={3} shape="square" />
        <FloatingShape color="var(--warning)" size={25} top="40%" left="94%" delay={1.5} shape="circle" />
      </div>


      {/* App Header */}
      <header className="sticky top-0 h-auto overflow-x-auto custom-scrollbar shrink-0 neo-border-b-sm bg-[var(--surface)] flex items-center px-2 py-1 sm:px-3 z-[100] neo-shadow-sm">
        <div className="w-full flex items-center justify-between max-w-[1920px] mx-auto gap-3">
          <div className="flex items-center gap-3 sm:gap-6">
            <button
              onClick={() =>
                confirm('Meninggalkan pesta? Anda akan melewatkan semua keseruannya!') && (leaveRoom(), router.push('/'))
              }
              className="neo-button group bg-[var(--danger)] text-white p-1 hover:rotate-6 active:translate-y-0.5 transition-all flex items-center justify-center"
              title="Keluar Pesta"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-white group-hover:scale-110 transition-transform" strokeWidth={4} />
            </button>
            
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 lg:gap-3">
                <h1 
                  data-text={`ID PESTA: ${params.roomId}`}
                  className="flex whitespace-nowrap items-center text-[10px] lg:text-[12px] font-black uppercase italic leading-none tracking-tighter"
                >
                  <span className="opacity-40">ID PESTA:</span> 
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(params.roomId as string);
                      alert('ID Pesta disalin ke clipboard!');
                    }}
                    className="bg-[var(--primary)] px-2 py-1 neo-border-sm neo-shadow-sm ml-2 text-[10px] lg:text-[11px] hover:scale-105 active:scale-95 transition-all neo-pop flex items-center gap-1.5 group/copy font-black italic"
                  >
                    {params.roomId}
                    <Sparkles size={10} className="text-black group-hover/copy:animate-spin" />
                  </button>
                </h1>
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-md hidden md:flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.9, rotate: -1 }}
              animate={{ scale: 1, rotate: 0 }}
              className={`flex items-center gap-2 px-3 py-1 neo-border-sm ${PHASE_CONFIG[room.game.phase].color} ${PHASE_CONFIG[room.game.phase].shadow} transition-all duration-500 relative`}
            >
              <div className="neo-accent-corner-tl opacity-40 scale-75" />
              <div className="neo-accent-corner-br opacity-40 scale-75" />
              {(() => {
                const Icon = PHASE_CONFIG[room.game.phase].icon;
                return <Icon size={14} strokeWidth={3} className={room.game.phase === 'ended' ? 'animate-bounce' : 'animate-pulse'} />;
              })()}
              <span 
                data-text={PHASE_CONFIG[room.game.phase].label}
                className={`text-[11px] lg:text-xs font-black uppercase tracking-wider italic ${room.game.phase === 'ended' ? 'text-white' : 'text-black'}`}
              >
                {PHASE_CONFIG[room.game.phase].label}
              </span>
            </motion.div>
          </div>

          <div className="flex items-center gap-4 sm:gap-5">
            {room.game.phase !== 'voting' && (
              <Timer 
                endsAt={room.game.turnEndTime} 
                onExpire={() => {
                  if (isMyTurn) turnDone()
                }} 
              />
            )}
            
            <button
              onClick={() => setShowRoleOverlay(true)}
              className="neo-button bg-[var(--success)] text-black px-1.5 py-0.5 lg:px-2 lg:py-1 flex items-center gap-1 lg:gap-1.5 hover:scale-105 active:translate-y-0.1 transition-all neo-pop"
            >
              <Smile className="w-3.5 h-3.5 lg:w-4 h-4" strokeWidth={3} />
              <span className="hidden sm:inline text-[10px] lg:text-[11px] font-black uppercase tracking-widest italic">PERAN SAYA</span>
            </button>
 
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`neo-button p-1 lg:p-1 flex items-center justify-center relative transition-all neo-pop ${
                isChatOpen
                  ? 'bg-black text-white'
                  : 'bg-[var(--secondary)] text-black'
              }`}
            >
              <MessageSquare className="w-3.5 lg:w-4 h-3.5 lg:h-4" strokeWidth={3} />
            </button>
          </div>
        </div>
      </header>

      {/* Main App Shell Layout */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Main Content Area - Independently Scrollable */}
        <main className="flex-1 min-w-0 overflow-y-auto custom-scrollbar relative z-10 px-2 py-2 sm:p-4 lg:p-6">
          <div className="max-w-[1000px] mx-auto w-full flex flex-col gap-4 sm:gap-6">
              {/* Turn Interaction Banner - Show when it's your turn to speak */}
            <AnimatePresence>
              {room.game.phase === 'speaking' &&
                isMyTurn &&
                !currentPlayer?.description && (
                    <motion.div
                      initial={{ opacity: 0, y: -40, scale: 0.95, rotate: -1 }}
                      animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      className="bg-[var(--primary)] w-full neo-border p-1.5 sm:p-2 flex flex-col lg:flex-row lg:justify-between items-center gap-2 sm:gap-3 relative overflow-hidden group neo-shadow"
                    >
                    {/* Decorative elements for banner */}
                    <div className="absolute -top-6 -right-6 opacity-10">
                      <Terminal size={60} className="-rotate-12" />
                    </div>
                    
                    <div className="flex w-full gap-2 sm:gap-4 flex-col lg:flex-row items-center">
                      <div className="shrink-0 relative">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black neo-border-sm flex items-center justify-center text-[var(--primary)] neo-shadow-sm transform group-hover:rotate-12 transition-transform duration-500">
                          <Radio size={16} className="animate-pulse" />
                        </div>
                      </div>
                      
                      <div className="text-center lg:text-left space-y-0.5 relative z-10">
                        <div className="flex items-center justify-center lg:justify-start gap-1">
                          <span className="bg-black text-white px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.2em]">
                            STATUS: AKTIF
                          </span>
                          <span className="w-1 h-1 bg-black rounded-full animate-ping" />
                        </div>
                        <h3 
                          data-text="BAGIKAN KODE PETUNJUK"
                          className="text-sm sm:text-xl font-black uppercase italic tracking-tighter text-black leading-none transform -skew-x-6"
                        >
                          BAGIKAN KODE PETUNJUK
                        </h3>
                        <p className="text-black/60 font-black uppercase text-[8px] sm:text-[9px] tracking-[0.2em] italic max-w-xl">
                          MASUKKAN DATA DESKRIPSI UNTUK DIINTERSEPSI OLEH AGEN LAIN.
                        </p>
                      </div>
                    </div>
                    
                      <form
                        onSubmit={handleSendDescription}
                        className="w-full lg:w-auto flex justify-end gap-2 relative z-10"
                      >
                          <input
                            type="text"
                            value={descriptionInput}
                            onChange={(e) => setDescriptionInput(e.target.value)}
                            placeholder="Ketik petunjuk rahasia..."
                            maxLength={100}
                            className="neo-input text-xs sm:text-sm py-2 px-3 focus:bg-white/50 transition-colors w-full lg:w-64 italic font-bold"
                            autoFocus
                          />
                          <button
                            type="submit"
                            disabled={!descriptionInput.trim()}
                            className="neo-button bg-black text-white px-6 py-2 text-sm font-black hover:bg-[var(--secondary)] hover:text-black active:scale-95 transition-all neo-pop"
                          >
                            KIRIM
                          </button>
                      </form>
                  </motion.div>
                )}
              </AnimatePresence>
 
              {/* Discussion Banner */}
              <AnimatePresence>
              {room.game.phase === 'discussion' && (
                <motion.div
                  initial={{ opacity: 0, y: -40, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  className="bg-[var(--secondary)] neo-border p-3 sm:p-4 flex flex-col lg:flex-row items-center gap-3 sm:gap-4 relative overflow-hidden group neo-shadow"
                >
                  <div className="shrink-0 relative">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black neo-border-sm flex items-center justify-center text-[var(--secondary)] neo-shadow-sm transform group-hover:rotate-12 transition-transform duration-500">
                      <Activity size={20} className="animate-pulse" />
                    </div>
                  </div>
                  
                  <div className="flex-1 text-center lg:text-left space-y-1 relative z-10">
                    <div className="flex items-center justify-center lg:justify-start gap-2">
                      <span className="bg-black text-white px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.2em]">
                        ANALISIS TERBUKA
                      </span>
                      <div className="flex gap-1">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="w-1 h-1 bg-black rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                        ))}
                      </div>
                    </div>
                    <h3 
                      data-text="GOSIP & ANALISIS SINYAL"
                      className="text-base sm:text-2xl font-black uppercase italic tracking-tighter text-black leading-none transform -skew-x-6"
                    >
                      GOSIP & ANALISIS SINYAL
                    </h3>
                    <p className="text-black/60 font-black uppercase text-[9px] sm:text-[10px] tracking-[0.2em] italic max-w-xl">
                      WAKTUNYA MENDISKUSIKAN DATA DAN MENGELIMINASI SUBJEK YANG MENCURIGAKAN.
                    </p>
                  </div>
 
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="neo-button bg-black text-white px-6 py-3 text-sm font-black hover:bg-[var(--primary)] hover:text-black active:scale-95 transition-all neo-pop flex items-center gap-2"
                  >
                    <MessageSquare size={16} />
                    BUKA PERCAKAPAN
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Top Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between bg-white neo-border-sm neo-shadow-sm p-1.5 lg:p-2 gap-2 lg:gap-3 relative overflow-hidden group mb-2 lg:mb-3"
            >
              {/* Round Info Section */}
              <div className="flex items-center gap-3 lg:gap-4 shrink-0 relative z-10 w-full lg:w-auto justify-between lg:justify-start px-1 lg:px-0">
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="w-7 h-7 lg:w-8 lg:h-8 neo-border-sm bg-[var(--secondary)] flex items-center justify-center text-black neo-shadow-sm transform -rotate-6 group-hover:rotate-0 transition-transform shrink-0">
                    <Gamepad2 className="w-3.5 lg:w-4 h-3.5 lg:h-4" strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[6px] lg:text-[7px] font-black text-black/30 uppercase tracking-[0.15em] lg:tracking-[0.2em] leading-none mb-0.5 italic">
                      SUASANA PESTA
                    </span>
                    <h2 className="flex items-center text-[10px] lg:text-[12px] font-black text-black uppercase italic leading-none tracking-tighter" data-text={`RONDE #${room.game.roundNumber}`}>
                      RONDE <div className="bg-[var(--primary)] px-2 py-1 neo-border-sm neo-shadow-sm ml-2 text-[10px] lg:text-[12px] -rotate-2">#{room.game.roundNumber}</div>
                    </h2>
                  </div>
                </div>
                {/* Mobile phase indicator - Redesigned */}
                <div className="lg:hidden flex flex-col items-end gap-0.5">
                  <span className="text-[8px] font-black text-black/30 uppercase tracking-widest italic">TAHAP</span>
                  <div className={`flex items-center gap-1 px-1.5 py-1 neo-border-sm ${PHASE_CONFIG[room.game.phase].color} neo-shadow-sm rotate-2`}>
                    {(() => {
                      const Icon = PHASE_CONFIG[room.game.phase].icon;
                      return <Icon className={`w-3 h-3 ${room.game.phase === 'ended' ? 'animate-bounce' : 'animate-pulse'}`} strokeWidth={3} />;
                    })()}
                    <span className={`text-[9px] font-black uppercase italic ${room.game.phase === 'ended' ? 'text-white' : 'text-black'}`}>
                      {PHASE_CONFIG[room.game.phase].label.split(' ')[0]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Section - Optimized for Mobile (Dashboard Style) */}
              <div className="grid grid-cols-3 lg:flex items-stretch lg:items-center gap-1.5 sm:gap-2 lg:gap-8 relative z-10 w-full lg:w-auto border-t-[1.5px] lg:border-t-0 border-black pt-3 lg:pt-0 lg:border-l-[1.5px] lg:pl-8">
                {/* Players In */}
                <div className="flex flex-col items-center justify-center gap-1 p-1 lg:p-0">
                  <span className="text-[6px] lg:text-[8px] font-black text-black/40 uppercase tracking-widest leading-none italic text-center">
                    AKTIF
                  </span>
                  <div className="bg-white lg:bg-[var(--neutral)] neo-border-sm px-1.5 py-1 neo-shadow-sm -rotate-2 w-full flex justify-center items-center">
                    <span className="text-[10px] lg:text-xs font-black text-black tabular-nums italic">
                      {room.players.filter((p: Player) => p.isAlive).length}<span className="text-black/20 mx-0.5">/</span>{room.players.length}
                    </span>
                  </div>
                </div>
                
                {/* Undercover Stat Box */}
                <div className="flex flex-col items-center justify-center gap-1 group/cr p-1 lg:p-0">
                  <span className="text-[6px] lg:text-[8px] font-black text-black/40 uppercase tracking-widest leading-none italic text-center">
                    INTEL
                  </span>
                  <div className="flex items-center gap-1 bg-[var(--primary)] neo-border-sm px-1.5 py-1 neo-shadow-sm group-hover/cr:scale-105 transition-transform w-full justify-center rotate-1">
                    <Search className="text-black w-3 h-3" strokeWidth={4} />
                    <span className="text-[10px] lg:text-xs font-black text-black tabular-nums italic">
                      {infiltratorStats.undercover}
                    </span>
                  </div>
                </div>
                
                {/* Mr. White Stat Box */}
                <div className="flex flex-col items-center justify-center gap-1 group/mg p-1 lg:p-0">
                  <span className="text-[6px] lg:text-[8px] font-black text-[var(--danger)]/60 uppercase tracking-widest leading-none italic text-center">
                    TARGET
                  </span>
                  <div className="flex items-center gap-1 bg-[var(--danger)] neo-border-sm px-1.5 py-1 neo-shadow-sm text-white group-hover/mg:scale-105 transition-transform w-full justify-center -rotate-1">
                    <Ghost className="text-white w-3 h-3" strokeWidth={4} />
                    <span className="text-[10px] lg:text-xs font-black text-white tabular-nums italic">
                      {infiltratorStats.mrWhite}
                    </span>
                  </div>
                </div>
              </div>

              {/* Background accents for card */}
              <div className="absolute top-0 right-0 w-20 h-full bg-[var(--neutral)] -skew-x-12 transform translate-x-10 z-0 opacity-50 hidden lg:block" />
            </motion.div>
            {/* Game Phase Content */}
            <div className="flex-1 min-h-[40vh] flex flex-col">
              <AnimatePresence mode="wait">
                {room.game.phase === 'starting' && (
                  <StartingView key="starting" />
                )}

                {['speaking', 'discussion', 'voting'].includes(
                  room.game.phase,
                ) && (
                    <motion.div
                      key="gameplay"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.02 }}
                      className="flex flex-col gap-4 lg:gap-6 pb-20"
                    >
                    {room.game.phase === 'voting' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[var(--danger)] neo-border-sm neo-shadow-sm p-2 sm:p-3 flex items-center justify-center gap-2"
                      >
                        <Vote className="w-4 lg:w-5 h-4 lg:h-5 text-white" />
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-white text-center italic">
                          PILIH UNTUK MENGELUARKAN PENYUSUP
                        </span>
                      </motion.div>
                    )}
 
                     <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 lg:gap-3">
                       {room.players.map((player: Player) => (
                          <PlayerCard
                            key={player.id}
                            player={player}
                            isCurrent={
                              room.game?.turnOrder?.playerIds[
                                room.game.turnOrder.currentIndex
                              ] === player.id
                            }
                            isSelf={player.id === playerId}
                            phase={room.game!.phase}
                            onVote={() => castVote(player.id)}
                            hasVoted={!!room.game?.votes?.[playerId!]}
                            votesReceived={Object.values(room.game?.votes || {}).filter(id => id === player.id).length}
                            hasActioned={!!room.game?.votes?.[player.id] || !!room.game?.passes?.[player.id]}
                          />
                       ))}
                     </div>

                    {room.game.phase === 'voting' &&
                      !room.game?.passes?.[playerId!] &&
                      !room.game?.votes?.[playerId!] &&
                      currentPlayer?.isAlive && (
                        <motion.div
                          initial={{ opacity: 0, y: 50 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex justify-center pt-8 pb-4"
                        >
                          <button
                            onClick={() => passVote()}
                            className="neo-button bg-[var(--warning)] text-black w-full max-w-[400px] py-4 text-xl font-black flex items-center justify-center gap-3 group relative overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-black/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                            <AlertCircle size={24} className="group-hover:rotate-12 transition-transform" />
                            <div className="flex flex-col items-start leading-none">
                              <span className="text-[10px] opacity-60 uppercase tracking-widest mb-1">PROTOKOL ABSTAIN</span>
                              <span className="uppercase italic tracking-tighter">LEWATI ELIMINASI (GOLPUT)</span>
                            </div>
                          </button>
                        </motion.div>
                      )}
                  </motion.div>
                )}

                {room.game.phase === 'mrwhite_guessing' && (
                  <MrWhiteGuessView
                    key="mrwhite"
                    currentPlayer={currentPlayer}
                    guessInput={guessInput}
                    setGuessInput={setGuessInput}
                    onSubmit={handleMrWhiteGuess}
                  />
                )}

                {room.game.phase === 'ended' && (
                  <GameEndedView
                    key="ended"
                    room={room}
                    playerId={playerId}
                    onReturn={() => router.push(`/room/${params.roomId}`)}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>

        {/* Desktop Chat Sidebar - Right Side */}
        {mounted && (
          <aside
            className={`hidden lg:flex shrink-0 transition-all duration-300 ease-in-out neo-border-l bg-[var(--surface)] relative overflow-hidden h-full ${
              isChatOpen ? 'w-[320px] opacity-100' : 'w-0 opacity-0'
            }`}
          >
            <div className="w-[320px] h-full flex flex-col">
              <ChatContent
                messages={messages}
                playerId={playerId}
                chatInput={chatInput}
                setChatInput={setChatInput}
                handleSendChat={handleSendChat}
                descriptionInput={descriptionInput}
                setDescriptionInput={setDescriptionInput}
                handleSendDescription={handleSendDescription}
                isMyTurn={isMyTurn}
                turnDone={turnDone}
                chatEndRef={chatEndRef}
                phase={room.game.phase}
                onClose={() => setIsChatOpen(false)}
                currentPlayer={currentPlayer}
              />
            </div>
          </aside>
        )}
      </div>

      {/* Mobile Chat Drawer - Overlay */}
      <AnimatePresence>
        {isChatOpen && mounted && (
          <div className="lg:hidden fixed inset-0 z-[100] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChatOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative h-full w-[90%] max-w-[400px] bg-white neo-border-l flex flex-col neo-shadow-lg"
            >
              <ChatContent
                messages={messages}
                playerId={playerId}
                chatInput={chatInput}
                setChatInput={setChatInput}
                handleSendChat={handleSendChat}
                descriptionInput={descriptionInput}
                setDescriptionInput={setDescriptionInput}
                handleSendDescription={handleSendDescription}
                isMyTurn={isMyTurn}
                turnDone={turnDone}
                chatEndRef={chatEndRef}
                phase={room.game.phase}
                onClose={() => setIsChatOpen(false)}
                currentPlayer={currentPlayer}
              />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Role Identity Overlay */}
      <AnimatePresence>
        {showRoleOverlay && currentPlayer && (
          <RoleOverlay
            player={currentPlayer}
            onClose={() => setShowRoleOverlay(false)}
          />
        )}
      </AnimatePresence>

      {/* Error Notifications */}
      <AnimatePresence>
        {error && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[300] w-full max-w-md px-4">
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.9 }}
              className="bg-[var(--danger)] text-white px-4 py-2 sm:px-6 sm:py-3 neo-border neo-shadow-sm flex items-center gap-3 sm:gap-4"
            >
              <AlertCircle size={20} className="text-white shrink-0" />
              <div className="flex flex-col">
                <span className="text-lg font-black uppercase tracking-widest text-white/80">
                  PESTA BERANTAKAN!
                </span>
                <span className="font-black text-lg sm:text-xl leading-tight uppercase italic">
                  {error.message}
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

// --- Sub Components ---

function LoadingState({ roomId }: { roomId: string }) {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center gap-6 z-[9999] p-4 text-center overflow-hidden">
      {/* Background abstract shapes */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03]">
        <div className="absolute top-10 left-10 w-64 h-64 border-[20px] border-black rounded-full rotate-12" />
        <div className="absolute bottom-20 right-10 w-96 h-96 border-[40px] border-black rotate-[-15deg]" />
      </div>

      <div className="relative">
        <motion.div 
          animate={{ 
            rotate: [ -6, 6, -6 ],
            scale: [ 1, 1.1, 1 ]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-20 h-20 sm:w-28 sm:h-28 bg-[var(--primary)] neo-border neo-shadow flex items-center justify-center relative z-10"
        >
          <PartyPopper className="w-12 h-12 sm:w-16 sm:h-16 text-black" />
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-black flex items-center justify-center">
             <div className="w-1 h-4 bg-white rotate-45 absolute" />
             <div className="w-1 h-4 bg-white -rotate-45 absolute" />
          </div>
        </motion.div>
        {/* Animated rings */}
        <div className="absolute inset-0 -z-0 border-4 border-dashed border-black/10 rounded-full animate-spin-slow scale-150" />
      </div>

      <div className="space-y-4 relative z-10">
        <h2 className="text-4xl sm:text-7xl font-black uppercase italic tracking-tighter text-black leading-none transform -skew-x-12">
          GABUNG PESTA
        </h2>
        
        <div className="flex flex-col items-center gap-2">
           <div className="bg-black text-white neo-border py-2 px-8 inline-block transform rotate-1 neo-shadow">
              <p className="font-black tracking-[0.3em] uppercase text-sm sm:text-xl">
                ID PESTA: <span className="text-[var(--primary)]">{roomId}</span>
              </p>
           </div>
           <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <motion.div 
                  key={i}
                  animate={{ opacity: [ 0.2, 1, 0.2 ] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  className="w-3 h-3 bg-black neo-border-sm"
                />
              ))}
           </div>
        </div>
      </div>
    </div>
  )
}

function ChatContent({
  messages,
  playerId,
  chatInput,
  setChatInput,
  handleSendChat,
  descriptionInput,
  setDescriptionInput,
  handleSendDescription,
  isMyTurn,
  turnDone,
  chatEndRef,
  phase,
  onClose,
  currentPlayer,
}: {
  messages: ChatMessageType[]
  playerId: string | null
  chatInput: string
  setChatInput: (val: string) => void
  handleSendChat: (e: React.FormEvent) => void
  descriptionInput: string
  setDescriptionInput: (val: string) => void
  handleSendDescription: (e: React.FormEvent) => void
  isMyTurn: boolean
  turnDone: () => void
  chatEndRef: React.RefObject<HTMLDivElement | null>
  phase: GamePhase
  onClose: () => void
  currentPlayer: Player | undefined
}) {
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll messages container to bottom
  useEffect(() => {
    if (messagesContainerRef.current) {
      const timer = setTimeout(() => {
        messagesContainerRef.current?.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior: 'smooth',
        })
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [messages])

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white relative">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern" />
      </div>
      
      <div className="neo-accent-corner-tl opacity-30 z-10" />
      <div className="neo-accent-corner-tr opacity-30 z-10" />
      
      {/* Chat Header */}
      <div className="h-auto shrink-0 px-3 sm:px-4 py-3 neo-border-b flex items-center justify-between bg-black text-white relative z-10">
        <div className="flex items-center gap-2 relative z-10">
          <div className="w-8 h-8 sm:w-10 sm:h-10 neo-border-sm bg-[var(--primary)] flex items-center justify-center text-black neo-shadow-sm transform -rotate-3">
            <MessageSquare className="w-4 h-4 lg:w-5 lg:h-5" strokeWidth={3} />
          </div>
          <div className="flex flex-col">
            <h3 
              data-text="PERCAKAPAN"
              className="font-black text-[10px] lg:text-xs uppercase tracking-[0.2em] text-[var(--primary)] leading-none italic"
            >
              PERCAKAPAN
            </h3>
          </div>
        </div>
        <button
          onClick={onClose}
          className="neo-button bg-white text-black p-1.5 h-auto hover:bg-[var(--danger)] hover:text-white transition-colors"
        >
          <X className="w-3.5 h-3.5 lg:w-4 h-4" strokeWidth={3} />
        </button>
      </div>

      {/* Messages List */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-3 custom-scrollbar relative z-10"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
            <Radio size={48} className="mb-6 text-black animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-black">
              MENUNGGU SINYAL...
            </p>
          </div>
        )}
        {messages
          .filter(
            (msg) =>
              msg.type !== 'description_submitted' &&
              msg.type !== 'system' &&
              !msg.message
                .toLowerCase()
                .includes('submitted their description') &&
              !msg.message
                .toLowerCase()
                .includes('has submitted their description'),
          )
          .map((msg: ChatMessageType, i: number) => (
            <ChatMessage key={i} msg={msg} isMine={msg.playerId === playerId} />
          ))}
        <div ref={chatEndRef} className="h-1" />
      </div>

      {/* Input Module */}
      <div className="p-2 sm:p-2.5 bg-[var(--neutral)] neo-border-t shrink-0 space-y-2 relative z-10">
        {/* Conditional Description Input */}
        <AnimatePresence>
          {phase === 'speaking' && isMyTurn && !currentPlayer?.description && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="p-3 neo-card bg-black gap-3 flex flex-col mb-2 border-[var(--primary)] border-2"
            >
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[var(--primary)]" strokeWidth={3} />
                <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest">
                  INPUT DATA PETUNJUK
                </span>
              </div>
              <form onSubmit={handleSendDescription} className="flex gap-2">
                <input
                  type="text"
                  value={descriptionInput}
                  onChange={(e) => setDescriptionInput(e.target.value)}
                  placeholder="Kirim kode petunjuk..."
                  className="flex-1 bg-white/10 border-none text-white text-xs py-2 px-3 focus:ring-1 focus:ring-[var(--primary)] transition-all placeholder:text-white/20 font-bold italic"
                />
                <button
                  type="submit"
                  disabled={!descriptionInput.trim()}
                  className="neo-button bg-[var(--primary)] text-black p-2 hover:scale-105 transition-transform"
                >
                  <Send className="w-4 h-4" strokeWidth={3} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
 
        <form onSubmit={handleSendChat} className="flex gap-2">
          <div className="flex-1 relative group">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ketik pesan..."
              className="w-full neo-input text-xs py-2 px-3 pr-10 bg-white"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-20">
               <Wifi size={12} />
            </div>
          </div>
          <button
            type="submit"
            className="neo-button bg-black text-white p-2 sm:p-2.5 hover:bg-[var(--primary)] hover:text-black transition-colors"
            disabled={!chatInput.trim()}
          >
            <Send className="w-4 lg:w-5 h-4 lg:h-5" strokeWidth={3} />
          </button>
        </form>
      </div>
    </div>
  )
}

function ChatMessage({
  msg,
  isMine,
}: {
  msg: ChatMessageType
  isMine: boolean
}) {
  const isSystem = msg.playerName === 'SYSTEM'
  const type = msg.type || 'chat'

  if (isSystem || type === 'system') {
    return (
      <div className="flex justify-center py-2 w-full">
        <div className="bg-[var(--neutral)] neo-border-sm px-2 py-1 neo-shadow-sm text-xs sm:text-sm font-black text-black uppercase tracking-[0.15em] text-center max-w-[95%] transform rotate-1 italic gap-2 flex items-center justify-center">
          <AlertCircle className="w-4 h-4 text-black" strokeWidth={3} />
          {msg.message.replace('submitted their description', 'telah mengirimkan petunjuk mereka')
                     .replace('has submitted their description', 'telah mengirimkan petunjuk mereka')
                     .replace('Game started!', 'Permainan dimulai!')
                     .replace('New round started', 'Ronde baru dimulai')
                     .replace('Voting phase started', 'Tahap voting dimulai')
                     .replace('Discussion phase started', 'Tahap diskusi dimulai')
                     .replace('Speaking phase started', 'Tahap berbicara dimulai')
          }
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} gap-0.5 w-full`}
    >
      <div
        className={`flex items-center gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
      >
        <span
          className={`neo-badge text-xs sm:text-sm py-1 px-2 ${isMine ? 'bg-[var(--secondary)]' : 'bg-[var(--primary)]'}`}
        >
          {msg.playerName || 'PESERTA TANPA NAMA'}
        </span>
        <span className="text-sm font-black text-black/30 uppercase tracking-widest leading-none italic">
          {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
      <div
        className={`
        px-2.5 py-1 neo-border-sm neo-shadow-sm text-xs sm:text-sm leading-snug max-w-[85%] relative transition-all font-bold uppercase italic neo-pop
        ${
          type === 'vote'
            ? 'bg-[var(--danger)] text-white'
            : type === 'pass'
              ? 'bg-[var(--warning)] text-black'
              : isMine
                ? 'bg-[var(--success)] text-black'
                : 'bg-white text-black'
        }
      `}
      >
        <div className="flex items-center gap-2">
          {type === 'vote' && (
            <Vote size={14} strokeWidth={4} className="text-white shrink-0" />
          )}
          {type === 'pass' && (
            <AlertCircle size={14} strokeWidth={4} className="text-black shrink-0" />
          )}
          <p className="tracking-tight">{msg.message}</p>
        </div>
      </div>
    </motion.div>
  )
}

function StartingView() {
  const [statusIdx, setStatusIdx] = useState(0);
  const statuses = [
    "MENYIAPKAN KEKACAUAN",
    "MENDISTRIBUSIKAN KATA",
    "MENGUNDUH IDENTITAS",
    "ENKRIPSI DATA SELESAI",
    "LINK AMAN TERBENTUK"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIdx((prev) => (prev + 1) % statuses.length);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col items-center justify-center py-6 text-center min-h-[40vh] relative overflow-hidden"
    >
      {/* Tactical Grid Background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]" />
      
      <motion.div
        animate={{ 
          y: [0, -5, 0],
          rotate: [0, 1, -1, 0]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10"
      >
        <h2 
          className="text-4xl sm:text-6xl font-black uppercase italic tracking-tighter text-black transform -skew-x-12 mb-2"
        >
          SIAP?
        </h2>
      </motion.div>

      <div className="flex items-center gap-3 px-6 py-4 bg-[var(--success)] neo-border neo-shadow transform -rotate-1 mb-10 relative z-10">
        <div className="absolute -top-3 -left-3 bg-black text-white text-[10px] font-black px-2 py-0.5 uppercase tracking-widest rotate-[-5deg]">
          SYSTEM ACTIVE
        </div>
        <PartyPopper size={28} strokeWidth={4} className="text-black animate-bounce" />
        <div className="flex flex-col items-start">
          <p className="text-base sm:text-xl text-black font-black tracking-widest uppercase italic leading-none">
            MEMULAI PESTA...
          </p>
          <span className="text-[10px] font-black opacity-50 uppercase tracking-[0.2em] mt-1">PROTOCOL UNDERCOVER V2.0</span>
        </div>
      </div>

      <div className="space-y-4 w-full max-w-[320px] flex flex-col items-center relative z-10">
        <div className="w-full flex flex-col gap-1.5">
          <div className="flex justify-between items-end px-1">
            <motion.span 
              key={statusIdx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-black italic"
            >
              {statuses[statusIdx]}
            </motion.span>
            <span className="text-[10px] font-black tabular-nums">0{statusIdx + 1}/05</span>
          </div>
          <div className="neo-progress-bar w-full h-3 border-2 border-black bg-white/50 overflow-hidden relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 5, ease: 'linear' }}
              className="h-full bg-black relative"
            >
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)] animate-shimmer" />
            </motion.div>
          </div>
        </div>
        
        <div className="flex gap-4 opacity-20">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-black rotate-45 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      </div>

      {/* Decorative side text */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 -rotate-90 hidden lg:block">
        <span className="text-[10px] font-black text-black/10 uppercase tracking-[1em] whitespace-nowrap">
          AUTHORIZATION REQUIRED • DATA ENCRYPTED
        </span>
      </div>
    </motion.div>
  )
}

function MrWhiteGuessView({
  currentPlayer,
  guessInput,
  setGuessInput,
  onSubmit,
}: {
  currentPlayer: Player | undefined
  guessInput: string
  setGuessInput: (val: string) => void
  onSubmit: (e: React.FormEvent) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex-1 flex flex-col items-center justify-center py-8 sm:py-12 text-center max-w-xl mx-auto px-4 relative overflow-hidden"
    >
      {/* Background Matrix-like effect */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex flex-wrap gap-2 justify-center items-center">
        {[...Array(50)].map((_, i) => (
          <span key={i} className="text-[10px] font-black">{Math.random() > 0.5 ? '1' : '0'}</span>
        ))}
      </div>

      <div className="mb-4 relative">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-2 border-dashed border-black/10 rounded-full scale-[2]"
        />
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-black neo-border flex items-center justify-center neo-shadow transform rotate-3 relative z-10">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.7, 1]
            }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Lock size={24} strokeWidth={3} className="text-[var(--primary)]" />
          </motion.div>
        </div>
        <div className="absolute -top-3 -right-12 bg-[var(--danger)] text-white px-4 py-2 font-black text-sm sm:text-lg uppercase tracking-widest rotate-12 neo-border-sm neo-shadow-sm z-20">
          TERIDENTIFIKASI!
        </div>
      </div>

      <div className="space-y-4 mb-8 relative z-10">
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.5em] text-black/40 italic">
            PROTOKOL DEKRIPSI AKTIF
          </span>
          <h2 
            data-text="TEBAK KATA RAHASIA"
            className="text-2xl sm:text-4xl font-black tracking-tighter text-black uppercase italic leading-none transform -skew-x-6"
          >
            TEBAK KATA RAHASIA
          </h2>
        </div>

        <div className="bg-white neo-border p-4 neo-shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-[var(--danger)]" />
          <p className="text-black font-black text-sm sm:text-base leading-tight tracking-tight uppercase italic relative z-10">
            PENYUSUP <span className="bg-black text-white px-2 py-0.5 mx-1 inline-block">MR. WHITE</span> TELAH DITEMUKAN!
            <br />
            <span className="text-black/50 text-xs sm:text-sm mt-3 block">
              {currentPlayer?.role === 'mrwhite'
                ? 'SATU KESEMPATAN UNTUK MEMECAHKAN KODE DAN MEMENANGKAN MISI INI.'
                : 'MENUNGGU PENYUSUP MEMASUKKAN KUNCI DEKRIPSI...'}
            </span>
          </p>
        </div>
      </div>

      {currentPlayer?.role === 'mrwhite' ? (
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onSubmit={onSubmit}
          className="w-full max-w-sm space-y-4 px-4 relative z-10"
        >
          <div className="relative group">
            <div className="absolute -inset-1 bg-[var(--primary)]/20 blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <input
              type="text"
              value={guessInput}
              onChange={(e) => setGuessInput(e.target.value)}
              placeholder="MASUKKAN KODE..."
              className="w-full neo-input p-3 sm:p-4 text-center text-lg sm:text-2xl font-black uppercase tracking-widest italic bg-white relative z-10"
              autoFocus
              autoComplete="off"
            />
          </div>

          <button
            type="submit"
            disabled={!guessInput.trim()}
            className="w-full neo-button bg-black text-white py-3 sm:py-4 neo-pop flex items-center justify-center gap-3 group"
          >
            <Activity size={20} className="group-hover:animate-pulse" />
            <span className="font-black uppercase tracking-[0.2em] italic text-sm sm:text-lg">
              EKSEKUSI DEKRIPSI
            </span>
            <ChevronRight size={20} strokeWidth={4} />
          </button>

          <div className="flex justify-center">
            <div className="bg-[var(--warning)] neo-border-sm px-3 py-1 flex items-center gap-2 text-black neo-shadow-sm -rotate-1">
              <AlertCircle size={14} strokeWidth={3} />
              <p className="text-[10px] font-black uppercase tracking-widest leading-none">
                PERINGATAN: HANYA SATU KALI PERCOBAAN
              </p>
            </div>
          </div>
        </motion.form>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="p-6 sm:p-10 bg-black text-white neo-border neo-shadow flex flex-col items-center gap-4 relative z-10"
        >
          <div className="relative">
            <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-[var(--primary)] animate-spin" strokeWidth={3} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-ping" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-lg sm:text-2xl font-black uppercase tracking-[0.2em] italic text-[var(--primary)]">
              DEKRIPSI BERLANGSUNG
            </h3>
            <p className="text-[10px] sm:text-xs font-black text-white/40 uppercase tracking-[0.3em]">
              MENUNGGU INPUT DARI SUBJEK: MR. WHITE
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

function GameEndedView({
  room,
  playerId,
  onReturn,
}: {
  room: Room
  playerId: string | null
  onReturn: () => void
}) {
  const winners = useMemo(() => {
    const winnerRole = room.game?.winnerRole
    if (!winnerRole) return []

    return room.players.filter((p: Player) => {
      if (winnerRole === 'civilian') return p.role === 'civilian'
      if (winnerRole === 'undercover' || winnerRole === 'mrwhite') {
        return p.role === 'undercover' || p.role === 'mrwhite'
      }
      return false
    })
  }, [room.players, room.game?.winnerRole])

  const winTitle = useMemo(() => {
    const role = room.game?.winnerRole
    if (role === 'civilian') return 'PESTA TERSELAMATKAN!'
    if (role === 'undercover') return 'UNDERCOVER MENANG!'
    if (role === 'mrwhite') return 'MR. WHITE MENANG!'
    return 'PESTA BERAKHIR!'
  }, [room.game?.winnerRole])

  const winBg = useMemo(() => {
    const role = room.game?.winnerRole
    if (role === 'civilian') return 'bg-[var(--success)]'
    if (role === 'undercover') return 'bg-[var(--primary)]'
    if (role === 'mrwhite') return 'bg-[var(--warning)]'
    return 'bg-white'
  }, [room.game?.winnerRole])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="flex-1 flex flex-col items-center py-6 text-center max-w-[900px] mx-auto w-full gap-6 bg-white neo-border neo-shadow my-4 p-4 sm:p-8 relative overflow-hidden"
    >
      {/* Confetti Particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            top: -20, 
            left: `${Math.random() * 100}%`,
            rotate: 0,
            scale: 0
          }}
          animate={{ 
            top: '120%', 
            rotate: 360,
            scale: [0, 1, 1, 0],
            left: `${(Math.random() * 100) + (Math.sin(i) * 10)}%`
          }}
          transition={{ 
            duration: 3 + Math.random() * 2, 
            repeat: Infinity, 
            delay: Math.random() * 5,
            ease: "linear"
          }}
          className={`absolute w-3 h-3 sm:w-4 sm:h-4 z-0 ${
            [ 'bg-[var(--primary)]', 'bg-[var(--secondary)]', 'bg-[var(--success)]', 'bg-[var(--danger)]' ][i % 4]
          } neo-border-sm`}
        />
      ))}

      <div className="relative z-10 flex flex-col items-center gap-4">
        <motion.div 
          animate={{ 
            rotate: [10, -10, 10],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 0.5, repeat: 3 }}
          className={`w-12 h-12 sm:w-16 sm:h-16 ${winBg} neo-border flex items-center justify-center neo-shadow transform rotate-6 relative`}
        >
          <Trophy size={24} strokeWidth={4} className="text-black sm:scale-125 animate-bounce" />
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-black text-white neo-border flex items-center justify-center font-black text-xs">
            !
          </div>
        </motion.div>
  
        <div className="space-y-2">
          <span className="text-xs sm:text-sm font-black uppercase tracking-[0.6em] text-black/30 italic">
            LAPORAN AKHIR MISI
          </span>
          <h2 
            className="text-3xl sm:text-6xl font-black uppercase italic tracking-tighter text-black transform -skew-x-12 py-2 px-4"
          >
            {winTitle}
          </h2>
        </div>
        
        <div className="bg-black text-white py-1.5 px-6 inline-block transform rotate-1 neo-border neo-shadow mt-2">
          <p className="text-white font-black tracking-[0.2em] uppercase text-xs sm:text-sm italic">
            OPERASI SELESAI • STATUS: {room.game?.winnerRole?.toUpperCase()} VICTORIOUS
          </p>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4 relative z-10">
        {room.players.map((p: Player, idx: number) => {
          const isWinner = winners.some((w: Player) => w.id === p.id)
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + idx * 0.1 }}
              className={`
                p-3 neo-border transition-all flex items-center justify-between neo-shadow relative overflow-hidden group/result
                ${
                  isWinner
                    ? 'bg-[var(--primary)]'
                    : 'bg-white/40 grayscale'
                }
              `}
            >
              <div className="flex items-center gap-4 relative z-10">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 neo-border flex items-center justify-center font-black text-base transform transition-transform group-hover/result:rotate-12 ${isWinner ? 'bg-black text-white' : 'bg-[var(--neutral)] text-black'}`}>
                  {p.name[0].toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="font-black uppercase italic text-sm sm:text-base leading-none tracking-tight line-clamp-1">{p.name}</p>
                  <p className={`text-[10px] sm:text-xs font-black uppercase tracking-widest mt-1 italic ${isWinner ? 'text-black/70' : 'text-black/40'}`}>{p.role}</p>
                </div>
              </div>
              {isWinner && (
                <motion.div 
                  initial={{ scale: 3, opacity: 0, rotate: 45 }}
                  animate={{ scale: 1, opacity: 1, rotate: -10 }}
                  transition={{ delay: 1.2 + idx * 0.1, type: 'spring' }}
                  className="bg-black text-white px-3 py-1 neo-border neo-shadow-sm relative z-10 border-double border-4 border-white/20"
                >
                  <span className="text-xs font-black uppercase italic tracking-widest">JUARA!</span>
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full max-w-[500px] relative z-10">
          <button
            onClick={onReturn}
            className="neo-button bg-[var(--success)] flex-1 py-3 text-sm sm:text-lg neo-pop group"
          >
            <ArrowLeft size={20} strokeWidth={4} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-black uppercase tracking-[0.2em] italic">KE LOBBY</span>
          </button>
      </div> */}
    </motion.div>
  )
}

function PlayerCard({
  player,
  isCurrent,
  isSelf,
  phase,
  onVote,
  hasVoted,
  votesReceived,
  hasActioned,
}: {
  player: Player
  isCurrent: boolean
  isSelf: boolean
  phase: GamePhase
  onVote: () => void
  hasVoted: boolean
  votesReceived?: number
  hasActioned?: boolean
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={player.isAlive ? { y: -5, rotate: isSelf ? 0 : isCurrent ? 1 : -1 } : {}}
      className={`relative bg-white neo-border p-1.5 flex flex-col gap-2 transition-all neo-shadow-sm ${
        isCurrent && player.isAlive ? 'border-[var(--primary)] border-2 ring-2 ring-[var(--primary)]/20' : ''
      } ${!player.isAlive ? 'grayscale opacity-60 bg-gray-100' : ''}`}
    >
      {/* Tactical markings */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-black/10 z-0" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-black/10 z-0" />
      
      {/* Identity Label */}
      <div className="flex justify-between items-center px-1 relative z-10">
        <div className="flex items-center gap-1.5">
          {hasActioned && player.isAlive && (
            <div className="flex items-center gap-0.5 bg-black text-[var(--primary)] px-1 py-0.5 rounded-sm">
              <Check size={6} strokeWidth={4} />
              <span className="text-[5px] font-black uppercase tracking-tighter">READY</span>
            </div>
          )}
        </div>
        {player.isAlive && (
          <div className="flex gap-0.5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`w-1 h-1 rounded-full ${isCurrent ? 'bg-[var(--primary)] animate-pulse' : 'bg-black/10'}`} style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-3 relative z-10 py-1">
        {/* Word Hint Badge - Intercepted Signal Style */}
        <AnimatePresence>
          {player.description && player.isAlive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute -top-12 left-1/2 -translate-x-1/2 w-[120%] z-40 pointer-events-none"
            >
              <div className="bg-black max-w-[150px] mx-auto text-[var(--primary)] p-1.5 neo-border-sm neo-shadow-sm text-center transform -rotate-1 relative">
                <div className="absolute -top-2 left-2 bg-[var(--primary)] text-black text-[6px] font-black px-1 uppercase tracking-tighter">
                  INTERCEPTED
                </div>
                <p className="text-[9px] sm:text-[10px] font-black leading-none tracking-tight uppercase break-words italic">
                  "{player.description}"
                </p>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black border-r border-b border-[var(--primary)] rotate-45" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative">
          {/* Avatar Base */}
          <div
            className={`w-12 h-12 sm:w-14 sm:h-14 neo-border flex items-center justify-center font-black text-lg transition-all duration-500 neo-shadow relative z-10 ${
              isCurrent && player.isAlive
                ? 'bg-black text-[var(--primary)] rotate-3'
                : isSelf
                  ? 'bg-[var(--secondary)] text-black -rotate-2'
                  : 'bg-white text-black'
            }`}
          >
            {player.name[0].toUpperCase()}
            
            {/* Active Scanning Overlay */}
            {isCurrent && player.isAlive && (
              <motion.div 
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-[1px] bg-[var(--primary)] z-20 shadow-[0_0_10px_var(--primary)]"
              />
            )}

            {/* Vote Count Badge */}
            {phase === 'voting' && votesReceived && votesReceived > 0 && player.isAlive && (
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                className="absolute -top-3 -right-3 w-6 h-6 bg-[var(--danger)] text-white neo-border-sm neo-shadow-sm flex items-center justify-center font-black text-[10px] z-30"
              >
                {votesReceived}
              </motion.div>
            )}
          </div>
          
          {/* Status Indicators */}
          <div className="absolute -bottom-2 -right-2 z-20 flex gap-1">
            {isSelf && (
              <div className="w-5 h-5 bg-black text-white neo-border-sm flex items-center justify-center neo-shadow-sm">
                <Shield size={10} strokeWidth={3} />
              </div>
            )}
            {isCurrent && player.isAlive && (
              <div className="w-5 h-5 bg-[var(--primary)] text-black neo-border-sm flex items-center justify-center neo-shadow-sm animate-bounce">
                <Activity size={10} strokeWidth={3} />
              </div>
            )}
          </div>

          {!player.isAlive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-30 transform rotate-[-5deg] neo-border">
              <span className="text-[8px] font-black text-[var(--danger)] uppercase tracking-[0.2em] mb-1">TERMINATED</span>
              <X size={24} strokeWidth={4} className="text-[var(--danger)]" />
            </div>
          )}
        </div>

        <div className="text-center w-full space-y-1 mt-1">
          <div className="flex flex-col items-center">
            <div className={`px-2 py-0.5 neo-border-sm neo-shadow-sm inline-flex items-center justify-center min-w-[80px] max-w-full relative ${isSelf ? 'bg-[var(--secondary)]' : 'bg-white'}`}>
              <p className="font-black text-[10px] sm:text-xs tracking-tight truncate uppercase text-black italic leading-none">
                {player.name}
              </p>
              {isSelf && (
                <div className="absolute -top-3 right-0 bg-black text-white text-[6px] font-black px-1 py-0.5 uppercase tracking-widest rotate-6">
                  YOU
                </div>
              )}
            </div>
          </div>
  
          <div className="flex items-center justify-center min-h-[14px]">
            {isCurrent && player.isAlive ? (
              <div className="flex items-center gap-1 text-[var(--primary)] font-black text-[7px] uppercase tracking-widest italic animate-pulse">
                <Wifi size={8} /> TRANSMITTING...
              </div>
            ) : player.isAlive ? (
              <span className="text-[7px] font-black text-black/20 uppercase tracking-[0.2em] italic">SYNCED</span>
            ) : (
              <span className="text-[7px] font-black text-[var(--danger)]/40 uppercase tracking-[0.2em] italic">OFFLINE</span>
            )}
          </div>
        </div>

        {phase === 'voting' && player.isAlive && !isSelf && !hasVoted && (
          <button
            onClick={onVote}
            className="neo-button w-full mt-1 bg-black text-white py-1.5 font-black uppercase tracking-widest italic hover:bg-[var(--danger)] hover:text-white transition-all text-[9px] flex items-center justify-center gap-1.5 neo-pop group"
          >
            <Target className="w-3 h-3 text-[var(--danger)] group-hover:scale-125 transition-transform" strokeWidth={4} />
            ELIMINASI
          </button>
        )}
      </div>
    </motion.div>
  )
}

function Timer({
  endsAt,
  onExpire,
}: {
  endsAt?: number
  onExpire: () => void
}) {
  const [timeLeft, setTimeLeft] = useState(0)
  const [initialTime, setInitialTime] = useState<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!endsAt) {
      setInitialTime(null)
      setTimeLeft(0)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
      return
    }
    
    const now = Date.now()
    const remaining = Math.max(0, Math.ceil((endsAt - now) / 1000))
    
    // Always update initial time when endsAt changes to a future time
    setInitialTime(remaining)

    const update = () => {
      const currentRemaining = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000))
      setTimeLeft(currentRemaining)
      
      // Play tick sound when low (start at 10s to match UI "isLow")
      if (currentRemaining <= 10 && currentRemaining > 0) {
        if (!audioRef.current) {
          audioRef.current = new Audio('/sounds/tick.mp3')
          audioRef.current.volume = 0.3
          audioRef.current.loop = true
        }
        
        if (audioRef.current.paused) {
          audioRef.current.play().catch(() => {})
        }
      } else {
        // Stop audio if not in critical time or expired
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current.currentTime = 0
        }
      }
      
      if (currentRemaining === 0) onExpire()
    }
    update()
    const interval = setInterval(update, 1000)
    return () => {
      clearInterval(interval)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
    }
  }, [endsAt, onExpire])

  const progress = initialTime ? (timeLeft / initialTime) * 100 : 0
  const isLow = timeLeft <= 10 && timeLeft > 0

  return (
    <div className="flex flex-col gap-1 items-end">
      <div
        className={`flex items-center gap-1.5 px-2 py-1 neo-border-sm neo-shadow-sm transition-all duration-300 transform -rotate-1 ${
          isLow
            ? 'bg-[var(--danger)] text-white'
            : 'bg-white text-black'
        }`}
      >
        <TimerIcon
          className={`w-3.5 h-3.5 ${isLow ? 'text-white animate-bounce' : 'text-black'}`}
          strokeWidth={4}
        />
        <span
          className="text-xs sm:text-base font-black tabular-nums italic tracking-tighter"
        >
          {timeLeft.toString().padStart(2, '0')}S
        </span>
      </div>
      {/* Progress Bar */}
      <div className="w-12 sm:w-16 h-1 neo-border-sm bg-black/10 overflow-hidden relative">
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "linear" }}
          className={`h-full ${isLow ? 'bg-[var(--danger)]' : 'bg-[var(--primary)]'}`}
        />
      </div>
    </div>
  )
}

function RoleOverlay({
  player,
  onClose,
}: {
  player: Player
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-2 sm:p-3">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
      />
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 100, rotate: -5 }}
        animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 100, rotate: 5 }}
        className="relative w-full max-w-[320px] bg-white neo-border p-4 sm:p-6 neo-shadow flex flex-col items-center gap-4 overflow-hidden"
      >
        {/* TOP SECRET Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[35deg] pointer-events-none opacity-[0.03] select-none">
          <span className="text-8xl font-black whitespace-nowrap">TOP SECRET</span>
        </div>

        {/* Decorative corner tags */}
        <div className="absolute top-0 right-0 bg-black text-white px-3 py-1 text-[8px] font-black uppercase tracking-[0.3em] rotate-45 translate-x-4 -translate-y-1">
          CONFIDENTIAL
        </div>

        <div className="flex flex-col items-center gap-3 text-center relative z-10 w-full">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [3, -3, 3]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-12 h-12 sm:w-16 sm:h-16 bg-[var(--secondary)] neo-border flex items-center justify-center neo-shadow transform rotate-3 relative"
          >
             <div className="absolute -top-1 -left-1 w-3 h-3 bg-black" />
             <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-black" />
             <Fingerprint className="w-8 lg:w-10 h-8 lg:h-10 text-black" strokeWidth={3} />
          </motion.div>
          
          <div className="space-y-1">
            <h3 className="text-[10px] font-black text-black/40 uppercase tracking-[0.4em] italic">
              AGENT IDENTITY
            </h3>
            <h2 
              className="text-3xl sm:text-4xl font-black uppercase italic tracking-tighter text-black transform -skew-x-6 leading-none py-1"
            >
              {player.role === 'civilian' ? 'WARGA SIPIL' : player.role === 'undercover' ? 'UNDERCOVER' : 'MR. WHITE'}
            </h2>
          </div>
        </div>
 
        <div className="w-full mt-4 p-4 sm:p-6 bg-[var(--primary)] neo-border flex flex-col items-center gap-2 neo-shadow relative group">
          {/* Scanning Line Animation */}
          <motion.div 
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-0.5 bg-black/20 z-20 pointer-events-none"
          />
          
          <div className="absolute whitespace-nowrap -top-4 left-1/2 -translate-x-1/2 bg-black px-6 py-1.5 neo-border neo-shadow">
            <span className="text-[10px] font-black text-white uppercase tracking-[0.4em] italic">
              SECRET WORD
            </span>
          </div>

          <div className="py-4 relative">
             <p className="text-3xl sm:text-4xl font-black text-black uppercase tracking-tighter text-center break-all transform skew-x-6 leading-none neo-text-glow">
              {player.role === 'mrwhite' ? '???' : player.word}
            </p>
            {/* Stamp Effect for word */}
            <motion.div
              initial={{ scale: 3, opacity: 0, rotate: 15 }}
              animate={{ scale: 1, opacity: 0.1, rotate: -15 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="absolute inset-0 border-4 border-black flex items-center justify-center pointer-events-none"
            >
               <span className="font-black text-4xl opacity-20">VERIFIED</span>
            </motion.div>
          </div>
          
          {player.role === 'mrwhite' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col items-center gap-3 mt-6 text-black bg-white/40 p-4 neo-border italic neo-shadow-sm rotate-1 w-full"
            >
              <div className="flex items-center gap-2">
                <Ghost size={20} strokeWidth={4} />
                <p className="text-xs font-black uppercase tracking-[0.2em]">INFILTRASI AKTIF</p>
              </div>
              <p className="text-[10px] font-bold text-center leading-tight uppercase opacity-80">
                BAURKAN DIRI ANDA DAN TEBAK KATA RAHASIA DARI GOSIP MEREKA!
              </p>
            </motion.div>
          )}
        </div>
 
        <div className="w-full grid grid-cols-2 gap-2 mt-2">
           <div className="neo-border-sm p-1.5 flex flex-col items-center bg-gray-50">
              <span className="text-[8px] font-black opacity-30 uppercase">ACCESS LEVEL</span>
              <span className="text-xs font-black italic">LEVEL 0{player.role === 'civilian' ? '1' : '3'}</span>
           </div>
           <div className="neo-border-sm p-1.5 flex flex-col items-center bg-gray-50">
              <span className="text-[8px] font-black opacity-30 uppercase">STATUS</span>
              <span className="text-xs font-black italic">ENCRYPTED</span>
           </div>
        </div>

        <button
          onClick={onClose}
          className="neo-button w-full py-3 sm:py-4 bg-[var(--success)] text-sm sm:text-base mt-4 neo-pop group"
        >
          <span className="font-black uppercase tracking-[0.1em] italic group-hover:scale-110 transition-transform">KEMBALI KE PESTA</span>
          <ChevronRight size={18} strokeWidth={4} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>
    </div>
  )
}
