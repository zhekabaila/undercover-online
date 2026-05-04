'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  Send,
  Timer as TimerIcon,
  Shield, Vote,
  AlertCircle,
  Trophy,
  Search,
  ArrowLeft,
  Loader2, X, ChevronRight,
  ShieldAlert,
  Crown,
  Users, Activity,
  Ghost
} from 'lucide-react'
import { useGameState } from '../../../../hooks/useGameState'
import { Player, GamePhase, Room, ChatMessage as ChatMessageType } from '../../../../types/game'

// --- Constants & Config ---

const PHASE_CONFIG: Record<GamePhase, { label: string; color: string; glow: string }> = {
  lobby: { 
    label: 'Lobby', 
    color: 'from-slate-500 to-slate-700', 
    glow: 'shadow-slate-500/20' 
  },
  starting: { 
    label: 'Initializing', 
    color: 'from-blue-600 to-indigo-600', 
    glow: 'shadow-blue-500/20' 
  },
  speaking: { 
    label: 'Speaking', 
    color: 'from-emerald-500 to-teal-600', 
    glow: 'shadow-emerald-500/20' 
  },
  discussion: { 
    label: 'Discussion', 
    color: 'from-amber-500 to-orange-600', 
    glow: 'shadow-amber-500/20' 
  },
  voting: { 
    label: 'Voting', 
    color: 'from-rose-500 to-red-600', 
    glow: 'shadow-rose-500/20' 
  },
  mrwhite_guessing: { 
    label: 'Final Guess', 
    color: 'from-purple-600 to-fuchsia-600', 
    glow: 'shadow-purple-500/20' 
  },
  ended: { 
    label: 'Terminated', 
    color: 'from-slate-800 to-black', 
    glow: 'shadow-slate-900/20' 
  },
}

// --- Main Component ---

