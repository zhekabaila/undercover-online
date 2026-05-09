'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  Send,
  Timer as TimerIcon,
  Shield,
  Vote,
  AlertCircle,
  Trophy,
  ArrowLeft,
  Loader2,
  X,
  ChevronRight,
  ShieldAlert,
  Crown,
  Activity,
  Ghost,
} from 'lucide-react'
import { useGameState } from '../../../../hooks/useGameState'
import {
  Player,
  GamePhase,
  Room,
  ChatMessage as ChatMessageType,
} from '../../../../types/game'

// --- Constants & Config ---

const PHASE_CONFIG: Record<
  GamePhase,
  { label: string; color: string; shadow: string }
> = {
  lobby: {
    label: 'Lobby',
    color: 'bg-white',
    shadow: 'neo-shadow-sm',
  },
  starting: {
    label: 'Starting',
    color: 'bg-[#FFD600]',
    shadow: 'neo-shadow-sm',
  },
  speaking: {
    label: 'Speaking',
    color: 'bg-[#00E699]',
    shadow: 'neo-shadow-sm',
  },
  discussion: {
    label: 'Discussion',
    color: 'bg-[#FF90E8]',
    shadow: 'neo-shadow-sm',
  },
  voting: {
    label: 'Voting',
    color: 'bg-[#FF4D4D]',
    shadow: 'neo-shadow-sm',
  },
  mrwhite_guessing: {
    label: 'Final Guess',
    color: 'bg-[#FFA629]',
    shadow: 'neo-shadow-sm',
  },
  ended: {
    label: 'Terminated',
    color: 'bg-black text-white',
    shadow: 'neo-shadow-sm',
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
    <div className="h-screen flex flex-col bg-white text-[#1A1A1A] font-sans selection:bg-[#FFD600] overflow-hidden relative">
      {/* Global Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(#00000015_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* App Header */}
      <header className="sticky top-0 h-16 sm:h-20 shrink-0 border-b-4 border-black bg-white flex items-center px-4 sm:px-8 z-[100]">
        <div className="w-full flex items-center justify-between max-w-[1920px] mx-auto gap-4">
          <div className="flex items-center gap-3 sm:gap-6">
            <button
              onClick={() =>
                confirm('Exit game?') && (leaveRoom(), router.push('/'))
              }
              className="neo-button bg-[#FF4D4D] p-2.5"
              title="Exit Room"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <div className="h-10 w-1 bg-black hidden sm:block" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-2xl font-black uppercase italic leading-none">
                  ROOM: <span className="text-[#FFD600] drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">{params.roomId}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-6">
            <div
              className={`flex items-center gap-2.5 px-4 py-2 neo-border ${PHASE_CONFIG[room.game.phase].color} ${PHASE_CONFIG[room.game.phase].shadow} transition-all duration-500`}
            >
              <span className="w-2 h-2 bg-black rounded-full animate-pulse" />
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider">
                {PHASE_CONFIG[room.game.phase].label}
              </span>
            </div>
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
              className="neo-button bg-[#00E699] text-black hidden sm:flex"
            >
              <Shield size={18} />
              <span>ROLE</span>
            </button>
            <button
              onClick={() => setShowRoleOverlay(true)}
              className="neo-button bg-[#00E699] text-black sm:hidden p-2.5"
            >
              <Shield size={20} />
            </button>

            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`neo-button ${
                isChatOpen
                  ? 'bg-black text-white'
                  : 'bg-[#FF90E8] text-black'
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
            {/* Turn Interaction Banner - Show when it's your turn to speak */}
            <AnimatePresence>
              {room.game.phase === 'speaking' &&
                isMyTurn &&
                !currentPlayer?.description && (
                  <motion.div
                    initial={{ opacity: 0, y: -40, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    className="neo-card bg-[#FFD600] p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 sm:gap-10 relative overflow-hidden group"
                  >
                    <div className="shrink-0 relative">
                      <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center text-white border-4 border-white neo-shadow-sm">
                        <Send size={32} className="animate-pulse" />
                      </div>
                    </div>
                    <div className="flex-1 text-center sm:text-left space-y-1">
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-black">
                          ACTION REQUIRED
                        </span>
                        <span className="w-2 h-2 bg-black rounded-full animate-ping" />
                      </div>
                      <h3 className="text-2xl sm:text-4xl font-black uppercase italic tracking-tight text-black">
                        Describe Your Word
                      </h3>
                    </div>
                    <form
                      onSubmit={handleSendDescription}
                      className="w-full sm:w-[400px] flex gap-3"
                    >
                      <input
                        type="text"
                        value={descriptionInput}
                        onChange={(e) => setDescriptionInput(e.target.value)}
                        placeholder="Type here..."
                        maxLength={100}
                        className="flex-1 neo-input"
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={!descriptionInput.trim()}
                        className="neo-button bg-black text-white"
                      >
                        SEND
                      </button>
                    </form>
                  </motion.div>
                )}
            </AnimatePresence>

            {/* Top Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap items-center justify-between neo-card p-4 sm:p-5 gap-4"
            >
              <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                <div className="w-12 h-12 neo-border bg-[#FF90E8] flex items-center justify-center text-black neo-shadow-sm">
                  <Activity size={24} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-black uppercase tracking-widest leading-none">
                    OPERATION
                  </span>
                  <span className="text-xl font-black text-black uppercase italic">
                    ROUND #{room.game.roundNumber}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 sm:gap-8 overflow-hidden">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-black uppercase tracking-widest leading-none">
                    AGENTS
                  </span>
                  <span className="text-xl font-black text-black">
                    {room.players.filter((p: Player) => p.isAlive).length}/{room.players.length}
                  </span>
                </div>
                
                <div className="h-10 w-1 bg-black" />

                {/* Infiltrators Stat Box */}
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2">
                      <Ghost size={16} className="text-black" />
                      <span className="text-lg font-black text-black">
                        {infiltratorStats.undercover}
                      </span>
                    </div>
                    <span className="text-[8px] font-black text-black uppercase">Undercover</span>
                  </div>
                  <div className="w-1 h-6 bg-black/20" />
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2">
                      <ShieldAlert size={16} className="text-[#FF4D4D]" />
                      <span className="text-lg font-black text-[#FF4D4D]">
                        {infiltratorStats.mrWhite}
                      </span>
                    </div>
                    <span className="text-[8px] font-black text-black uppercase">Mr. White</span>
                  </div>
                </div>
              </div>
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
                    className="flex flex-col gap-6 sm:gap-8 pb-32"
                  >
                    {room.game.phase === 'voting' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#FF4D4D] neo-border neo-shadow-sm p-4 flex items-center justify-center gap-3"
                      >
                        <ShieldAlert className="text-white" size={20} />
                        <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-white text-center">
                          ELIMINATE THE INFILTRATOR
                        </span>
                      </motion.div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
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
                          className="flex justify-center pt-8"
                        >
                          <button
                            onClick={() => passVote()}
                            className="neo-button bg-[#FFA629] text-black w-full max-w-[280px]"
                          >
                            <AlertCircle size={18} />
                            <span>ABSTAIN VOTE</span>
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
            className={`hidden lg:flex shrink-0 transition-all duration-300 ease-in-out border-l-4 border-black bg-white relative overflow-hidden h-full ${
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
              className="relative h-full w-[90%] max-w-[400px] bg-white border-l-4 border-black flex flex-col shadow-[8px_0_0_rgba(0,0,0,1)]"
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
              className="bg-[#FF4D4D] text-white px-6 py-4 neo-border neo-shadow-lg flex items-center gap-4"
            >
              <AlertCircle size={24} className="text-white shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/80">
                  SYSTEM ERROR
                </span>
                <span className="font-black text-sm leading-tight uppercase italic">
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
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center gap-8 z-[9999] p-6 text-center">
      <div className="relative">
        <div className="w-24 h-24 bg-[#FFD600] border-4 border-black neo-shadow-lg flex items-center justify-center -rotate-6 animate-pulse">
          <Loader2 className="w-12 h-12 text-black animate-spin" />
        </div>
      </div>
      <div className="space-y-4">
        <h2 className="text-4xl sm:text-6xl font-black uppercase italic tracking-tighter text-black leading-none transform -skew-x-6">
          Synchronizing
        </h2>
        <div className="bg-[#00E699] border-2 border-black py-2 px-6 inline-block transform rotate-1">
          <p className="text-black font-black tracking-widest uppercase text-sm">
            Linking to Room: <span className="underline decoration-4 decoration-black/20">{roomId}</span>
          </p>
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
    <div className="flex flex-col h-full overflow-hidden bg-white border-l-4 border-black">
      {/* Chat Header */}
      <div className="h-16 sm:h-20 shrink-0 px-6 sm:px-8 border-b-4 border-black flex items-center justify-between bg-[#FF90E8]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 neo-border bg-white flex items-center justify-center text-black">
            <MessageSquare size={20} />
          </div>
          <div>
            <h3 className="font-black text-sm uppercase tracking-wider text-black">
              CHAT LOG
            </h3>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-black rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-black uppercase tracking-widest">
                CONNECTED
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="neo-button bg-white p-2"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages List */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar bg-[radial-gradient(#00000008_1px,transparent_1px)] [background-size:16px_16px]"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <Ghost size={48} className="mb-4 text-black animate-float" />
            <p className="text-xs font-black uppercase tracking-widest text-black bg-[#FFD600] px-4 py-1 border-2 border-black neo-shadow-sm">
              NO SIGNALS
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
                .includes('submitted their tactical description') &&
              !msg.message
                .toLowerCase()
                .includes('has submitted their description'),
          )
          .map((msg: ChatMessageType, i: number) => (
            <ChatMessage key={i} msg={msg} isMine={msg.playerId === playerId} />
          ))}
        <div ref={chatEndRef} className="h-2" />
      </div>

      {/* Input Module */}
      <div className="p-4 sm:p-6 bg-white border-t-4 border-black shrink-0 space-y-4">
        {/* Conditional Description Input */}
        <AnimatePresence>
          {phase === 'speaking' && isMyTurn && !currentPlayer?.description && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="p-4 neo-card bg-[#FFD600]"
            >
              <div className="flex items-center gap-2 mb-3">
                <Send size={14} className="text-black" />
                <span className="text-[10px] font-black text-black uppercase tracking-widest">
                  YOUR TURN: DESCRIBE WORD
                </span>
              </div>
              <form onSubmit={handleSendDescription} className="flex gap-2">
                <input
                  type="text"
                  value={descriptionInput}
                  onChange={(e) => setDescriptionInput(e.target.value)}
                  placeholder="Secret message..."
                  className="flex-1 neo-input"
                />
                <button
                  type="submit"
                  disabled={!descriptionInput.trim()}
                  className="neo-button bg-black text-white p-2"
                >
                  <Send size={18} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSendChat} className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Discuss here..."
            className="flex-1 neo-input"
          />
          <button
            type="submit"
            className="neo-button bg-[#FFD600] text-black"
            disabled={!chatInput.trim()}
          >
            <Send size={18} />
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

  if (isSystem && !type) {
    return (
      <div className="flex justify-center py-4 w-full">
        <div className="bg-[#F5F5F5] border-2 border-black px-4 py-1.5 neo-shadow-sm text-[10px] font-black text-black uppercase tracking-widest text-center max-w-[90%] transform rotate-1">
          {msg.message}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} gap-2 w-full`}
    >
      <div
        className={`flex items-center gap-3 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
      >
        <div
          className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
        >
          <span
            className={`neo-badge ${isMine ? 'bg-[#FF90E8]' : 'bg-[#FFD600]'}`}
          >
            {msg.playerName || 'Unknown Agent'}
          </span>
        </div>
        <span className="text-[10px] font-black text-black/40 uppercase tracking-widest leading-none italic">
          {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
      <div
        className={`
        px-4 py-3 border-3 border-black neo-shadow-sm text-[13px] leading-relaxed max-w-[85%] relative transition-all font-bold
        ${
          type === 'vote'
            ? 'bg-[#FF4D4D] text-white italic'
            : type === 'pass'
              ? 'bg-[#FFA629] text-black italic'
              : isMine
                ? 'bg-[#00E699] text-black'
                : 'bg-white text-black'
        }
      `}
      >
        <div className="flex items-center gap-2">
          {type === 'vote' && (
            <Vote size={14} className="text-white shrink-0" />
          )}
          {type === 'pass' && (
            <AlertCircle size={14} className="text-black shrink-0" />
          )}
          <p className="tracking-tight uppercase">{msg.message}</p>
        </div>
      </div>
    </motion.div>
  )
}

function StartingView() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col items-center justify-center py-20 text-center min-h-[60vh] bg-white"
    >
      <div className="relative mb-12">
        <h2 className="text-7xl sm:text-[12rem] font-black italic tracking-tighter text-black leading-none uppercase">
          Linking
        </h2>
        <div className="absolute -bottom-4 left-0 w-full h-4 bg-[#FFD600] border-t-4 border-black" />
      </div>

      <div className="flex items-center gap-6 px-10 py-6 bg-[#00E699] border-4 border-black neo-shadow transform -rotate-1">
        <Loader2 size={32} className="text-black animate-spin" />
        <p className="text-sm sm:text-lg text-black font-black tracking-widest uppercase italic">
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
      className="flex flex-col items-center justify-center py-12 sm:py-20 text-center max-w-2xl mx-auto px-4"
    >
      <div className="mb-12 relative">
        <div className="w-32 h-32 sm:w-40 sm:h-40 bg-[#FF4D4D] border-4 border-black flex items-center justify-center neo-shadow rotate-3">
          <motion.div
            animate={{
              rotate: [0, -10, 10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
          >
            <ShieldAlert size={64} className="text-white" />
          </motion.div>
        </div>
        <div className="absolute -top-4 -right-4 bg-black text-white px-3 py-1 font-black text-xs uppercase tracking-widest rotate-12 border-2 border-black">
          Warning!
        </div>
      </div>

      <div className="space-y-4 mb-12 relative">
        <div className="flex items-center justify-center gap-4">
          <div className="h-1 flex-1 bg-black" />
          <span className="text-xs font-black uppercase tracking-widest text-black italic">
            Security Breach Protocol
          </span>
          <div className="h-1 flex-1 bg-black" />
        </div>

        <h2 className="text-6xl sm:text-9xl font-black tracking-tighter text-black uppercase italic leading-none transform -skew-x-6">
          Override
        </h2>

        <p className="text-black font-black px-6 text-sm sm:text-xl max-w-md mx-auto leading-tight tracking-tight uppercase">
          System compromised by{' '}
          <span className="bg-[#FF90E8] px-2 border-2 border-black">
            Agent White
          </span>
          <br />
          {currentPlayer?.role === 'mrwhite'
            ? 'Decrypt the civilian word or face termination.'
            : 'Final transmission in progress...'}
        </p>
      </div>

      {currentPlayer?.role === 'mrwhite' ? (
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onSubmit={onSubmit}
          className="w-full max-w-md space-y-8 px-6"
        >
          <div className="relative">
            <input
              type="text"
              value={guessInput}
              onChange={(e) => setGuessInput(e.target.value)}
              placeholder="SECRET WORD..."
              className="w-full bg-white border-4 border-black p-6 sm:p-8 text-3xl sm:text-5xl text-center focus:outline-none neo-shadow text-black placeholder:text-black/20 font-black uppercase tracking-widest italic"
              autoFocus
              autoComplete="off"
            />
          </div>

          <button
            type="submit"
            disabled={!guessInput.trim()}
            className="w-full bg-[#FFD600] border-4 border-black py-6 sm:py-8 neo-shadow hover:translate-x-[-2px] hover:translate-y-[-2px] hover:neo-shadow-lg active:translate-x-[2px] active:translate-y-[2px] active:neo-shadow-sm transition-all flex items-center justify-center gap-4"
          >
            <span className="text-xl sm:text-2xl font-black uppercase tracking-widest text-black italic">
              Execute Breach
            </span>
            <ChevronRight size={32} className="text-black" />
          </button>

          <div className="flex flex-col items-center gap-2">
            <div className="bg-[#FF4D4D] border-2 border-black px-4 py-1 flex items-center gap-2 text-white">
              <AlertCircle size={16} />
              <p className="text-[10px] font-black uppercase tracking-widest">
                Single Authorization Only
              </p>
            </div>
          </div>
        </motion.form>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="p-12 sm:p-20 bg-white border-4 border-black neo-shadow-lg flex flex-col items-center gap-8 relative"
        >
          <Loader2 className="w-24 h-24 text-black animate-spin" />
          <div className="space-y-2">
            <p className="text-lg sm:text-2xl font-black text-black uppercase tracking-widest italic">
              Encryption Override in Progress
            </p>
            <p className="text-xs font-bold text-black/60 uppercase tracking-widest">
              Agent White is decrypting the sequence...
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
    if (role === 'civilian') return 'Civilian Victory'
    if (role === 'undercover') return 'Undercover Win'
    if (role === 'mrwhite') return 'Agent White Breach'
    return 'Operation Concluded'
  }, [room.game?.winnerRole])

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center py-10 text-center max-w-5xl mx-auto w-full gap-12 bg-white border-8 border-black neo-shadow-lg my-10 p-10"
    >
      <div className="relative">
        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-[#FFD600] border-4 border-black flex items-center justify-center neo-shadow rotate-3">
          <Trophy size={48} className="text-black" />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-4xl sm:text-8xl font-black uppercase tracking-tighter text-black italic leading-none px-4 transform -skew-x-6">
          {winTitle}
        </h2>
        <div className="bg-[#00E699] border-2 border-black py-1 px-4 inline-block transform rotate-1">
          <p className="text-black font-black tracking-widest uppercase text-[10px] sm:text-xs">
            Mission Parameters Concluded
          </p>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
        {room.players.map((p: Player) => {
          const isWinner = winners.some((w: Player) => w.id === p.id)
          return (
            <motion.div
              key={p.id}
              className={`
                p-5 sm:p-6 border-4 border-black transition-all flex items-center justify-between neo-shadow-sm
                ${
                  isWinner
                    ? 'bg-[#FFD600]'
                    : 'bg-white opacity-60'
                }
              `}
            >
              <div className="flex items-center gap-5">
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 border-2 border-black flex items-center justify-center font-black text-base sm:text-lg uppercase
                  ${isWinner ? 'bg-white text-black' : 'bg-black text-white'}
                `}
                >
                  {p.name[0]}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm sm:text-base tracking-tight uppercase">
                      {p.name}
                    </span>
                    {isWinner && (
                      <Crown
                        size={16}
                        className="text-black"
                      />
                    )}
                    {p.id === playerId && (
                      <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 bg-[#FF90E8] text-black border-2 border-black font-black uppercase">
                        Self
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] sm:text-[10px] font-black text-black/60 uppercase tracking-widest">
                      {p.role}
                    </span>
                    {p.word && (
                      <span className="text-[10px] font-black text-black italic bg-white/40 px-1 border border-black/10 inline-block w-fit">
                        "{p.word}"
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div
                className={`px-3 py-1.5 sm:px-4 sm:py-2 border-2 border-black text-[8px] sm:text-[9px] font-black uppercase tracking-widest
                ${p.isAlive ? 'bg-[#00E699] text-black' : 'bg-[#FF4D4D] text-white'}
              `}
              >
                {p.isAlive ? 'Active' : 'Neutralized'}
              </div>
            </motion.div>
          )
        })}
      </div>
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
}: {
  player: Player
  isCurrent: boolean
  isSelf: boolean
  phase: GamePhase
  onVote: () => void
  hasVoted: boolean
}) {
  return (
    <motion.div
      layout
      className={`relative p-6 sm:p-10 border-4 border-black transition-all duration-300 neo-shadow-lg bg-white ${
        !player.isAlive ? 'opacity-40 grayscale' : ''
      } ${
        isCurrent && player.isAlive
          ? 'ring-8 ring-[#FFD600]/30'
          : ''
      }`}
    >
      <div className="flex flex-col items-center gap-6 sm:gap-8 relative z-10">
        {/* Tactical Description Badge - Above Avatar */}
        <AnimatePresence>
          {player.description && player.isAlive && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute -top-16 left-1/2 -translate-x-1/2 w-full z-30 pointer-events-none"
            >
              <div className="relative">
                <div className="bg-[#FFD600] text-black px-4 py-2 border-4 border-black neo-shadow-sm text-center transform -rotate-1">
                  <p className="text-[10px] sm:text-xs font-black leading-tight tracking-tight uppercase break-words">
                    {player.description}
                  </p>
                </div>
                {/* Pointer Arrow */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#FFD600] border-r-4 border-b-4 border-black rotate-45" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative">
          <div
            className={`w-28 h-28 sm:w-36 sm:h-36 border-4 border-black flex items-center justify-center font-black text-4xl sm:text-6xl transition-all duration-300 neo-shadow-sm relative z-10 ${
              isCurrent && player.isAlive
                ? 'bg-[#FFD600] text-black scale-110'
                : isSelf
                  ? 'bg-[#FF90E8] text-black'
                  : 'bg-white text-black'
            }`}
          >
            {player.name[0].toUpperCase()}
          </div>

          {!player.isAlive && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#FF4D4D]/80 border-4 border-black z-20">
              <X size={64} className="text-white" />
            </div>
          )}
        </div>

        <div className="text-center w-full space-y-4">
          <div className="flex flex-col items-center gap-2">
            <div className={`border-4 border-black px-5 py-2.5 neo-shadow-sm inline-flex items-center justify-center gap-3 max-w-full relative ${isSelf ? 'bg-[#FF90E8]' : 'bg-white'}`}>
              <p className="font-black text-sm sm:text-base tracking-tight truncate uppercase text-black italic">
                {player.name}
              </p>

              {/* Pendants */}
              <div className="flex items-center gap-1.5 absolute -top-4 left-1/2 -translate-x-1/2">
                {isSelf && (
                  <span className="text-[8px] font-black bg-[#FF90E8] text-black px-3 py-0.5 border-2 border-black uppercase tracking-widest">
                    You
                  </span>
                )}
                {player.isHost && (
                  <span className="text-[8px] font-black bg-[#FFD600] text-black px-3 py-0.5 border-2 border-black uppercase tracking-widest flex items-center gap-1">
                    <Crown size={10} /> Host
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center h-6">
            {isCurrent && player.isAlive ? (
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="flex items-center gap-2 px-4 py-1.5 bg-[#FFD600] text-black border-2 border-black neo-shadow-sm"
              >
                <TimerIcon size={14} className="animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest italic">
                  Speaking
                </span>
              </motion.div>
            ) : (
              !player.isAlive && (
                <div className="flex items-center gap-2 px-4 py-1.5 bg-[#FF4D4D] border-2 border-black text-white neo-shadow-sm transform rotate-2">
                  <Ghost size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest italic">
                    Terminated
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        {phase === 'voting' && player.isAlive && !isSelf && !hasVoted && (
          <button
            onClick={onVote}
            className="w-full mt-4 bg-[#FF4D4D] text-white py-4 border-4 border-black neo-shadow hover:translate-x-[-2px] hover:translate-y-[-2px] hover:neo-shadow-lg active:translate-x-[2px] active:translate-y-[2px] active:neo-shadow-sm transition-all flex items-center justify-center gap-3 uppercase font-black text-xs tracking-widest italic"
          >
            <Vote size={20} />
            Vote Neutralize
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
    <div
      className={`flex items-center gap-3 px-6 py-2 border-4 border-black neo-shadow transition-all duration-300 ${
        isLow
          ? 'bg-[#FF4D4D] text-white'
          : 'bg-white text-black'
      }`}
    >
      <TimerIcon
        size={20}
        className={isLow ? 'text-white animate-bounce' : 'text-black'}
      />
      <span
        className="text-xl sm:text-2xl font-black tabular-nums italic"
      >
        {timeLeft.toString().padStart(2, '0')}S
      </span>
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-white/80 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 40 }}
        className="relative w-full max-w-md bg-white border-8 border-black p-8 sm:p-12 neo-shadow-lg flex flex-col items-center gap-10 overflow-hidden"
      >
        <div className="flex flex-col items-center gap-6 sm:gap-8 text-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#FF90E8] border-4 border-black flex items-center justify-center neo-shadow transform rotate-3">
            <Shield size={40} className="text-black" />
          </div>
          <div className="space-y-2">
            <h3 className="text-[10px] font-black text-black uppercase tracking-[0.4em] bg-[#F5F5F5] px-2 py-0.5 border-2 border-black inline-block">
              Protocol Identity
            </h3>
            <p className="text-5xl sm:text-6xl font-black uppercase italic tracking-tighter text-black transform -skew-x-6">
              {player.role}
            </p>
          </div>
        </div>

        <div className="w-full p-8 sm:p-10 bg-[#FFD600] border-4 border-black flex flex-col items-center gap-4 neo-shadow relative transform -rotate-1">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black px-4 py-1 border-2 border-black">
            <span className="text-[10px] font-black text-white uppercase tracking-widest">
              Secret Word
            </span>
          </div>
          <p className="text-4xl sm:text-7xl font-black text-black uppercase tracking-tighter text-center break-all transform skew-x-6">
            {player.role === 'mrwhite' ? '???' : player.word}
          </p>
          {player.role === 'mrwhite' && (
            <div className="flex items-center gap-3 mt-6 text-black bg-white/40 p-4 border-2 border-black italic">
              <Ghost size={20} />
              <p className="text-xs font-black text-center leading-tight tracking-tight uppercase">
                Infiltrate and extract the word from communications.
              </p>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-6 bg-[#00E699] border-4 border-black text-black text-xl font-black uppercase tracking-widest italic neo-shadow hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[2px] active:translate-y-[2px] transition-all"
        >
          Return to Uplink
        </button>
      </motion.div>
    </div>
  )
}
