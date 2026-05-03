'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  MessageSquare,
  Send,
  Timer as TimerIcon,
  Shield,
  Eye,
  Vote,
  AlertCircle,
  Trophy,
  Search,
} from 'lucide-react'
import { useGameState } from '@/hooks/useGameState'
import { Player, GamePhase } from '@/types/game'
import { Loader2 } from 'lucide-react'

const PHASE_LABELS: Record<GamePhase, string> = {
  lobby: 'Lobby',
  starting: 'Starting...',
  speaking: 'Speaking Phase', // Legacy - no longer used
  discussion: 'Discussion Phase',
  voting: 'Voting Phase',
  mrwhite_guessing: 'Mr. White Guessing',
  ended: 'Game Over',
}

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
  const chatEndRef = useRef<HTMLDivElement>(null)

  const handleMrWhiteGuess = (e: React.FormEvent) => {
    e.preventDefault()
    if (!guessInput.trim()) return
    mrWhiteGuess(guessInput.trim())
    setGuessInput('')
  }

  useEffect(() => {
    // Use a stable roomId from params
    const roomId = params?.roomId
    if (room && roomId && (!room.game || room.game.phase === 'lobby')) {
      router.push(`/room/${roomId}`)
    }
  }, [room, room?.game?.phase, params?.roomId, router])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!room || !room.game) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="text-gray-400 font-bold animate-pulse">
          Loading Game State...
        </p>
      </div>
    )
  }

  const currentPlayer = room.players.find((p: Player) => p.id === playerId)
  const isMyTurn =
    room.game.phase === 'speaking' &&
    room.game.turnOrder.playerIds[room.game.turnOrder.currentIndex] === playerId

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    sendChat(chatInput)
    setChatInput('')
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white flex flex-col h-screen overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] sm:w-[40%] h-[60%] sm:h-[40%] bg-blue-600/10 blur-[80px] sm:blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] sm:w-[40%] h-[60%] sm:h-[40%] bg-purple-600/10 blur-[80px] sm:blur-[120px] rounded-full pointer-events-none" />

      {/* Header / Timer */}
      <header className="p-3 sm:p-4 bg-[#020617]/80 border-b border-white/10 flex items-center justify-between backdrop-blur-2xl z-50 shadow-2xl shrink-0 sticky top-0">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden lg:flex items-center gap-2 mr-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Room</span>
            <span className="font-mono font-bold text-blue-500">{params.roomId}</span>
          </div>
          <div className="bg-blue-600 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black tracking-widest uppercase shadow-lg shadow-blue-500/20 flex flex-col justify-center leading-tight">
            <span className="text-blue-200/60 text-[6px] sm:text-[8px] mb-0.5">
              Phase
            </span>
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              {room.game ? PHASE_LABELS[room.game.phase] : '...'}
            </div>
          </div>
          <div className="text-[10px] sm:text-sm font-bold text-gray-400 bg-white/5 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-white/5">
            R{room.game.roundNumber}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-6">
          <Timer endsAt={room.game.turnEndTime} onExpire={() => {}} />
          <div className="hidden sm:block">
            {currentPlayer && <RoleCard player={currentPlayer} compact={true} />}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`p-2 rounded-lg transition-all ${isChatOpen ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400'}`}
            title="Toggle Chat"
          >
            <MessageSquare size={20} />
          </button>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to quit?')) {
                leaveRoom()
                router.push('/')
              }
            }}
            className="bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black transition-all active:scale-95"
          >
            QUIT
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative pt-12 md:pt-24">
        {/* Game Area */}
        <div className={`flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 transition-all duration-300 ${isChatOpen ? 'md:mr-96' : ''}`}>
          {/* Mobile Role Badge (Floating) */}
          <div className="sm:hidden flex justify-center mb-4">
             {currentPlayer && <RoleCard player={currentPlayer} compact={true} />}
          </div>
          {/* Phase: Starting */}
          {room.game.phase === 'starting' && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center"
            >
              <h2 className="text-6xl font-black mb-4 animate-bounce">
                READY?
              </h2>
              <p className="text-xl text-gray-400">
                Starting discussion phase...
              </p>
            </motion.div>
          )}

          {/* Phase: Ended */}
          {room.game.phase === 'ended' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto"
            >
              <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-yellow-500/20">
                <Trophy size={48} className="text-white" />
              </div>
              <h2 className="text-5xl font-black mb-2 uppercase tracking-tighter">
                {room.game.winnerRole === 'civilian'
                  ? 'Civilians Won!'
                  : room.game.winnerRole === 'undercover'
                    ? 'Undercovers Won!'
                    : 'Mr. White Won!'}
              </h2>
              <p className="text-gray-400 mb-8">
                The game has ended. Revealing all roles...
              </p>

              <div className="grid grid-cols-2 gap-4 w-full mb-8">
                {room.players.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white/5 p-4 rounded-2xl border border-white/10 flex justify-between items-center overflow-hidden"
                  >
                    <span className="font-bold truncate mr-2">{p.name}</span>
                    <span
                      className={`text-[10px] font-black uppercase px-3 py-1 rounded-full shrink-0 ${
                        p.role === 'civilian'
                          ? 'bg-green-600'
                          : p.role === 'undercover'
                            ? 'bg-red-600'
                            : 'bg-purple-600'
                      }`}
                    >
                      {p.role}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => router.push(`/room/${params.roomId}`)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-4 rounded-2xl transition-all shadow-xl active:scale-95 flex items-center gap-2"
              >
                BACK TO LOBBY
              </button>
            </motion.div>
          )}

          {/* Phase: Mr. White Guessing */}
          {room.game.phase === 'mrwhite_guessing' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto"
            >
              <div className="w-20 h-20 bg-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-purple-500/20 rotate-12">
                <Search size={40} className="text-white" />
              </div>
              <h2 className="text-4xl font-black mb-2 uppercase tracking-tighter text-purple-400">
                Mr. White's Last Stand
              </h2>
              <p className="text-gray-400 mb-8">
                Mr. White was caught! But they have one chance to win by
                guessing the secret word.
              </p>

              {currentPlayer?.role === 'mrwhite' ? (
                <form
                  onSubmit={handleMrWhiteGuess}
                  className="w-full space-y-4"
                >
                  <input
                    type="text"
                    value={guessInput}
                    onChange={(e) => setGuessInput(e.target.value)}
                    placeholder="Enter the secret word..."
                    className="w-full bg-white/5 border-2 border-purple-500/50 rounded-2xl py-4 px-6 text-xl text-center focus:outline-none focus:border-purple-500 transition-all shadow-xl"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg active:scale-95"
                  >
                    SUBMIT GUESS
                  </button>
                </form>
              ) : (
                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 animate-pulse">
                  <p className="text-xl font-bold">Mr. White is guessing...</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Discussion/Voting Phase - Player Grid */}
          {['discussion', 'voting'].includes(room.game.phase) && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {room.players.map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    isCurrent={
                      room.game?.turnOrder.playerIds[
                        room.game.turnOrder.currentIndex
                      ] === player.id
                    }
                    isSelf={player.id === playerId}
                    phase={room.game!.phase}
                    onVote={() => castVote(player.id)}
                    hasVoted={!!room.game?.votes[playerId!]}
                  />
                ))}
              </div>

              {/* Voting Phase - Pass Button */}
              {room.game.phase === 'voting' &&
                !room.game?.passes?.[playerId!] && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={() => passVote()}
                      disabled={!!room.game?.votes[playerId!]}
                      className={`px-8 py-4 rounded-2xl text-sm font-black transition-all flex items-center gap-2 ${
                        !!room.game?.votes[playerId!]
                          ? 'bg-white/5 text-gray-500 cursor-not-allowed opacity-50'
                          : 'bg-yellow-600 hover:bg-yellow-500 text-white active:scale-95 shadow-lg shadow-yellow-600/20'
                      }`}
                    >
                      PASS (NO ELIMINATION)
                    </button>
                  </div>
                )}
            </>
          )}

          {/* Role Card (Fixed at bottom for self) */}
          {/* {currentPlayer && <RoleCard player={currentPlayer} />} */}
        </div>

        {/* Chat Area - Responsive Drawer/Sidebar */}
        <aside 
          className={`
            absolute top-0 bottom-0 right-0 w-full md:w-96 bg-[#020617]/95 md:bg-[#020617]/90
            border-l border-white/10 flex flex-col overflow-hidden backdrop-blur-2xl md:backdrop-blur-md 
            z-40 transition-transform duration-300 ease-in-out
            ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}
            ${!isChatOpen ? 'pointer-events-none' : 'pointer-events-auto'}
          `}
        >
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare size={18} className="text-blue-500" />
              <h3 className="font-bold">Room Chat</h3>
            </div>
            <button 
              onClick={() => setIsChatOpen(false)}
              className="md:hidden p-2 hover:bg-white/10 rounded-lg"
            >
              <AlertCircle size={20} className="rotate-45" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => {
              const isVoteOrPass = msg.type === 'vote' || msg.type === 'pass'
              const isSystemVote =
                msg.playerName === 'SYSTEM' && msg.type === 'vote'
              const isSystemPass =
                msg.playerName === 'SYSTEM' && msg.type === 'pass'

              return (
                <div
                  key={i}
                  className={`flex flex-col ${msg.playerId === playerId ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-gray-500 font-bold uppercase mb-1">
                    {msg.playerName}
                  </span>
                  <div
                    className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm ${
                      isSystemVote
                        ? 'bg-red-600/30 border border-red-500/50 text-red-200 flex items-center gap-2'
                        : isSystemPass
                          ? 'bg-yellow-600/30 border border-yellow-500/50 text-yellow-200 flex items-center gap-2'
                          : msg.playerId === playerId
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/10 text-gray-200'
                    }`}
                  >
                    {isVoteOrPass && (
                      <span
                        className={`font-black ${isSystemVote ? 'text-red-400' : 'text-yellow-400'}`}
                      >
                        {isSystemVote ? '🗳️' : '✋'}
                      </span>
                    )}
                    {msg.message}
                  </div>
                </div>
              )
            })}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendChat} className="p-4 bg-white/5">
            <div className="relative">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={
                  isMyTurn ? 'Describe your word...' : 'Chat with players...'
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:border-blue-500/50 transition-colors"
                disabled={room.game.phase === 'speaking' && !isMyTurn}
              />
              <button
                type="submit"
                className="absolute right-2 top-2 p-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors disabled:opacity-50"
                disabled={
                  !chatInput.trim() ||
                  (room.game.phase === 'speaking' && !isMyTurn)
                }
              >
                <Send size={18} />
              </button>
            </div>
            {isMyTurn && (
              <button
                type="button"
                onClick={turnDone}
                className="w-full mt-2 bg-green-600 hover:bg-green-500 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
              >
                I AM DONE TALKING
              </button>
            )}
          </form>
        </aside>
      </div>

      {error && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-red-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2"
          >
            <AlertCircle size={20} />
            <span className="font-bold">{error.message}</span>
          </motion.div>
        </div>
      )}
    </main>
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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={player.isAlive ? { y: -5, scale: 1.02 } : {}}
      className={`p-4 sm:p-5 rounded-2xl sm:rounded-[2rem] border-2 transition-all relative group ${
        !player.isAlive ? 'opacity-40 grayscale' : ''
      } ${
        isSelf
          ? 'bg-green-600/20 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]'
          : isCurrent
            ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)]'
            : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20'
      }`}
    >
      {isSelf && (
        <div className="absolute -top-3 right-2 flex items-center gap-1 bg-green-500 text-white text-[9px] font-black px-2 py-1 rounded-full shadow-lg z-10">
          <span>YOU</span>
        </div>
      )}
      {isCurrent && (
        <div
          className={`absolute -top-3 left-1/2 -translate-x-1/2 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg z-10 animate-bounce ${
            isSelf ? 'bg-green-500 ring-4 ring-green-500/20' : 'bg-blue-500'
          }`}
        >
          {isSelf ? 'VOTING PRIORITY' : 'SUSPICIOUS'}
        </div>
      )}
      <div className="flex flex-col items-center text-center gap-2 sm:gap-3">
        <div
          className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center font-black text-xl sm:text-3xl relative transition-transform duration-500 ${
            isCurrent
              ? 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-2xl shadow-blue-500/40 rotate-3'
              : 'bg-white/10'
          }`}
        >
          {player.name[0].toUpperCase()}
          {!player.isAlive && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-950/90 rounded-2xl sm:rounded-3xl border-2 border-red-500/50">
              <span className="text-[8px] sm:text-[10px] font-black uppercase rotate-[-20deg] text-red-500">
                Eliminated
              </span>
            </div>
          )}
        </div>
        <div className="w-full">
          <p className="font-black text-sm sm:text-lg truncate mb-0.5 sm:mb-1">{player.name}</p>
          <div className="h-1.5 w-12 bg-white/10 rounded-full mx-auto overflow-hidden">
            {isCurrent && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1, repeat: Infinity }}
                className="h-full bg-blue-500"
              />
            )}
          </div>
        </div>

        {phase === 'voting' && player.isAlive && !isSelf && !hasVoted && (
          <button
            onClick={onVote}
            className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white py-2 sm:py-3 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 active:scale-95"
          >
            <Vote size={12} />
            ELIMINATE
          </button>
        )}
      </div>
    </motion.div>
  )
}

function RoleCard({
  player,
  compact = false,
}: {
  player?: Player
  compact?: boolean
}) {
  const [revealed, setRevealed] = useState(false)

  if (!player) return null

  if (compact) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
        <Shield size={16} className="text-blue-500" />
        <div className="text-left">
          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
            Role
          </p>
          <p className="text-sm font-black uppercase">
            {revealed ? player.role : '••••••'}
          </p>
        </div>
        <button
          onClick={() => setRevealed(!revealed)}
          className="ml-2 p-1 hover:bg-white/10 rounded transition-colors"
          title="Click to reveal"
        >
          <Eye size={14} className="text-gray-400" />
        </button>
        {revealed && player.role !== 'mrwhite' && (
          <div className="ml-2 text-left border-l border-white/20 pl-2">
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
              Word
            </p>
            <p className="text-sm font-black text-blue-400">{player.word}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-2rem)] max-w-xs sm:max-w-none">
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-white/10 backdrop-blur-2xl border border-white/20 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col items-center min-w-0 sm:min-w-60"
      >
        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 w-full">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
            <Shield size={16} />
          </div>
          <div className="text-left flex-1 min-w-0">
            <p className="text-[8px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest">
              Your Role
            </p>
            <p className="text-lg sm:text-xl font-black uppercase tracking-tighter truncate">
              {revealed ? player.role : '••••••••'}
            </p>
          </div>
        </div>

        <div
          className={`w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all ${
            revealed
              ? 'bg-white/5 border-white/10'
              : 'bg-blue-600 border-blue-500 cursor-pointer'
          }`}
          onClick={() => setRevealed(!revealed)}
        >
          <div className="flex items-center justify-center gap-2">
            {revealed ? (
              <div className="text-center">
                <p className="text-[8px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-0.5 sm:mb-1">
                  Secret Word
                </p>
                <p className="text-xl sm:text-2xl font-black text-blue-400">
                  {player.role === 'mrwhite' ? '???' : player.word}
                </p>
                {player.role === 'mrwhite' && (
                  <p className="text-[8px] sm:text-[10px] text-gray-400 mt-1">
                    Guess the word!
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 font-black italic text-sm sm:text-base">
                <Eye size={18} />
                CLICK TO REVEAL
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
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

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000))
      setTimeLeft(remaining)
      if (remaining === 0) {
        clearInterval(interval)
        onExpire()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [endsAt, onExpire])

  return (
    <div
      className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border transition-colors ${
        timeLeft <= 10
          ? 'bg-red-600/20 border-red-500 animate-pulse'
          : 'bg-white/5 border-white/10'
      }`}
    >
      <TimerIcon
        size={18}
      
        className={timeLeft <= 10 ? 'text-red-500' : 'text-blue-500'}
      />
      <span
        className={`text-lg sm:text-2xl font-mono font-black ${timeLeft <= 10 ? 'text-red-500' : 'text-white'}`}
      >
        {timeLeft}s
      </span>
    </div>
  )
}
