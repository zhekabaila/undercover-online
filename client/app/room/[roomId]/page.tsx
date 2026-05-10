'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Crown, Play, CheckCircle2, Circle, ArrowLeft, Copy, Loader2, Zap, Sparkles, Smile, PartyPopper, Music, Gamepad2, Settings2, Sliders, AlertCircle, ChevronRight, TimerIcon } from 'lucide-react';
import { useGameState } from '../../../hooks/useGameState';
import { Player } from '../../../types/game';
import { FloatingShape } from '../../../components/ui/FloatingShape';


export default function Lobby() {
  const params = useParams();
  const router = useRouter();
  const { 
    room, 
    playerId, 
    setReady, 
    startGame, 
    leaveRoom, 
    joinRoom, 
    updateSettings,
    error, 
    isConnected, 
    isInitialLoading 
  } = useGameState();
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  // Redirect to game if it has started
  useEffect(() => {
    if (room?.game && room.game.phase !== 'lobby') {
      router.push(`/room/${params.roomId}/game`);
    }
  }, [room?.game?.phase, params.roomId, router]);

  const copyRoomCode = useCallback(() => {
    if (typeof params.roomId !== 'string') return;
    navigator.clipboard.writeText(params.roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [params.roomId]);

  const handleBackToMenu = () => {
    leaveRoom();
    router.push('/');
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsJoining(true);
    joinRoom(params.roomId as string, name);
  };

  // Show loading screen while checking for session/reconnecting
  if (isInitialLoading) {
    return (
      <main className="min-h-screen bg-[var(--bg-cheerful)] text-[var(--text)] flex flex-col items-center justify-center p-4 overflow-hidden">
        <div className="relative">
           <motion.div 
             animate={{ rotate: 360 }}
             transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
             className="w-12 h-12 bg-[var(--primary)] neo-border neo-shadow flex items-center justify-center mb-4"
           >
             <Loader2 size={24} className="animate-spin" />
           </motion.div>
        </div>
        <p className="text-[var(--text)] font-black uppercase tracking-[0.2em] animate-pulse italic text-base">Setting up the party...</p>
      </main>
    );
  }

  // If room is null, we either need to join or we're waiting for reconnect
  if (!room) {
    return (
      <main className="min-h-screen bg-[var(--bg-cheerful)] text-[var(--text)] flex items-center justify-center p-4 relative overflow-hidden selection:bg-[var(--primary)]">
      <div className="fixed inset-0 z-0 opacity-[0.05] pointer-events-none bg-grid-pattern" />
        
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <FloatingShape color="var(--primary)" size={200} top="-5%" left="-5%" delay={0} rotate={12} shape="circle" />
          <FloatingShape color="var(--secondary)" size={150} top="15%" right="-2%" delay={1} rotate={-15} shape="square" />
          <FloatingShape color="var(--success)" size={180} bottom="-2%" left="2%" delay={2} rotate={25} shape="triangle" />
          <FloatingShape color="var(--warning)" size={120} bottom="10%" right="5%" delay={3} rotate={-5} shape="circle" />
        </div>

        <div className="max-w-md sm:max-w-xl w-full z-10 relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            className="bg-white p-6 sm:p-8 neo-card relative overflow-hidden"
          >
            {/* Decorative Strip */}
            <div className="absolute top-0 left-0 w-full h-2 neo-strip" />
            
            <div className="absolute top-8 right-8 opacity-5">
              <PartyPopper size={60} className="rotate-12" />
            </div>
100: 
            <div className="text-center mb-6 sm:mb-8 relative z-10">
              <motion.div 
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="inline-block bg-[var(--primary)] neo-border neo-shadow-sm p-3 mb-4 neo-pop"
              >
                <Music size={24} strokeWidth={3} />
              </motion.div>
              
              <h1 
                className="text-xl sm:text-2xl font-black mb-2 uppercase italic leading-none tracking-tighter neo-text-layered"
                data-text="JOIN PARTY"
              >
                JOIN PARTY
              </h1>
116: 
              <div className="flex flex-col items-center gap-2 mt-4 sm:mt-6">
                <div className="flex items-center gap-2">
                  <span className="neo-badge bg-black text-white px-3 py-1.5 text-sm font-black tracking-[0.2em]">
                    ROOM CODE
                  </span>
                  <div className="w-1 h-1 bg-[var(--success)] rounded-full animate-pulse" />
                </div>
                <span className="text-lg sm:text-xl font-black bg-[var(--primary)] text-[var(--text)] px-3 py-1 neo-border neo-shadow italic tracking-tighter neo-text-glow">
                  {params.roomId}
                </span>
              </div>
            </div>

            <form onSubmit={handleJoin} className="space-y-4 sm:space-y-6 text-left relative z-10">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.3em] text-[var(--text)]/40 px-1 italic">
                  <Smile size={18} strokeWidth={3} /> YOUR PARTY NAME
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ENTER NICKNAME..."
                    maxLength={15}
                    className="w-full neo-input text-base py-3 px-4 italic uppercase placeholder:text-black/5 transition-all focus:bg-[var(--neutral)]"
                    required
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                    <Sparkles className="text-[var(--primary)] animate-wiggle" size={20} />
                  </div>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <button
                  type="submit"
                  disabled={isJoining || !isConnected}
                  className="w-full neo-button bg-[var(--success)] text-[var(--text)] text-base h-14 group relative overflow-hidden neo-pop"
                >
                  <motion.div 
                    className="absolute inset-0 bg-white/30 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12" 
                  />
                  <div className="flex items-center justify-center gap-2 relative z-10">
                    {isJoining ? (
                      <Loader2 className="animate-spin" size={18} strokeWidth={4} />
                    ) : (
                      <>
                        <Zap size={18} strokeWidth={4} className="group-hover:scale-125 transition-transform group-hover:rotate-12" />
                        <span className="tracking-tighter font-black italic uppercase">READY TO CRASH</span>
                      </>
                    )}
                  </div>
                </button>

                <button 
                  type="button"
                  onClick={handleBackToMenu}
                  className="w-full py-4 text-[var(--text)] font-black uppercase tracking-[0.3em] text-sm hover:text-[var(--danger)] transition-all flex items-center justify-center gap-3 group italic neo-pop"
                >
                  <ArrowLeft size={18} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" />
                  BACK TO BASE
                </button>
              </div>
            </form>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 bg-[var(--danger)] text-white p-6 neo-border neo-shadow font-black text-sm uppercase tracking-widest text-center italic leading-relaxed"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <AlertCircle size={18} strokeWidth={4} />
                  <span>PARTY ERROR!</span>
                </div>
                {error.message}
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>

    );
  }

  const currentPlayer = room.players.find((p: Player) => p.id === playerId);
  const isHost = currentPlayer?.isHost;
  const allReady = room.players.length >= 3 && room.players.every((p: Player) => p.isReady);

  return (
    <main className="h-screen flex flex-col bg-[var(--bg-cheerful)] text-black relative overflow-hidden selection:bg-[var(--primary)]">
      {/* Background patterns and shapes */}
      <div className="fixed inset-0 z-0 opacity-[0.05] pointer-events-none bg-grid-pattern" />
      
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <FloatingShape color="var(--primary)" size={180} top="-20px" left="5%" delay={0} rotate={12} shape="circle" />
        <FloatingShape color="var(--secondary)" size={140} bottom="5%" right="-10px" delay={1.5} rotate={-15} shape="square" />
        <FloatingShape color="var(--success)" size={120} top="35%" left="-15px" delay={3} rotate={25} shape="triangle" />
        <FloatingShape color="var(--warning)" size={100} top="10%" right="10%" delay={4.5} rotate={-10} shape="circle" />
      </div>


      {/* Header */}
      <header className="sticky top-0 overflow-x-auto z-50 w-full shrink-0 h-20 neo-border-b bg-white flex items-center px-4 sm:px-8 neo-shadow-sm">
        <div className="w-full flex items-center justify-between max-w-[1920px] mx-auto gap-4">
          <div className="flex items-center gap-4 sm:gap-6">
            <motion.button 
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleBackToMenu} 
              className="neo-button bg-white text-black p-3 neo-shadow-sm hover:bg-[var(--danger)] hover:text-white transition-colors flex items-center justify-center neo-pop"
            >
              <ArrowLeft size={24} strokeWidth={4} />
            </motion.button>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <span className="text-sm font-black uppercase tracking-[0.3em] hidden lg:inline text-black/30 italic">LOBBY</span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-[var(--primary)] px-3 py-1 neo-border neo-shadow-sm italic tracking-tighter gap-2 group relative overflow-hidden neo-pop">
                    <motion.div className="absolute inset-0 bg-white/20 animate-shimmer pointer-events-none" />
                    <span className="text-base font-black relative z-10 neo-text-glow">{params.roomId}</span>
                    <button 
                      onClick={copyRoomCode} 
                      className="hover:scale-125 hover:rotate-12 transition-all text-black/40 hover:text-black relative z-10"
                      title="Copy Access Code"
                    >
                      {copied ? <CheckCircle2 size={18} className="text-[var(--success)]" strokeWidth={4} /> : <Copy size={18} strokeWidth={4} />}
                    </button>
                  </div>
                  {room.settings.isPublic && (
                    <span className="neo-badge bg-[var(--success)] text-sm px-3 py-1.5 hidden sm:flex items-center gap-1 animate-pulse neo-pop">
                      <div className="w-1 h-1 bg-black rounded-full" />
                      LIVE
                    </span>
                  )}
                </div>
              </div>
            </div>

          </div>


          <div className="flex items-center gap-3 sm:gap-6">
            <div className="hidden xl:flex items-center gap-3 px-3 py-1.5 bg-white neo-border neo-shadow-sm -rotate-1">
              <div className="text-center group">
                <p className="text-sm font-black uppercase tracking-[0.3em] text-black/30 mb-0 group-hover:text-black transition-colors italic leading-none">CAPACITY</p>
                <p className="text-base font-black leading-tight italic">{room.players.length}<span className="text-black/20 mx-0.5">/</span>{room.settings.maxPlayers}</p>
              </div>
              <div className="w-[1.5px] h-4 bg-black rotate-12" />
              <div className="text-center group">
                <p className="text-sm font-black uppercase tracking-[0.3em] text-black/30 mb-0 group-hover:text-black transition-colors italic leading-none">SPEED</p>
                <p className="text-base font-black leading-tight italic">{room.settings.turnDurationSeconds}s</p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-white neo-border neo-shadow-sm rotate-1">
              <div className="relative">
                <div className={`w-1.5 h-1.5 neo-border ${isConnected ? 'bg-[var(--success)]' : 'bg-[var(--danger)]'}`} />
                {isConnected && <div className="absolute inset-0 bg-[var(--success)] rounded-full animate-ping opacity-30" />}
              </div>
              <span className="text-sm font-black uppercase tracking-[0.3em] italic">
                {isConnected ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
          </div>
        </div>
      </header>


      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
        <div className="max-w-6xl mx-auto p-4 sm:p-10">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
            
            {/* Player List Section */}
            <div className="flex-1 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative">
                <div className="flex items-center gap-2">
                  <motion.div 
                    animate={{ rotate: [-5, 5, -5], scale: [1, 1.05, 1] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="p-2 bg-[var(--secondary)] neo-border-sm neo-shadow-sm -rotate-6"
                  >
                    <Users size={20} strokeWidth={4} />
                  </motion.div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black uppercase tracking-[0.4em] text-black/30 italic mb-0.5">GUEST LIST</span>
                    <h2 
                      className="text-base sm:text-xl font-black italic uppercase tracking-tighter leading-none"
                      data-text="THE PARTY"
                    >
                      THE PARTY
                    </h2>
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5">
                   <div className="text-base bg-white px-3 py-1 neo-border-sm neo-shadow-sm font-black italic rotate-3 border-l-[2px] border-l-[var(--primary)] neo-pop">
                    {room.players.length}
                  </div>

                  <div className="hidden xl:flex flex-col gap-0.5">
                    <div className="bg-[var(--warning)] neo-border-sm neo-shadow-sm px-3 py-1 -rotate-2 font-black text-sm uppercase tracking-[0.3em] flex items-center gap-2 italic">
                      <div className="w-1 h-1 bg-black rounded-full animate-pulse" />
                      GATHERING...
                    </div>
                  </div>
                </div>
              </div>



              <div className="grid grid-cols-1 gap-4">
                <AnimatePresence mode="popLayout">
                  {room.players.map((player: Player, index: number) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ delay: index * 0.05 }}
                      layout
                      className={`relative p-3 sm:p-4 neo-card group overflow-hidden transition-all ${
                        player.id === playerId 
                          ? 'bg-white border-l-[4px] border-l-[var(--primary)] ring-[2px] ring-[var(--primary)]/10' 
                          : 'bg-white hover:translate-x-1'
                      }`}
                    >
                      {/* Decorative Strip for own card */}
                      {player.id === playerId && (
                        <>
                          <div className="absolute top-0 right-0 w-1.5 h-full neo-strip-secondary opacity-15" />
                          <div className="neo-accent-corner neo-accent-corner-tl border-[var(--primary)]" />
                          <div className="neo-accent-corner neo-accent-corner-tr border-[var(--primary)]" />
                          <div className="neo-accent-corner neo-accent-corner-bl border-[var(--primary)]" />
                          <div className="neo-accent-corner neo-accent-corner-br border-[var(--primary)]" />
                        </>
                      )}

                      {player.isReady && player.id !== playerId && (
                        <>
                          <div className="neo-accent-corner neo-accent-corner-tl border-[var(--success)] opacity-40" />
                          <div className="neo-accent-corner neo-accent-corner-br border-[var(--success)] opacity-40" />
                        </>
                      )}

                      <div className="flex items-center justify-between gap-1.5 relative z-10">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 neo-avatar flex items-center justify-center font-black text-base transition-all group-hover:scale-110 ${
                            player.id === playerId ? 'bg-[var(--primary)] rotate-6 group-hover:rotate-0' : 'bg-[var(--neutral)] -rotate-3 group-hover:rotate-6'
                          }`}>
                            {player.name[0].toUpperCase()}
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-0.5">
                              <p className="font-black text-sm sm:text-base tracking-tighter truncate max-w-[120px] uppercase italic leading-none">
                                {player.name}
                              </p>
                              {player.isHost && (
                                <motion.div animate={{ y: [0, -2, 0], rotate: [0, 15, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
                                  <Crown size={14} className="text-black fill-[var(--primary)]" strokeWidth={3} />
                                </motion.div>
                              )}
                            </div>
                            <div className="flex items-center gap-0.5">
                                <div className={`w-2 h-2 neo-border-sm transition-colors duration-500 ${player.isReady ? 'bg-[var(--success)]' : 'bg-white'}`} />
                                <p className={`text-sm font-black uppercase tracking-[0.2em] transition-colors ${player.isReady ? 'text-[var(--success)]' : 'text-black/40'}`}>
                                  {player.isReady ? 'READY' : 'WAITING'}
                                </p>
                            </div>
                          </div>
                        </div>
                        
                        <motion.div 
                          whileHover={{ scale: 1.1, rotate: player.isReady ? 12 : -12 }}
                          className={`p-2 neo-border-sm neo-shadow-sm transition-all ${
                            player.isReady 
                              ? 'bg-[var(--secondary)] rotate-12' 
                              : 'bg-[var(--neutral)] -rotate-6 opacity-40 group-hover:opacity-100'
                          }`}
                        >
                          {player.isReady ? <CheckCircle2 size={16} strokeWidth={4} /> : <Circle size={16} strokeWidth={2} className="text-black/20" />}
                        </motion.div>
                      </div>
                      
                      {/* Decorative background info */}
                      <div className="absolute -bottom-3 -right-1 text-[50px] font-black opacity-[0.03] select-none italic group-hover:opacity-[0.06] transition-opacity leading-none">
                        0{index + 1}
                      </div>
                      {player.id === playerId && (
                        <div className="absolute -top-3 -left-3 bg-black text-white px-3 py-1.5 text-sm font-black tracking-[0.4em] rotate-[-45deg] z-20">
                          YOU
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

            </div>

            {/* Sidebar Controls */}
            <div className="w-full lg:w-80 space-y-8">
              <div className="bg-white p-4 sm:p-6 neo-card lg:sticky lg:top-4 relative overflow-hidden group">
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-full h-1 neo-strip" />
                
                <div className="absolute -top-10 -right-10 p-10 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                  <Zap size={100} className="rotate-12" />
                </div>

                <div className="flex flex-col gap-0.5 mb-2 relative z-10">
                  <span className="text-sm font-black uppercase tracking-[0.4em] text-black/30 italic">CONTROLS</span>
                  <h3 className="text-sm font-black italic uppercase flex items-center gap-2 leading-none">
                    <div className="p-1.5 bg-[var(--primary)] neo-border-sm -rotate-12 neo-shadow-sm group-hover:rotate-0 transition-all duration-700">
                      <Gamepad2 size={18} strokeWidth={3} />
                    </div>
                    ACTIONS
                  </h3>
                </div>

                <div className="space-y-4 relative z-10">
                  <button
                    onClick={() => setReady(!currentPlayer?.isReady)}
                    className={`w-full neo-button text-sm h-12 transition-all active:translate-y-0.5 active:shadow-none relative overflow-hidden group/btn neo-pop ${
                      currentPlayer?.isReady 
                        ? 'bg-white text-black border-dashed opacity-80 hover:opacity-100' 
                        : 'bg-[var(--secondary)] text-black hover:-rotate-1'
                    }`}
                  >
                    <motion.div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                    <span className="font-black italic uppercase tracking-tighter relative z-10">
                      {currentPlayer?.isReady ? 'WAIT...' : "READY UP"}
                    </span>
                  </button>


                  {isHost && (
                    <div className="space-y-4 pt-4">
                      <button
                        onClick={startGame}
                        disabled={!allReady}
                        className="w-full neo-button bg-[var(--success)] text-black text-sm h-12 group relative overflow-hidden disabled:bg-black/10 disabled:grayscale disabled:opacity-40 neo-pop"
                      >
                        <motion.div 
                          className="absolute inset-0 bg-white/30 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12" 
                        />
                        <div className="flex items-center justify-center gap-1 relative z-10">
                          <Play size={16} fill="black" className="group-hover:scale-125 transition-transform group-hover:rotate-12" />
                          <span className="font-black italic tracking-tighter">START PARTY</span>
                        </div>
                      </button>

                      
                      {!allReady && (
                        <div className="flex items-center justify-center gap-1.5 py-1.5 bg-[var(--danger)]/5 neo-border-sm border-dashed">
                          <AlertCircle size={14} className="text-[var(--danger)]" />
                          <p className="text-sm font-black uppercase text-[var(--danger)] italic animate-pulse tracking-[0.2em]">
                             WAITING FOR GUESTS
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {!allReady && (
                    <div className="p-4 bg-[var(--neutral)] neo-border-sm neo-shadow-sm relative overflow-hidden group border-l-[4px] border-l-[var(--warning)] mt-2">
                      <div className="absolute top-0 left-0 w-full h-0.5 bg-[var(--warning)] animate-shimmer" />
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-black uppercase tracking-[0.2em] italic text-black/60">
                            {room.players.length < 3 
                              ? 'NEED MORE AGENTS' 
                              : 'GUESTS ASSEMBLING...'}
                          </p>
                          <Loader2 className="animate-spin text-[var(--warning)]" size={14} strokeWidth={4} />
                        </div>
                        <div className="neo-progress-bar h-3">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(room.players.length / room.settings.maxPlayers) * 100}%` }}
                            className="neo-progress-bar-fill bg-[var(--warning)]"
                          />
                        </div>
                        <p className="text-sm font-black uppercase text-center text-black/30 tracking-[0.1em]">
                          {room.players.length} / {room.settings.maxPlayers} SLOTS FILLED
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>


              {isHost && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white p-4 sm:p-6 neo-card relative overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 w-full h-0.5 neo-strip-secondary opacity-30" />
                  
                  <div className="absolute -bottom-10 -left-10 p-10 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                    <Sliders size={100} className="-rotate-12" />
                  </div>
                  
                  <div className="flex flex-col gap-0.5 mb-2 relative z-10">
                    <span className="text-sm font-black uppercase tracking-[0.4em] text-black/30 italic">CONFIG</span>
                    <h3 className="text-sm font-black italic uppercase flex items-center gap-2 leading-none">
                      <div className="p-1.5 bg-[var(--warning)] neo-border-sm rotate-6 neo-shadow-sm group-hover:rotate-0 transition-all duration-700">
                        <Settings2 size={18} strokeWidth={3} />
                      </div>
                      VIBE CHECK
                    </h3>
                  </div>
                  
                  <div className="space-y-6 relative z-10">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <Users size={14} className="text-black/40" />
                          <label className="text-sm font-black uppercase tracking-[0.3em] block text-black/40 italic">CAPACITY</label>
                        </div>
                        <span className="text-sm font-black bg-black text-white px-2 py-1 neo-shadow-sm italic">MAX</span>
                      </div>
                      <div className="relative group">
                        <select 
                          value={room.settings.maxPlayers}
                          onChange={(e) => updateSettings({ maxPlayers: parseInt(e.target.value) })}
                          className="w-full neo-input cursor-pointer text-sm italic uppercase hover:bg-[var(--neutral)] transition-all appearance-none pr-8 py-2.5"
                        >
                          {[3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map(n => (
                            <option key={n} value={n}>{n} GUESTS</option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none group-hover:rotate-180 transition-transform duration-500">
                          <ChevronRight size={18} strokeWidth={4} />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <TimerIcon size={14} className="text-black/40" />
                          <label className="text-sm font-black uppercase tracking-[0.3em] block text-black/40 italic">SPEED</label>
                        </div>
                        <span className="text-sm font-black bg-black text-white px-2 py-1 neo-shadow-sm italic">SEC</span>
                      </div>
                      <div className="relative group">
                        <select 
                          value={room.settings.turnDurationSeconds}
                          onChange={(e) => updateSettings({ turnDurationSeconds: parseInt(e.target.value) })}
                          className="w-full neo-input cursor-pointer text-sm italic uppercase hover:bg-[var(--neutral)] transition-all appearance-none pr-6 py-2.5"
                        >
                          {[15, 30, 45, 60, 90, 120].map(s => (
                            <option key={s} value={s}>{s} SECONDS</option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none group-hover:scale-125 transition-transform duration-300">
                          <Sparkles size={18} className="text-[var(--primary)]" strokeWidth={2} />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="flex items-center justify-between cursor-pointer p-2 bg-[var(--neutral)] neo-border-sm group transition-all hover:bg-white active:translate-y-0.5 hover:neo-shadow-sm border-l-[3px] border-l-black">
                        <div className="flex flex-col gap-0">
                          <span className="text-sm font-black uppercase tracking-[0.1em] group-hover:italic transition-all leading-tight">PUBLIC</span>
                          <span className="text-sm font-bold opacity-40 uppercase tracking-widest italic">DISCOVERABLE</span>
                        </div>
                        <div className="relative w-4 h-4 shrink-0">
                          <input 
                            type="checkbox" 
                            checked={room.settings.isPublic} 
                            onChange={(e) => updateSettings({ isPublic: e.target.checked })}
                            className="peer absolute inset-0 opacity-0 cursor-pointer z-10"
                          />
                          <div className="w-6 h-6 neo-border-sm bg-white peer-checked:bg-[var(--success)] flex items-center justify-center transition-all neo-shadow-sm peer-active:shadow-none">
                            <motion.div 
                              animate={{ 
                                scale: room.settings.isPublic ? 1 : 0, 
                                rotate: room.settings.isPublic ? 0 : -180,
                              }}
                              className="w-4 h-4 bg-black rounded-[1px]"
                            />
                          </div>
                        </div>
                      </label>
                    </div>

                  </div>
                </motion.div>
              )}

            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative Animated Bottom Bar */}
      <div className="h-4 bg-black w-full shrink-0 flex overflow-hidden neo-border-t">
        <motion.div 
          animate={{ x: [-100, 0] }} 
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }} 
          className="flex w-[200%] h-full"
        >
          {[...Array(40)].map((_, i) => (
            <div key={i} className="flex h-full w-full">
              <div className="h-full bg-[var(--primary)] w-1/4" />
              <div className="h-full bg-[var(--secondary)] w-1/4" />
              <div className="h-full bg-[var(--success)] w-1/4" />
              <div className="h-full bg-[var(--warning)] w-1/4" />
            </div>
          ))}
        </motion.div>
      </div>
    </main>

  );
}