export default function GameScreen() {
  const params = useParams()
  const router = useRouter()
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
    error,
  } = useGameState()

  const [chatInput, setChatInput] = useState('')
  const [guessInput, setGuessInput] = useState('')
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [showRoleOverlay, setShowRoleOverlay] = useState(false)
  const [mounted, setMounted] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Handle hydration and initial desktop state
  useEffect(() => {
    setMounted(true)
    if (window.innerWidth >= 1024) {
      setIsChatOpen(true)
    }
  }, [])

  // Auto-scroll chat
  useEffect(() => {
    if (isChatOpen) {
      const timer = setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [messages, isChatOpen])

  // Redirect to lobby if game not active
  useEffect(() => {
    const roomId = params?.roomId
    if (room && roomId && (!room.game || room.game.phase === 'lobby')) {
      router.push(`/room/${roomId}`)
    }
  }, [room, room?.game?.phase, params?.roomId, router])

  // Memoized current player
  const currentPlayer = useMemo(() => 
    room?.players.find((p: Player) => p.id === playerId)
  , [room?.players, playerId])

  const isMyTurn = useMemo(() => 
    room?.game?.phase === 'speaking' &&
    room?.game?.turnOrder?.playerIds[room.game.turnOrder.currentIndex] === playerId
  , [room?.game, playerId])

  if (!room || !room.game) {
    return <LoadingState roomId={params.roomId as string} />
  }

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    sendChat(chatInput)
    setChatInput('')
  }

  const handleMrWhiteGuess = (e: React.FormEvent) => {
    e.preventDefault()
    if (!guessInput.trim()) return
    mrWhiteGuess(guessInput.trim())
    setGuessInput('')
  }

  return (
    <div className="h-screen flex flex-col bg-[#020617] text-white font-sans selection:bg-blue-500/30 overflow-hidden">
      {/* Global Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:20px_20px]" />
      </div>

      {/* App Header - Sticky and Synchronized */}
      <header className="sticky top-0 z-50 w-full shrink-0 h-16 sm:h-20 border-b border-white/10 bg-[#020617]/80 backdrop-blur-xl flex items-center px-4 sm:px-8 shadow-2xl">
        <div className="w-full flex items-center justify-between max-w-[1920px] mx-auto gap-4">
          <div className="flex items-center gap-3 sm:gap-6">
            <button 
              onClick={() => confirm('Exit game?') && (leaveRoom(), router.push('/'))}
              className="p-2.5 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10"
              title="Exit Room"
            >
              <ArrowLeft size={20} className="text-slate-400" />
            </button>
            <div className="h-6 w-px bg-white/10 hidden sm:block" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none hidden sm:inline">Terminal</span>
                <span className="text-sm sm:text-lg font-mono font-bold text-blue-500 leading-none">{params.roomId}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-6">
            <div className={`flex items-center gap-2.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r ${PHASE_CONFIG[room.game.phase].color} border border-white/10 shadow-lg ${PHASE_CONFIG[room.game.phase].glow} transition-all duration-500`}>
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em]">{PHASE_CONFIG[room.game.phase].label}</span>
            </div>
            <div className="h-8 w-px bg-white/10 hidden md:block" />
            <div className="hidden md:block">
              <Timer endsAt={room.game.turnEndTime} onExpire={() => {}} />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="md:hidden">
              <Timer endsAt={room.game.turnEndTime} onExpire={() => {}} />
            </div>
            <button
              onClick={() => setShowRoleOverlay(true)}
              className="group relative flex items-center gap-2.5 px-3 py-2 sm:px-4 sm:py-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl transition-all"
            >
              <Shield size={18} className="text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block text-blue-100">Role</span>
            </button>

            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`p-2.5 sm:p-3 rounded-xl transition-all border shadow-lg ${
                isChatOpen 
                  ? 'bg-blue-600 border-blue-400 text-white shadow-blue-600/20' 
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
              }`}
            >
              <MessageSquare size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main App Shell Layout */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Main Content Area - Independently Scrollable */}
        <main className="flex-1 min-w-0 overflow-y-auto custom-scrollbar relative z-10 px-4 py-6 sm:p-8 lg:p-12">
          <div className="max-w-[1400px] mx-auto w-full flex flex-col gap-6 sm:gap-8">
            {/* Top Stats Bar */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between bg-white/[0.03] border border-white/5 p-4 sm:p-5 rounded-3xl backdrop-blur-md shadow-2xl"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Activity size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 leading-none">Round Stats</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-black text-white uppercase italic">Round #{room.game.roundNumber}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="flex flex-col items-end">
                  <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 leading-none">Agents Alive</span>
                  <div className="flex items-center gap-2">
                    <Users size={12} className="text-blue-500" />
                    <span className="text-sm font-black text-white">{room.players.filter((p: Player) => p.isAlive).length} / {room.players.length}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Game Phase Content */}
            <div className="flex-1 min-h-[40vh] flex flex-col">
              <AnimatePresence mode="wait">
                {room.game.phase === 'starting' && <StartingView key="starting" />}

                {['speaking', 'discussion', 'voting'].includes(room.game.phase) && (
                  <motion.div
                    key="gameplay"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    className="flex flex-col gap-6 sm:gap-8 pb-32"
                  >
                    {room.game.phase === 'voting' && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-3xl flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(244,63,94,0.1)]"
                      >
                        <ShieldAlert className="text-rose-500" size={20} />
                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-rose-500 animate-pulse text-center">
                          Security Compromised: Eliminate The Infiltrator
                        </span>
                      </motion.div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
                      {room.players.map((player: Player) => (
                        <PlayerCard
                          key={player.id}
                          player={player}
                          isCurrent={room.game?.turnOrder?.playerIds[room.game.turnOrder.currentIndex] === player.id}
                          isSelf={player.id === playerId}
                          phase={room.game!.phase}
                          onVote={() => castVote(player.id)}
                          hasVoted={!!room.game?.votes?.[playerId!]}
                        />
                      ))}
                    </div>

                    {room.game.phase === 'voting' && !room.game?.passes?.[playerId!] && !room.game?.votes?.[playerId!] && currentPlayer?.isAlive && (
                      <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-center pt-8"
                      >
                        <button
                          onClick={() => passVote()}
                          className="w-full max-w-[280px] bg-amber-500 hover:bg-amber-400 text-white font-black py-4 px-6 rounded-3xl transition-all shadow-2xl shadow-amber-500/40 active:scale-95 border-b-4 border-amber-700 hover:border-amber-600 active:border-b-0 uppercase tracking-[0.2em] flex items-center justify-center gap-3 text-[10px]"
                        >
                          <AlertCircle size={18} />
                          Abstain Vote
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
            className={`hidden lg:flex shrink-0 transition-all duration-300 ease-in-out border-l border-white/5 bg-[#020617]/50 backdrop-blur-2xl relative overflow-hidden ${
              isChatOpen ? 'w-[400px] opacity-100' : 'w-0 opacity-0'
            }`}
          >
            <div className="w-[400px] h-full flex flex-col">
              <ChatContent 
                messages={messages} 
                playerId={playerId} 
                chatInput={chatInput}
                setChatInput={setChatInput}
                handleSendChat={handleSendChat}
                isMyTurn={isMyTurn}
                turnDone={turnDone}
                chatEndRef={chatEndRef}
                phase={room.game.phase}
                onClose={() => setIsChatOpen(false)}
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
              className="relative h-full w-[90%] max-w-[400px] bg-[#03081a] border-l border-white/10 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
              <ChatContent 
                messages={messages} 
                playerId={playerId} 
                chatInput={chatInput}
                setChatInput={setChatInput}
                handleSendChat={handleSendChat}
                isMyTurn={isMyTurn}
                turnDone={turnDone}
                chatEndRef={chatEndRef}
                phase={room.game.phase}
                onClose={() => setIsChatOpen(false)}
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
              className="bg-rose-600/20 text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-4 border border-rose-500/30 backdrop-blur-2xl"
            >
              <AlertCircle size={24} className="text-rose-500 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-300">Warning</span>
                <span className="font-bold text-sm leading-tight">{error.message}</span>
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
    <div className="fixed inset-0 bg-[#020617] flex flex-col items-center justify-center gap-6 z-[9999]">
      <div className="relative">
        <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
        <div className="absolute inset-0 bg-blue-500/20 blur-2xl animate-pulse" />
      </div>
      <div className="text-center px-6">
        <p className="text-white font-black text-xl uppercase tracking-[0.3em] mb-2">Synchronizing</p>
        <p className="text-slate-500 text-sm font-medium">Establishing secure link to {roomId}...</p>
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
  isMyTurn, 
  turnDone, 
  chatEndRef, 
  phase,
  onClose
}: {
  messages: ChatMessageType[];
  playerId: string | null;
  chatInput: string;
  setChatInput: (val: string) => void;
  handleSendChat: (e: React.FormEvent) => void;
  isMyTurn: boolean;
  turnDone: () => void;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  phase: GamePhase;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Chat Header */}
      <div className="h-16 sm:h-20 shrink-0 px-6 sm:px-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <MessageSquare size={20} />
          </div>
          <div>
            <h3 className="font-black text-[11px] uppercase tracking-[0.25em] text-white">Encrypted Intel</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Stable Connection</span>
            </div>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2.5 hover:bg-white/5 rounded-xl transition-all text-slate-500 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 custom-scrollbar bg-gradient-to-b from-transparent to-blue-500/[0.02]">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
            <Ghost size={48} className="mb-6 animate-bounce" />
            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400">No signals detected</p>
          </div>
        )}
        {messages.map((msg: ChatMessageType, i: number) => (
          <ChatMessage 
            key={i} 
            msg={msg} 
            isMine={msg.playerId === playerId} 
          />
        ))}
        <div ref={chatEndRef} className="h-4" />
      </div>

      {/* Input Module */}
      <div className="p-4 sm:p-8 bg-[#0a0f1d] border-t border-white/10 shrink-0">
        <form onSubmit={handleSendChat} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={isMyTurn ? 'Transmitting description...' : 'Observing network...'}
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4.5 pl-6 pr-16 focus:outline-none focus:border-blue-500/50 transition-all text-sm placeholder:text-slate-600 shadow-inner"
              disabled={phase === 'speaking' && !isMyTurn}
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all disabled:opacity-10 active:scale-90 shadow-lg shadow-blue-600/20"
              disabled={!chatInput.trim() || (phase === 'speaking' && !isMyTurn)}
            >
              <Send size={20} />
            </button>
          </div>
          
          {isMyTurn && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              type="button"
              onClick={turnDone}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-xl shadow-emerald-600/30 active:scale-95 border-b-4 border-emerald-800 hover:border-emerald-700 active:border-b-0"
            >
              Confirm Signal Transmission
            </motion.button>
          )}
        </form>
      </div>
    </div>
  )
}

