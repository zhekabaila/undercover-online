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
  PartyPopper,
  Crown, Ghost,
  Music,
  Gamepad2,
  Users, Search,
  Sparkles
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
    label: 'PARTY LOUNGE',
    color: 'bg-[var(--surface)]',
    shadow: 'neo-shadow-sm',
    icon: Users,
    accent: 'text-black/40',
  },
  starting: {
    label: 'GATHERING CREW',
    color: 'bg-[var(--primary)]',
    shadow: 'neo-shadow-sm',
    icon: PartyPopper,
    accent: 'text-black',
  },
  speaking: {
    label: 'PARTY TALK',
    color: 'bg-[var(--success)]',
    shadow: 'neo-shadow-sm',
    icon: MessageSquare,
    accent: 'text-black',
  },
  discussion: {
    label: 'PARTY GOSSIP',
    color: 'bg-[var(--secondary)]',
    shadow: 'neo-shadow-sm',
    icon: Music,
    accent: 'text-black',
  },
  voting: {
    label: 'KICK THE CRASHER',
    color: 'bg-[var(--danger)]',
    shadow: 'neo-shadow-sm',
    icon: Vote,
    accent: 'text-white',
  },
  mrwhite_guessing: {
    label: "MYSTERY GUESS",
    color: 'bg-[var(--warning)]',
    shadow: 'neo-shadow-sm',
    icon: Search,
    accent: 'text-black',
  },
  ended: {
    label: 'PARTY OVER!',
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
      <header className="sticky top-0 h-auto overflow-x-auto custom-scrollbar shrink-0 neo-border-b bg-[var(--surface)] flex items-center px-4 py-4 sm:px-6 z-[100] neo-shadow-sm">
        <div className="w-full flex items-center justify-between max-w-[1920px] mx-auto gap-4">
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() =>
                confirm('Leaving the party? You will miss all the fun!') && (leaveRoom(), router.push('/'))
              }
              className="neo-button group bg-[var(--danger)] text-white p-2 lg:p-3 hover:rotate-6 active:translate-y-0.5 transition-all flex items-center justify-center"
              title="Leave Party"
            >
              <ArrowLeft className="w-5 lg:w-6 h-5 lg:h-6 text-white group-hover:scale-110 transition-transform" strokeWidth={4} />
            </button>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 lg:gap-2">
                <h1 
                  data-text={`PARTY ID: ${params.roomId}`}
                  className="flex whitespace-nowrap items-center text-xl lg:text-4xl font-black uppercase italic leading-none tracking-tighter"
                >
                  PARTY ID: <div className="bg-[var(--primary)] px-3 py-1.5 lg:px-5 lg:py-2.5 neo-border neo-shadow-sm ml-1 text-base lg:text-2xl">{params.roomId}</div>
                </h1>
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-md hidden md:flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.9, rotate: -1 }}
              animate={{ scale: 1, rotate: 0 }}
              className={`flex items-center gap-3 px-4 py-2 neo-border ${PHASE_CONFIG[room.game.phase].color} ${PHASE_CONFIG[room.game.phase].shadow} transition-all duration-500`}
            >
              {(() => {
                const Icon = PHASE_CONFIG[room.game.phase].icon;
                return <Icon size={18} strokeWidth={3} className={room.game.phase === 'ended' ? 'animate-bounce' : 'animate-pulse'} />;
              })()}
              <span className={`text-xl sm:text-2xl font-black uppercase tracking-wider italic ${room.game.phase === 'ended' ? 'text-white' : 'text-black'}`}>
                {PHASE_CONFIG[room.game.phase].label}
              </span>
            </motion.div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            {room.game.phase !== 'voting' && (
              <Timer endsAt={room.game.turnEndTime} onExpire={() => {}} />
            )}
            
            <button
              onClick={() => setShowRoleOverlay(true)}
              className="neo-button bg-[var(--success)] text-black px-3 lg:px-6 py-2 lg:py-3 flex items-center gap-2 lg:gap-3 hover:scale-105 active:translate-y-0.1 transition-all"
            >
              <Smile className="w-4.5 lg:w-5 h-4.5 lg:h-5" strokeWidth={3} />
              <span className="hidden sm:inline text-base lg:text-lg font-black uppercase tracking-widest italic">MY ROLE</span>
            </button>
 
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`neo-button p-2 lg:p-3 flex items-center justify-center relative transition-all ${
                isChatOpen
                  ? 'bg-black text-white'
                  : 'bg-[var(--secondary)] text-black'
              }`}
            >
              <MessageSquare className="w-5 lg:w-6 h-5 lg:h-6" strokeWidth={3} />
              {messages.length > 0 && !isChatOpen && (
                <span className="absolute -top-1.5 -right-1.5 w-6 h-6 lg:w-9 lg:h-9 bg-[var(--danger)] neo-border-sm rounded-full text-xs lg:text-lg font-black flex items-center justify-center text-white animate-bounce neo-shadow-sm">
                  !
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main App Shell Layout */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Main Content Area - Independently Scrollable */}
        <main className="flex-1 min-w-0 overflow-y-auto custom-scrollbar relative z-10 px-2 py-2 sm:p-3 lg:p-4">
          <div className="max-w-[1400px] mx-auto w-full flex flex-col gap-6 sm:gap-8">
            {/* Turn Interaction Banner - Show when it's your turn to speak */}
            <AnimatePresence>
              {room.game.phase === 'speaking' &&
                isMyTurn &&
                !currentPlayer?.description && (
                  <motion.div
                    initial={{ opacity: 0, y: -40, scale: 0.95, rotate: -1 }}
                    animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    className="bg-[var(--primary)] neo-border p-4 sm:p-6 flex flex-col lg:flex-row items-center gap-4 sm:gap-6 relative overflow-hidden group neo-shadow-sm"
                  >
                    <div className="neo-accent-corner-tl opacity-50" />
                    <div className="neo-accent-corner-tr opacity-50" />
                    <div className="neo-accent-corner-bl opacity-20" />
                    <div className="neo-accent-corner-br opacity-20" />
                    
                    {/* Decorative elements for banner */}
                    <div className="absolute -top-8 -right-8 opacity-10">
                      <Send size={80} className="-rotate-12" />
                    </div>
                    
                    <div className="shrink-0 relative">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white neo-border flex items-center justify-center text-black neo-shadow-sm transform group-hover:rotate-12 transition-transform duration-500">
                        <Send size={24} className="animate-pulse" />
                      </div>
                    </div>
                    
                    <div className="flex-1 text-center lg:text-left space-y-2 relative z-10">
                      <div className="flex items-center justify-center lg:justify-start gap-2">
                        <span className="bg-black text-white px-5 py-2 text-lg font-black uppercase tracking-[0.2em]">
                          YOUR TURN!
                        </span>
                        <span className="w-2.5 h-2.5 bg-black rounded-full animate-ping" />
                      </div>
                      <h3 
                        data-text="Describe Your Word"
                        className=" text-3xl sm:text-5xl font-black uppercase italic tracking-tighter text-black leading-none transform -skew-x-6"
                      >
                        Describe Your Word
                      </h3>
                      <p className="text-black/80 font-bold uppercase text-base sm:text-lg tracking-widest italic max-w-xl">
                        Say something that hints at your word!
                      </p>
                    </div>
                    
                      <form
                        onSubmit={handleSendDescription}
                        className="w-full lg:w-[300px] flex gap-2 relative z-10"
                      >
                        <input
                          type="text"
                          value={descriptionInput}
                          onChange={(e) => setDescriptionInput(e.target.value)}
                          placeholder="Hint..."
                          maxLength={100}
                          className="flex-1 neo-input text-lg py-2 px-3 focus:bg-[var(--primary)]/10 transition-colors"
                          autoFocus
                        />
                        <button
                          type="submit"
                          disabled={!descriptionInput.trim()}
                          className="neo-button bg-black text-white px-8 py-3 text-lg font-black hover:bg-black/90 active:scale-95 transition-all"
                        >
                          SHARE
                        </button>
                      </form>
                  </motion.div>
                )}
            </AnimatePresence>

            {/* Top Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col lg:flex-row items-center justify-between bg-white neo-card p-4 lg:p-8 gap-6 lg:gap-10 relative overflow-hidden group mb-6 lg:mb-10"
            >
              <div className="neo-accent-corner-tl opacity-30" />
              <div className="neo-accent-corner-tr opacity-30" />
              
              {/* Round Info Section */}
              <div className="flex items-center gap-4 lg:gap-6 shrink-0 relative z-10 w-full lg:w-auto justify-between lg:justify-start px-1 lg:px-0">
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 neo-border bg-[var(--secondary)] flex items-center justify-center text-black neo-shadow-sm transform -rotate-6 group-hover:rotate-0 transition-transform shrink-0">
                    <Gamepad2 className="w-6 lg:w-9 h-6 lg:h-9" strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] lg:text-lg font-black text-black/30 uppercase tracking-[0.2em] lg:tracking-[0.3em] leading-none mb-1 lg:mb-2 italic">
                      PARTY VIBES
                    </span>
                    <h2 className="flex items-center text-xl lg:text-4xl font-black text-black uppercase italic tracking-tighter leading-none">
                      ROUND <div className="bg-[var(--primary)] px-3 py-1 lg:px-6 lg:py-2 neo-border neo-shadow-sm ml-2 text-xl lg:text-4xl">#{room.game.roundNumber}</div>
                    </h2>
                  </div>
                </div>
                {/* Mobile phase indicator - Redesigned */}
                <div className="lg:hidden flex flex-col items-end gap-1">
                  <span className="text-[9px] font-black text-black/30 uppercase tracking-widest italic">PHASE</span>
                  <div className="flex items-center gap-1.5 px-3 py-2 neo-border bg-white neo-shadow-sm rotate-2">
                    {(() => {
                      const Icon = PHASE_CONFIG[room.game.phase].icon;
                      return <Icon className={`w-4 h-4 ${room.game.phase === 'ended' ? 'animate-bounce' : 'animate-pulse'}`} strokeWidth={3} />;
                    })()}
                    <span className="text-xs font-black uppercase italic">
                      {PHASE_CONFIG[room.game.phase].label.split(' ')[0]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Section - Optimized for Mobile */}
              <div className="grid grid-cols-3 lg:flex items-stretch lg:items-center gap-3 lg:gap-10 relative z-10 w-full lg:w-auto border-t-4 lg:border-t-0 border-black pt-6 lg:pt-0 lg:border-l-4 lg:pl-10">
                {/* Players In */}
                <div className="flex flex-col items-center justify-center gap-2">
                  <span className="text-[9px] lg:text-lg font-black text-black/40 uppercase tracking-widest leading-none italic text-center">
                    PLAYERS
                  </span>
                  <div className="bg-[var(--neutral)] neo-border-sm lg:neo-border px-3 lg:px-5 py-1.5 lg:py-2.5 neo-shadow-sm -rotate-2 w-full flex justify-center items-center">
                    <span className="text-sm lg:text-2xl font-black text-black tabular-nums italic">
                      {room.players.filter((p: Player) => p.isAlive).length}<span className="text-black/20 mx-0.5 lg:mx-1">/</span>{room.players.length}
                    </span>
                  </div>
                </div>
                
                {/* Infiltrators (Crashers) */}
                <div className="flex flex-col items-center justify-center gap-2 group/cr">
                  <span className="text-[9px] lg:text-lg font-black text-black/40 uppercase tracking-widest leading-none italic text-center">
                    CRASHERS
                  </span>
                  <div className="flex items-center gap-1.5 lg:gap-2 bg-[var(--primary)] neo-border-sm lg:neo-border px-3 lg:px-5 py-1.5 lg:py-2.5 neo-shadow-sm group-hover/cr:scale-105 transition-transform w-full justify-center rotate-1">
                    <Search className="text-black w-4 lg:w-7 h-4 lg:h-7" strokeWidth={4} />
                    <span className="text-sm lg:text-2xl font-black text-black tabular-nums italic">
                      {infiltratorStats.undercover}
                    </span>
                  </div>
                </div>
                
                {/* Mystery Stat Box */}
                <div className="flex flex-col items-center justify-center gap-2 group/mg">
                  <span className="text-[9px] lg:text-lg font-black text-[var(--danger)]/60 uppercase tracking-widest leading-none italic text-center">
                    MYSTERY
                  </span>
                  <div className="flex items-center gap-1.5 lg:gap-2 bg-[var(--danger)] neo-border-sm lg:neo-border px-3 lg:px-5 py-1.5 lg:py-2.5 neo-shadow-sm text-white group-hover/mg:scale-105 transition-transform w-full justify-center -rotate-1">
                    <Ghost className="text-white w-4 lg:w-7 h-4 lg:h-7" strokeWidth={4} />
                    <span className="text-sm lg:text-2xl font-black text-white tabular-nums italic">
                      {infiltratorStats.mrWhite}
                    </span>
                  </div>
                </div>
              </div>

              {/* Background accents for card */}
              <div className="absolute top-0 right-0 w-24 h-full bg-[var(--neutral)] -skew-x-12 transform translate-x-12 z-0 opacity-50 hidden lg:block" />
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
                      className="flex flex-col gap-10 lg:gap-14 pb-32"
                    >
                    {room.game.phase === 'voting' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[var(--danger)] neo-border neo-shadow-sm p-4 sm:p-5 flex items-center justify-center gap-3"
                      >
                        <Vote size={24} className="text-white" />
                        <span className="text-lg sm:text-2xl font-black uppercase tracking-wider text-white text-center italic">
                          VOTE TO KICK THE PARTY CRASHER
                        </span>
                      </motion.div>
                    )}
 
                     <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 lg:gap-14">
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
                            className="neo-button bg-[var(--warning)] text-black w-full max-w-[400px] py-5 text-xl font-black"
                          >
                            <AlertCircle size={24} />
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
            className={`hidden lg:flex shrink-0 transition-all duration-300 ease-in-out neo-border-l bg-[var(--surface)] relative overflow-hidden h-full ${
              isChatOpen ? 'w-[500px] opacity-100' : 'w-0 opacity-0'
            }`}
          >
            <div className="w-[500px] h-full flex flex-col">
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
                  PARTY FOUL!
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
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center gap-4 z-[9999] p-4 text-center">
      <div className="relative">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[var(--primary)] neo-border neo-shadow-sm flex items-center justify-center -rotate-6 animate-pulse">
          <PartyPopper className="w-10 h-10 sm:w-12 sm:h-12 text-black animate-bounce" />
        </div>
      </div>
      <div className="space-y-3">
        <h2 className="text-2xl sm:text-4xl font-black uppercase italic tracking-tighter text-black leading-none transform -skew-x-6">
          Joining Party
        </h2>
        <div className="bg-[var(--success)] neo-border py-4 px-8 inline-block transform rotate-1">
          <p className="text-black font-black tracking-widest uppercase text-lg sm:text-xl">
            PARTY ID: <span className="underline decoration-4 decoration-black/20">{roomId}</span>
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
    <div className="flex flex-col h-full overflow-hidden bg-white relative">
      <div className="neo-accent-corner-tl opacity-30" />
      <div className="neo-accent-corner-tr opacity-30" />
      
      {/* Chat Header */}
      <div className="h-auto shrink-0 px-4 sm:px-5 py-4 neo-border-b flex items-center justify-between bg-[var(--secondary)]">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 neo-border bg-white flex items-center justify-center text-black">
            <MessageSquare size={16} />
          </div>
          <div>
            <h3 className="font-black text-xl sm:text-2xl uppercase tracking-wider text-black leading-none">
              CHAT LOG
            </h3>
          </div>
        </div>
        <button
          onClick={onClose}
          className="neo-button bg-white p-1.5 h-auto"
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages List */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <Music size={48} className="mb-6 text-black animate-float" />
            <p className="text-lg font-black uppercase tracking-widest text-black bg-[var(--primary)] px-8 py-3 neo-border neo-shadow-sm">
              QUIET PARTY...
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
      <div className="p-3 sm:p-4 bg-white neo-border-t shrink-0 space-y-2">
        {/* Conditional Description Input */}
        {/* <AnimatePresence>
          {phase === 'speaking' && isMyTurn && !currentPlayer?.description && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="p-3 neo-card bg-[var(--primary)]"
            >
              <div className="flex items-center gap-2 mb-2">
                <PartyPopper size={24} className="text-black" />
                <span className="text-lg font-black text-black uppercase tracking-widest">
                  YOUR TURN: SHARE A HINT
                </span>
              </div>
              <form onSubmit={handleSendDescription} className="flex gap-2">
                <input
                  type="text"
                  value={descriptionInput}
                  onChange={(e) => setDescriptionInput(e.target.value)}
                  placeholder="Secret message..."
                  className="flex-1 neo-input text-lg py-3 px-5"
                />
                <button
                  type="submit"
                  disabled={!descriptionInput.trim()}
                  className="neo-button bg-black text-white p-3"
                >
                  <Send size={20} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence> */}
 
        <form onSubmit={handleSendChat} className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Discuss here..."
            className="flex-1 neo-input text-lg py-3 px-5"
          />
          <button
            type="submit"
            className="neo-button bg-[var(--primary)] text-black p-3"
            disabled={!chatInput.trim()}
          >
            <Send size={20} />
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
        <div className="bg-[var(--neutral)] neo-border px-6 py-3 neo-shadow-sm text-base sm:text-lg font-black text-black uppercase tracking-[0.2em] text-center max-w-[90%] transform rotate-1 italic">
          {msg.message}
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
          className={`neo-badge text-base sm:text-lg py-2 px-5 ${isMine ? 'bg-[var(--secondary)]' : 'bg-[var(--primary)]'}`}
        >
          {msg.playerName || 'UNKNOWN PARTIER'}
        </span>
        <span className="text-lg font-black text-black/30 uppercase tracking-widest leading-none italic">
          {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
      <div
        className={`
        px-4 py-2 neo-border neo-shadow-sm text-base sm:text-lg leading-snug max-w-[85%] relative transition-all font-bold uppercase italic
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
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col items-center justify-center py-6 text-center min-h-[30vh]"
    >
      <div className="relative mb-3">
        <h2 
          data-text="READY?"
          className=" text-2xl sm:text-4xl font-black italic tracking-tighter text-black leading-none uppercase"
        >
          READY?
        </h2>
      </div>

      <div className="flex items-center gap-4 px-8 py-4 bg-[var(--success)] neo-border neo-shadow-sm transform -rotate-1 mb-8">
        <PartyPopper size={32} strokeWidth={4} className="text-black animate-bounce" />
        <p className="text-base sm:text-xl text-black font-black tracking-widest uppercase italic">
          STARTING THE PARTY...
        </p>
      </div>

      <div className="space-y-2 w-full max-w-[240px] flex flex-col items-center">
        <div className="neo-progress-bar w-full h-2">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 5, ease: 'linear' }}
            className="neo-progress-bar-fill bg-[var(--success)]"
          />
        </div>
        <div className="flex justify-between w-full">
          <span className="text-base sm:text-lg font-black uppercase tracking-[0.4em] opacity-30 italic">INITIALIZING CHAOS</span>
          <span className="text-base sm:text-lg font-black uppercase tracking-[0.4em] opacity-30 italic">SECURE LINK</span>
        </div>
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
      className="flex-1 flex flex-col items-center justify-center py-8 sm:py-12 text-center max-w-xl mx-auto px-4"
    >
      <div className="mb-2 relative">
        <div className="w-10 h-10 sm:w-16 sm:h-16 bg-[var(--danger)] neo-border flex items-center justify-center neo-shadow-sm rotate-3">
          <motion.div
            animate={{
              rotate: [0, -10, 10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
          >
            <Search size={20} strokeWidth={4} className="text-white sm:scale-125" />
          </motion.div>
        </div>
        <div className="absolute -top-4 -right-4 bg-black text-white px-6 py-3 font-black text-lg uppercase tracking-[0.2em] rotate-12 neo-border neo-shadow-sm">
          BUSTED!
        </div>
      </div>

      <div className="space-y-1.5 mb-4 relative">
        <div className="flex items-center justify-center gap-4">
          <div className="h-1.5 flex-1 bg-black" />
          <span className="text-lg sm:text-xl font-black uppercase tracking-[0.4em] text-black italic shrink-0">
            PARTY CRASHER IDENTIFIED
          </span>
          <div className="h-1.5 flex-1 bg-black" />
        </div>

        <h2 
          data-text="GUESS WORD"
          className=" text-2xl sm:text-5xl font-black tracking-tighter text-black uppercase italic leading-[0.85] transform -skew-x-6"
        >
          GUESS WORD
        </h2>

        <p className="text-black font-black px-4 text-xl sm:text-3xl max-w-lg mx-auto leading-tight tracking-tight uppercase italic">
          The party was crashed by{' '}
          <span className="bg-[var(--secondary)] px-5 py-3 neo-border neo-shadow-sm mx-1 inline-block -rotate-2">
            THE MYSTERY GUEST
          </span>
          <br />
          <span className="text-black/60 text-lg sm:text-xl mt-6 block">
            {currentPlayer?.role === 'mrwhite'
              ? 'Guess the secret word to win the party!'
              : 'Waiting for the crasher to guess...'}
          </span>
        </p>
      </div>

      {currentPlayer?.role === 'mrwhite' ? (
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onSubmit={onSubmit}
          className="w-full max-w-sm space-y-3 px-4"
        >
          <div className="relative">
            <input
              type="text"
              value={guessInput}
              onChange={(e) => setGuessInput(e.target.value)}
              placeholder="SECRET WORD..."
              className="w-full neo-input p-3 sm:p-5 text-lg sm:text-2xl text-center italic font-black"
              autoFocus
              autoComplete="off"
            />
          </div>

          <button
            type="submit"
            disabled={!guessInput.trim()}
            className="w-full neo-button bg-[var(--primary)] py-4 sm:py-6 text-lg sm:text-xl"
          >
            <span className="font-black uppercase tracking-[0.2em] italic">
              SUBMIT GUESS
            </span>
            <ChevronRight size={16} strokeWidth={4} />
          </button>

          <div className="flex flex-col items-center gap-2">
            <div className="bg-[var(--danger)] neo-border px-6 py-2.5 flex items-center gap-3 text-white neo-shadow-sm rotate-1">
              <AlertCircle size={22} strokeWidth={3} />
              <p className="text-lg sm:text-xl font-black uppercase tracking-[0.2em]">
                ONLY ONE GUESS ALLOWED
              </p>
            </div>
          </div>
        </motion.form>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="p-6 sm:p-8 bg-white neo-border neo-shadow-sm flex flex-col items-center gap-3 relative"
        >
          <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-black animate-spin" strokeWidth={3} />
            <h3 
              data-text="GUESSING IN PROGRESS"
              className=" text-3xl sm:text-5xl font-black text-black uppercase tracking-[0.2em] italic"
            >
              GUESSING IN PROGRESS
            </h3>
            <p className="text-base sm:text-lg font-bold text-black/60 uppercase tracking-widest italic">
              THE MYSTERY GUEST IS TRYING TO GUESS THE WORD...
            </p>
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
    if (role === 'civilian') return 'PARTY SAVED!'
    if (role === 'undercover') return 'CRASHERS WIN!'
    if (role === 'mrwhite') return 'MYSTERY GUEST WIN!'
    return 'PARTY OVER!'
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
      className="flex flex-col items-center py-4 text-center max-w-2xl mx-auto w-full gap-4 bg-white neo-border neo-shadow-sm my-4 p-4 sm:p-6 relative overflow-hidden"
    >
      {/* Celebration background elements */}
      <div className="absolute top-0 left-0 w-full h-3 bg-black" />
      <div className="absolute bottom-0 left-0 w-full h-3 bg-black" />
      
      <div className="relative">
        <motion.div 
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className={`w-12 h-12 sm:w-16 sm:h-16 ${winBg} neo-border flex items-center justify-center neo-shadow-sm transform rotate-6 relative z-10`}
        >
          <Trophy size={20} strokeWidth={4} className="text-black sm:scale-125 animate-bounce" />
        </motion.div>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--secondary)] neo-border rounded-full animate-ping opacity-50" />
      </div>
 
      <div className="space-y-1 relative z-10">
        <div className="flex flex-col items-center gap-1">
          <span className="text-lg sm:text-xl font-black uppercase tracking-[0.5em] text-black/40 italic">
            FINAL RESULTS
          </span>
          <h2 
            data-text={winTitle}
            className=" text-3xl sm:text-5xl font-black uppercase italic tracking-tighter text-black leading-[0.8] transform -skew-x-6"
          >
            {winTitle}
          </h2>
        </div>
        
        <div className="bg-black text-white py-4 px-10 inline-block transform rotate-1 neo-border neo-shadow-sm mt-4">
          <p className="text-white font-black tracking-[0.4em] uppercase text-lg sm:text-xl italic">
            PARTY CONCLUDED • FUN SECURED
          </p>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 px-4 relative z-10">
        {room.players.map((p: Player, idx: number) => {
          const isWinner = winners.some((w: Player) => w.id === p.id)
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              className={`
                p-2 neo-border transition-all flex items-center justify-between neo-shadow-sm
                ${
                  isWinner
                    ? 'bg-[var(--primary)]'
                    : 'bg-[var(--neutral)] opacity-80'
                }
              `}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 neo-border flex items-center justify-center font-black text-lg sm:text-xl uppercase
                  ${isWinner ? 'bg-white text-black' : 'bg-black text-white'}
                `}
                >
                  {p.name[0]}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xl sm:text-2xl tracking-tight uppercase italic">
                      {p.name}
                    </span>
                    {isWinner && (
                      <Crown
                        size={24}
                        strokeWidth={3}
                        className="text-black animate-pulse"
                      />
                    )}
                    {p.id === playerId && (
                      <span className="text-lg px-6 py-2.5 bg-black text-white font-black uppercase tracking-widest italic">
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col mt-2">
                    <span className={`text-lg sm:text-xl font-black uppercase tracking-widest ${isWinner ? 'text-black/60' : 'text-black/40'}`}>
                      {p.role === 'civilian' ? 'PARTIER' : p.role === 'undercover' ? 'PARTY CRASHER' : 'MYSTERY GUEST'}
                    </span>
                    {p.word && (
                      <span className="text-lg sm:text-xl font-black text-black italic bg-white/50 px-6 py-3 neo-border inline-block w-fit mt-4 uppercase neo-shadow-sm">
                        "{p.word}"
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div
                className={`px-8 py-4 neo-border text-lg sm:text-xl font-black uppercase tracking-widest italic
                ${p.isAlive ? 'bg-[var(--success)] text-black neo-shadow-sm' : 'bg-[var(--danger)] text-white'}
              `}
              >
                {p.isAlive ? 'AT PARTY' : 'KICKED OUT'}
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="mt-6 flex flex-col gap-2 w-full max-w-[500px] relative z-10">
          <button
            onClick={onReturn}
            className="neo-button bg-[var(--success)] py-5 text-lg sm:text-xl"
          >
            <ArrowLeft size={24} strokeWidth={4} />
            <span className="font-black uppercase tracking-[0.2em] italic">BACK TO LOBBY</span>
          </button>
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
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={player.isAlive ? { y: -5, rotate: isSelf ? 0 : isCurrent ? 1 : -1 } : {}}
      className={`relative bg-white neo-card p-3 flex flex-col gap-3 transition-all overflow-hidden ${
        isCurrent ? 'neo-shadow-md ring-1 ring-black' : ''
      } ${!player.isAlive ? 'grayscale opacity-60 bg-gray-50' : ''}`}
    >
      <div className="neo-accent-corner-tl opacity-20" />
      <div className="neo-accent-corner-tr opacity-20" />
      <div className="neo-accent-corner-bl opacity-5" />
      <div className="neo-accent-corner-br opacity-5" />
      {/* Tactical Accents for current player */}
      {isCurrent && player.isAlive && (
        <>
          <div className="neo-accent-corner neo-accent-corner-tl border-[var(--primary)]" />
          <div className="neo-accent-corner neo-accent-corner-tr border-[var(--primary)]" />
          <div className="neo-accent-corner neo-accent-corner-bl border-[var(--primary)]" />
          <div className="neo-accent-corner neo-accent-corner-br border-[var(--primary)]" />
          <div className="absolute inset-0 bg-[var(--primary)]/5 animate-pulse z-0" />
        </>
      )}
      <div className="flex flex-col items-center gap-3 relative z-10">
        {/* Word Hint Badge - Above Avatar */}
        <AnimatePresence>
          {player.description && player.isAlive && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute -top-10 left-1/2 -translate-x-1/2 w-full z-30 pointer-events-none px-2"
            >
              <div className="relative">
                <div className="bg-[var(--primary)] text-black px-5 py-2.5 neo-border neo-shadow-sm text-center transform -rotate-2 min-w-[120px]">
                  <p className="text-base sm:text-lg font-black leading-tight tracking-tight uppercase break-words italic">
                    "{player.description}"
                  </p>
                </div>
                {/* Pointer Arrow */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-[var(--primary)] neo-border-r neo-border-b rotate-45" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative group">
          <div
            className={`w-14 h-14 sm:w-20 sm:h-20 lg:w-24 lg:h-24 neo-border flex items-center justify-center font-black text-xl sm:text-2xl lg:text-3xl transition-all duration-500 neo-shadow-sm relative z-10 ${
              isCurrent && player.isAlive
                ? 'bg-[var(--primary)] text-black rotate-3'
                : isSelf
                  ? 'bg-[var(--secondary)] text-black'
                  : 'bg-white text-black'
            }`}
          >
            {player.name[0].toUpperCase()}
            {/* Pulsing indicator for active player */}
            {isCurrent && player.isAlive && (
              <div className="absolute -inset-1 bg-[var(--primary)]/30 neo-border-sm animate-ping -z-10" />
            )}
          </div>
          
          {/* Decorative frame for current player */}
          {isCurrent && player.isAlive && (
            <div className="absolute -inset-3 neo-border border-dashed rounded-lg animate-spin-slow opacity-30" />
          )}

          {!player.isAlive && (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--danger)]/90 neo-border z-20 transform rotate-12">
              <X size={32} strokeWidth={4} className="text-white" />
            </div>
          )}
        </div>        <div className="text-center w-full space-y-1">
          <div className="flex flex-col items-center gap-1">
            <div className={`neo-border-sm px-3 py-1 neo-shadow-sm inline-flex items-center justify-center gap-2 max-w-full relative ${isSelf ? 'bg-[var(--secondary)]' : 'bg-white'}`}>
              <p className="font-black text-base sm:text-lg tracking-tight truncate uppercase text-black italic leading-none">
                {player.name}
              </p>
 
              {/* Status Pendants */}
              <div className="flex items-center gap-2 absolute -top-6 left-1/2 -translate-x-1/2 w-max">
                {isSelf && (
                  <span className="text-base sm:text-lg font-black bg-black text-white px-5 py-2 neo-border-sm uppercase tracking-[0.2em] italic">
                    YOU
                  </span>
                )}
                {/* {player.isHost && (
                  <span className="text-base sm:text-lg font-black bg-[var(--primary)] text-black px-5 py-2 neo-border-sm uppercase tracking-[0.2em] flex items-center gap-2 italic">
                    <Crown size={16} strokeWidth={3} /> HOST
                  </span>
                )} */}
              </div>
            </div>
          </div>
 
          <div className="flex items-center justify-center min-h-[16px]">
            {isCurrent && player.isAlive ? (
              <motion.div
                animate={{ y: [0, -1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-black neo-border-sm neo-shadow-sm transform -rotate-1"
              >
                <div className="w-2.5 h-2.5 bg-black rounded-full animate-ping" />
                <span className="text-base sm:text-lg font-black uppercase tracking-[0.2em] italic">
                  THINKING...
                </span>
              </motion.div>
            ) : (
              !player.isAlive && (
                <div className="flex items-center gap-2 px-4 py-2 bg-[var(--danger)] neo-border-sm text-white neo-shadow-sm transform rotate-2">
                  <span className="text-base sm:text-lg font-black uppercase tracking-[0.2em] italic">
                    KICKED OUT
                  </span>
                </div>
              )
            )}
          </div>
        </div>


        {phase === 'voting' && player.isAlive && !isSelf && !hasVoted && (
          <button
            onClick={onVote}
            className="neo-button w-full mt-2 bg-[var(--danger)] text-white py-4 font-black uppercase tracking-widest italic hover:bg-[var(--danger)]/90 active:scale-95 transition-all text-base sm:text-lg"
          >
            <Vote size={20} strokeWidth={4} />
            VOTE
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

  useEffect(() => {
    if (!endsAt) {
      setInitialTime(null)
      return
    }
    
    const now = Date.now()
    const remaining = Math.max(0, Math.ceil((endsAt - now) / 1000))
    
    // Set initial time if we don't have one or if endsAt changed significantly (new turn)
    setInitialTime(prev => {
      if (prev === null || remaining > prev) return remaining
      return prev
    })

    const update = () => {
      const currentRemaining = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000))
      setTimeLeft(currentRemaining)
      if (currentRemaining === 0) onExpire()
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [endsAt, onExpire])

  const progress = initialTime ? (timeLeft / initialTime) * 100 : 0
  const isLow = timeLeft <= 10 && timeLeft > 0

  return (
    <div className="flex flex-col gap-1 items-end">
      <div
        className={`flex items-center gap-1.5 px-3 py-1 neo-border-sm neo-shadow-sm transition-all duration-300 transform -rotate-1 ${
          isLow
            ? 'bg-[var(--danger)] text-white'
            : 'bg-white text-black'
        }`}
      >
        <TimerIcon
          size={20}
          strokeWidth={4}
          className={isLow ? 'text-white animate-bounce' : 'text-black'}
        />
        <span
          className="text-lg sm:text-xl font-black tabular-nums italic tracking-tighter"
        >
          {timeLeft.toString().padStart(2, '0')}S
        </span>
      </div>
      {/* Progress Bar */}
      <div className="w-16 sm:w-20 h-1.5 neo-border-sm bg-black/10 overflow-hidden relative">
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
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 40, rotate: -2 }}
        animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 40, rotate: 2 }}
        className="relative w-full max-w-2xl bg-white neo-border p-2 sm:p-4 neo-shadow-sm flex flex-col items-center gap-3 overflow-hidden"
      >
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--neutral)] -rotate-12 transform translate-x-12 -translate-y-12 border-b-2 border-l-2 border-black/10" />
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-[var(--secondary)]/10 rotate-45 transform -translate-x-8 translate-y-8 rounded-full" />

        {/* Technical lines */}
        <div className="absolute top-2 right-10 w-12 h-[1px] bg-black/10" />
        <div className="absolute top-4 right-10 w-8 h-[1px] bg-black/10" />
        
        <div className="flex flex-col items-center gap-3 text-center relative z-10 w-full">
          <motion.div 
            animate={{ rotate: [5, -5, 5], scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="w-14 h-14 sm:w-20 sm:h-20 bg-[var(--secondary)] neo-border flex items-center justify-center neo-shadow-sm transform rotate-3"
          >
            <Sparkles className="w-8 lg:w-12 h-8 lg:h-12 text-black" strokeWidth={3} />
          </motion.div>
          
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-black text-black/40 uppercase tracking-[0.6em] text-center italic">
              MY PARTY ROLE
            </h3>
            <h2 
              data-text={player.role === 'civilian' ? 'PARTIER' : player.role === 'undercover' ? 'PARTY CRASHER' : 'MYSTERY GUEST'}
              className="text-4xl sm:text-5xl font-black uppercase italic tracking-tighter text-black transform -skew-x-6 leading-none"
            >
              {player.role === 'civilian' ? 'PARTIER' : player.role === 'undercover' ? 'PARTY CRASHER' : 'MYSTERY GUEST'}
            </h2>
          </div>
        </div>
 
        <div className="w-full mt-12 p-4 sm:p-6 bg-[var(--primary)] neo-border flex flex-col items-center gap-3 neo-shadow-sm relative">
          <div className="absolute whitespace-nowrap -top-10 left-1/2 -translate-x-1/2 bg-black px-10 py-3 neo-border neo-shadow-sm">
            <span className="text-lg sm:text-xl font-black text-white uppercase tracking-[0.4em] italic">
              MY SECRET WORD
            </span>
          </div>
          <p className="text-4xl sm:text-6xl font-black text-black uppercase tracking-tighter text-center break-all transform skew-x-6 leading-none py-2">
            {player.role === 'mrwhite' ? '???' : player.word}
          </p>
          
          {player.role === 'mrwhite' && (
            <div className="flex flex-col items-center gap-4 mt-8 text-black bg-white/40 p-6 neo-border italic neo-shadow-sm rotate-1">
              <div className="flex items-center gap-4">
                <Ghost size={32} strokeWidth={4} />
                <p className="text-lg sm:text-xl font-black uppercase tracking-[0.3em] text-center leading-tight">
                  INFILTRATION SUCCESS
                </p>
              </div>
              <p className="text-lg sm:text-xl font-bold text-center leading-relaxed tracking-tight uppercase opacity-90 max-w-xs">
                Blend in with the party and guess the secret word from their gossip!
              </p>
            </div>
          )}
        </div>
 
        <button
          onClick={onClose}
          className="neo-button w-full py-4 sm:py-5 bg-[var(--success)] text-lg sm:text-xl relative z-10 neo-pop"
        >
          <span className="font-black uppercase tracking-[0.2em] italic">RETURN TO PARTY</span>
        </button>
      </motion.div>
    </div>
  )
}