function ChatMessage({ msg, isMine }: { msg: ChatMessageType; isMine: boolean }) {
  const isSystem = msg.playerName === 'SYSTEM'
  const type = msg.type || 'chat'

  if (isSystem) {
    return (
      <div className="flex justify-center py-4">
        <div className="bg-white/[0.03] border border-white/5 px-5 py-2 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] text-center max-w-[85%] backdrop-blur-md">
          {msg.message}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: isMine ? 30 : -30, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} gap-1.5`}
    >
      <div className="flex items-center gap-2 px-2">
        <span className={`text-[10px] font-black uppercase tracking-widest ${isMine ? 'text-blue-400' : 'text-slate-500'}`}>
          {msg.playerName}
        </span>
        {isMine && <span className="text-[8px] font-black text-blue-500/50 uppercase tracking-widest">Self</span>}
      </div>
      <div className={`
        px-5 py-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[95%] shadow-xl
        ${type === 'vote' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400 font-black italic tracking-tight' :
          type === 'pass' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400 font-black italic tracking-tight' :
          isMine ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-600/10' :
          'bg-white/[0.05] border border-white/10 text-slate-200 rounded-tl-none backdrop-blur-sm'}
      `}>
        <div className="flex items-center gap-3">
          {type === 'vote' && <Vote size={14} className="animate-pulse" />}
          {type === 'pass' && <AlertCircle size={14} className="animate-pulse" />}
          {msg.message}
        </div>
      </div>
    </motion.div>
  )
}

function StartingView() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="flex-1 flex flex-col items-center justify-center py-20 text-center min-h-[50vh]"
    >
      <div className="relative mb-16">
        <motion.div 
          animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.4, 0.1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-blue-600 blur-[120px] rounded-full"
        />
        <h2 className="text-6xl sm:text-[10rem] font-black italic tracking-tighter bg-gradient-to-b from-white via-white to-white/10 bg-clip-text text-transparent leading-none drop-shadow-2xl">
          LINKING
        </h2>
      </div>
      <div className="flex items-center gap-4 px-8 py-4 bg-white/5 border border-white/10 rounded-[2rem] backdrop-blur-2xl shadow-2xl">
        <Loader2 size={24} className="text-blue-500 animate-spin" />
        <p className="text-[10px] sm:text-xs text-blue-400 font-black tracking-[0.6em] uppercase">
          Establishing Uplink...
        </p>
      </div>
    </motion.div>
  )
}

function MrWhiteGuessView({ 
  currentPlayer, 
  guessInput, 
  setGuessInput, 
  onSubmit 
}: {
  currentPlayer: Player | undefined;
  guessInput: string;
  setGuessInput: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center max-w-2xl mx-auto"
    >
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-purple-500/20 blur-[100px] rounded-full animate-pulse" />
        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_50px_rgba(168,85,247,0.3)] relative z-10 border border-white/20">
          <Search size={48} className="text-white" />
        </div>
      </div>
      
      <h2 className="text-4xl sm:text-6xl font-black mb-6 tracking-tighter text-purple-400 uppercase italic leading-none">
        FINAL BREACH
      </h2>
      <p className="text-slate-400 mb-12 font-bold px-6 text-sm sm:text-lg max-w-md leading-relaxed tracking-tight">
        Agent White is compromised but can still override the system.
      </p>

      {currentPlayer?.role === 'mrwhite' ? (
        <form onSubmit={onSubmit} className="w-full max-w-md space-y-6 px-6">
          <input
            type="text"
            value={guessInput}
            onChange={(e) => setGuessInput(e.target.value)}
            placeholder="DECODE THE WORD..."
            className="w-full bg-white/[0.03] border-2 border-purple-500/40 rounded-[2rem] py-5 sm:py-7 px-8 text-xl sm:text-3xl text-center focus:outline-none focus:border-purple-500 transition-all shadow-2xl backdrop-blur-2xl text-white placeholder:text-slate-800 font-black uppercase tracking-[0.2em]"
            autoFocus
          />
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-5 sm:py-6 rounded-[2rem] transition-all shadow-2xl shadow-purple-600/40 active:scale-95 border-b-4 border-purple-800 hover:border-purple-700 active:border-b-0 uppercase tracking-[0.3em] text-[10px] sm:text-sm"
          >
            Authorize System Guess
          </button>
        </form>
      ) : (
        <div className="p-10 sm:p-12 bg-white/[0.02] rounded-[3rem] border border-white/10 backdrop-blur-2xl flex flex-col items-center gap-8 shadow-2xl">
          <div className="relative">
            <Loader2 className="w-16 h-16 text-purple-500 animate-spin" />
            <div className="absolute inset-0 bg-purple-500/30 blur-2xl animate-pulse" />
          </div>
          <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Agent White is decoding...</p>
        </div>
      )}
    </motion.div>
  )
}

function GameEndedView({ 
  room, 
  playerId, 
  onReturn 
}: {
  room: Room;
  playerId: string | null;
  onReturn: () => void;
}) {
  const winners = useMemo(() => {
    const winnerRole = room.game?.winnerRole;
    if (!winnerRole) return [];

    return room.players.filter((p: Player) => {
      // Civilian victory: only civilians win
      if (winnerRole === 'civilian') return p.role === 'civilian';
      
      // Infiltrator victory (Undercover or Mr. White): both win together
      if (winnerRole === 'undercover' || winnerRole === 'mrwhite') {
        return p.role === 'undercover' || p.role === 'mrwhite';
      }
      
      return false;
    });
  }, [room.players, room.game?.winnerRole]);

  const winTitle = useMemo(() => {
    const role = room.game?.winnerRole;
    if (role === 'civilian') return 'Civilian Victory';
    if (role === 'undercover') return 'Undercover Win';
    if (role === 'mrwhite') return 'Agent White Breach';
    return 'Operation Concluded';
  }, [room.game?.winnerRole]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="flex flex-col items-center py-10 text-center max-w-5xl mx-auto w-full gap-12"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-yellow-500/30 blur-[100px] rounded-full animate-pulse" />
        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-yellow-400 via-orange-500 to-amber-600 rounded-[3rem] flex items-center justify-center shadow-[0_0_80px_rgba(245,158,11,0.4)] relative z-10 border border-white/30 rotate-3">
          <Trophy size={48} className="text-white drop-shadow-lg" />
        </div>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-4xl sm:text-8xl font-black uppercase tracking-tighter bg-gradient-to-b from-white via-white to-slate-600 bg-clip-text text-transparent italic leading-none px-4">
          {winTitle}
        </h2>
        <p className="text-slate-500 font-black tracking-[0.8em] uppercase text-[10px] sm:text-xs">Mission Parameters Concluded</p>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
        {room.players.map((p: Player) => {
          const isWinner = winners.some((w: Player) => w.id === p.id);
          return (
            <motion.div 
              key={p.id}
              whileHover={{ scale: 1.02 }}
              className={`
                p-5 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] border transition-all flex items-center justify-between shadow-xl
                ${isWinner 
                  ? 'bg-yellow-500/10 border-yellow-500/30 ring-1 ring-yellow-500/20' 
                  : 'bg-white/[0.02] border-white/10 opacity-50'}
              `}
            >
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-black text-base sm:text-lg uppercase shadow-lg
                  ${isWinner ? 'bg-yellow-500 text-black' : 'bg-white/10 text-slate-500'}
                `}>
                  {p.name[0]}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm sm:text-base tracking-tight">{p.name}</span>
                    {isWinner && <Crown size={14} className="text-yellow-500 fill-yellow-500/20" />}
                    {p.id === playerId && <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 bg-blue-500/20 text-blue-500 rounded-md font-black">AGENT-SELF</span>}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">
                      {p.role}
                    </span>
                    {p.word && (
                      <span className="text-[10px] font-bold text-blue-400 italic">
                        "{p.word}"
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em]
                ${p.isAlive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}
              `}>
                {p.isAlive ? 'Active' : 'Neutralized'}
              </div>
            </motion.div>
          );
        })}
      </div>
      <button
        onClick={onReturn}
        className="group relative bg-white text-black font-black px-10 py-5 sm:px-14 sm:py-6 rounded-[2rem] transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 flex items-center gap-4 uppercase tracking-[0.2em] text-[10px] sm:text-xs"
      >
        Re-Initialize System
        <ChevronRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
      </button>
    </motion.div>
  )
}

function PlayerCard({ 
  player, 
  isCurrent, 
  isSelf, 
  phase, 
  onVote, 
  hasVoted 
}: {
  player: Player;
  isCurrent: boolean;
  isSelf: boolean;
  phase: GamePhase;
  onVote: () => void;
  hasVoted: boolean;
}) {
  return (
    <motion.div
      layout
      whileHover={player.isAlive ? { y: -5, scale: 1.02 } : {}}
      className={`relative p-5 sm:p-8 rounded-[2.5rem] sm:rounded-[3rem] border-2 transition-all duration-500 group overflow-hidden shadow-2xl ${
        !player.isAlive ? 'opacity-20 grayscale' : ''
      } ${
        isCurrent && player.isAlive
          ? 'bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/20'
          : isSelf
            ? 'bg-blue-600/5 border-blue-500/30'
            : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20'
      }`}
    >
      {/* Active Turn Glow */}
      {isCurrent && player.isAlive && (
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/20 to-transparent pointer-events-none" />
      )}
      
      <div className="flex flex-col items-center gap-4 sm:gap-6 relative z-10">
        <div className="relative">
          <div className={`w-20 h-20 sm:w-28 sm:h-28 rounded-[2rem] sm:rounded-[2.5rem] flex items-center justify-center font-black text-3xl sm:text-5xl transition-all duration-700 shadow-2xl ${
            isCurrent && player.isAlive
              ? 'bg-amber-500 text-black scale-110 rotate-3'
              : isSelf
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 text-slate-500 group-hover:text-slate-300'
          }`}>
            {player.name[0].toUpperCase()}
          </div>
          
          {!player.isAlive && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[4px] rounded-[2rem] sm:rounded-[2.5rem]">
              <X size={40} className="text-rose-600 drop-shadow-2xl sm:scale-125" />
            </div>
          )}

          {isCurrent && player.isAlive && (
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-3 sm:-inset-4 border border-dashed border-amber-500/40 rounded-full"
            />
          )}
        </div>

        <div className="text-center w-full px-2">
          <p className="font-black text-sm sm:text-lg tracking-tight truncate uppercase italic text-white flex items-center justify-center gap-2">
            {player.name}
            {isSelf && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,1)]" />}
          </p>
          
          <div className="flex items-center justify-center gap-2 mt-2">
            {isCurrent && player.isAlive ? (
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                <span className="text-[8px] sm:text-[9px] font-black text-amber-500 uppercase tracking-widest">Active Link</span>
              </div>
            ) : player.isAlive ? (
              <span className="text-[8px] sm:text-[9px] font-black text-slate-600 uppercase tracking-widest opacity-60">Connected</span>
            ) : (
              <span className="text-[8px] sm:text-[9px] font-black text-rose-500/60 uppercase tracking-widest italic">Neutralized</span>
            )}
          </div>
        </div>

        {phase === 'voting' && player.isAlive && !isSelf && !hasVoted && (
          <button
            onClick={onVote}
            className="w-full mt-2 bg-rose-600 hover:bg-rose-500 text-white py-3.5 sm:py-4 rounded-2xl text-[9px] sm:text-[10px] font-black transition-all flex items-center justify-center gap-2 shadow-xl shadow-rose-600/30 active:scale-95 uppercase tracking-widest border-b-4 border-rose-800 hover:border-rose-700 active:border-b-0"
          >
            <Vote size={14} />
            Neutralize
          </button>
        )}
      </div>
    </motion.div>
  )
}

function Timer({ endsAt, onExpire }: { endsAt?: number; onExpire: () => void }) {
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    if (!endsAt) return
    const update = () => {
      const remaining = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000))
      setTimeLeft(remaining)
      if (remaining === 0) onExpire()
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [endsAt, onExpire])

  const isLow = timeLeft <= 10 && timeLeft > 0

  return (
    <div className={`flex items-center gap-2.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl border transition-all duration-500 shadow-xl ${
      isLow ? 'bg-rose-600/10 border-rose-500/40 shadow-rose-600/10' : 'bg-white/5 border-white/10'
    }`}>
      <TimerIcon size={16} className={isLow ? 'text-rose-500 animate-pulse' : 'text-blue-400'} />
      <span className={`text-sm sm:text-lg font-mono font-black tabular-nums ${isLow ? 'text-rose-500' : 'text-white'}`}>
        {timeLeft.toString().padStart(2, '0')}s
      </span>
    </div>
  )
}

function RoleOverlay({ 
  player, 
  onClose 
}: {
  player: Player;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#020617]/95 backdrop-blur-md"
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 40 }}
        className="relative w-full max-w-md bg-[#0a0f1d] border border-white/10 p-8 sm:p-12 rounded-[3rem] sm:rounded-[4rem] shadow-[0_0_120px_rgba(0,0,0,1)] flex flex-col items-center gap-10 sm:gap-12 overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
        
        <div className="flex flex-col items-center gap-6 sm:gap-8 text-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-blue-500/10 border border-blue-500/20 rounded-[2rem] sm:rounded-[2.5rem] flex items-center justify-center shadow-inner">
            <Shield size={40} className="text-blue-500 drop-shadow-lg" />
          </div>
          <div className="space-y-2">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.6em]">Protocol Identity</h3>
            <p className="text-4xl sm:text-5xl font-black uppercase italic tracking-tighter bg-gradient-to-b from-white via-white to-slate-600 bg-clip-text text-transparent">
              {player.role}
            </p>
          </div>
        </div>

        <div className="w-full p-8 sm:p-10 bg-white/[0.03] border border-white/10 rounded-[2.5rem] sm:rounded-[3rem] flex flex-col items-center gap-4 shadow-2xl relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0a0f1d] px-4 py-1 border border-white/10 rounded-full">
             <span className="text-[8px] sm:text-[9px] font-black text-blue-400 uppercase tracking-widest">Secret Word</span>
          </div>
          <p className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tighter drop-shadow-2xl text-center break-all">
            {player.role === 'mrwhite' ? '???' : player.word}
          </p>
          {player.role === 'mrwhite' && (
            <div className="flex items-center gap-3 mt-6 text-slate-500 bg-white/5 px-4 py-2 rounded-xl">
               <Ghost size={16} />
               <p className="text-[9px] sm:text-[10px] font-bold text-center leading-relaxed tracking-tight">
                Infiltrate and extract the word from communications.
               </p>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-5 sm:py-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[1.5rem] sm:rounded-[2rem] text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] transition-all hover:text-white text-slate-500 active:scale-95 shadow-xl"
        >
          Return to Uplink
        </button>
      </motion.div>
    </div>
  )
}
