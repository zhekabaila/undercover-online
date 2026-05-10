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
             <Loader2 className="w-6 lg:w-8 h-6 lg:h-8 animate-spin" />
           </motion.div>
        </div>
        <p className="text-[var(--text)] font-black uppercase tracking-[0.2em] animate-pulse italic text-base">Menyiapkan pesta...</p>
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
              <PartyPopper className="w-12 lg:w-16 h-12 lg:h-16 rotate-12" />
            </div>

            <div className="text-center mb-6 sm:mb-8 relative z-10">
              <motion.div 
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="inline-block bg-[var(--primary)] neo-border neo-shadow-sm p-3 mb-4 neo-pop"
              >
                <Music className="w-6 lg:w-8 h-6 lg:h-8" strokeWidth={3} />
              </motion.div>
              
              <h1 
                className="text-xl sm:text-2xl font-black mb-2 uppercase italic leading-none tracking-tighter"
                data-text="GABUNG PESTA"
              >
                GABUNG PESTA
              </h1>
                <div className="flex flex-col items-center gap-3 sm:gap-4 mt-6 sm:mt-8">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="neo-badge bg-black text-white px-4 py-2 text-xs sm:text-sm font-black tracking-[0.2em]">
                      KODE RUANGAN
                    </span>
                    <div className="w-1.5 h-1.5 bg-[var(--success)] rounded-full animate-pulse" />
                  </div>
                  <span className="text-2xl sm:text-3xl font-black bg-[var(--primary)] text-[var(--text)] px-6 py-2 neo-border neo-shadow italic tracking-tighter neo-text-glow">
                    {params.roomId}
                  </span>
                </div>
              </div>

              <form onSubmit={handleJoin} className="space-y-6 sm:space-y-8 text-left relative z-10">
                <div className="space-y-3 sm:space-y-4">
                  <label className="flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-[0.3em] text-[var(--text)]/40 px-1 italic">
                    <Smile className="w-4 lg:w-6 h-4 lg:h-6" strokeWidth={3} /> NAMA PESTAMU
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="MASUKKAN NAMA PANGGILAN..."
                      maxLength={15}
                      className="w-full neo-input text-lg py-4 px-5 italic uppercase placeholder:text-black/5 transition-all focus:bg-[var(--neutral)]"
                      required
                    />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                      <Sparkles className="text-[var(--primary)] animate-wiggle w-5 lg:w-7 h-5 lg:h-7" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <button
                    type="submit"
                    disabled={isJoining || !isConnected}
                    className="w-full neo-button bg-[var(--success)] text-[var(--text)] text-lg h-16 group relative overflow-hidden neo-pop"
                  >
                    <motion.div 
                      className="absolute inset-0 bg-white/30 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12" 
                    />
                    <div className="flex items-center justify-center gap-3 relative z-10">
                      {isJoining ? (
                        <Loader2 className="animate-spin w-6 h-6" strokeWidth={4} />
                      ) : (
                        <>
                          <Zap strokeWidth={4} className="group-hover:scale-125 transition-transform group-hover:rotate-12 w-5 lg:w-7 h-5 lg:h-7" />
                          <span className="tracking-tighter font-black italic uppercase">SIAP BERGABUNG</span>
                        </>
                      )}
                    </div>
                  </button>

                  <button 
                    type="button"
                    onClick={handleBackToMenu}
                    className="w-full py-4 text-[var(--text)] font-black uppercase tracking-[0.3em] text-xs sm:text-sm hover:text-[var(--danger)] transition-all flex items-center justify-center gap-3 sm:gap-4 group italic neo-pop"
                  >
                    <ArrowLeft className="w-5 lg:w-7 h-5 lg:h-7 group-hover:-translate-x-2 transition-transform" strokeWidth={3} />
                    KEMBALI KE BERANDA
                  </button>
                </div>
              </form>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-8 bg-[var(--danger)] text-white p-6 neo-border neo-shadow font-black text-sm sm:text-base uppercase tracking-widest text-center italic leading-relaxed"
                >
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <AlertCircle strokeWidth={4} className="w-5 lg:w-7 h-5 lg:h-7" />
                    <span>KESALAHAN PESTA!</span>
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
        <header className="sticky top-0 overflow-x-auto z-50 w-full shrink-0 h-24 neo-border-b bg-white flex items-center px-4 sm:px-8 neo-shadow-sm">
          <div className="w-full flex items-center justify-between max-w-[1920px] mx-auto gap-4 sm:gap-8">
            <div className="flex items-center gap-4 sm:gap-8">
              <motion.button 
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleBackToMenu} 
                className="neo-button group bg-white text-black p-3 lg:p-4 neo-shadow-sm hover:bg-[var(--danger)] hover:text-white transition-colors flex items-center justify-center neo-pop shrink-0 border-[3px]"
              >
                <ArrowLeft className="w-6 lg:w-8 h-6 lg:h-8 transition-colors" strokeWidth={4} />
              </motion.button>
              
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="text-xs sm:text-sm font-black uppercase tracking-[0.3em] hidden md:inline text-black/30 italic">RUANG LOBI</span>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex items-center bg-[var(--primary)] px-3 py-1.5 lg:px-4 lg:py-2 neo-border neo-shadow-sm italic tracking-tighter gap-2 lg:gap-3 group relative overflow-hidden neo-pop">
                      <motion.div className="absolute inset-0 bg-white/20 animate-shimmer pointer-events-none" />
                      <span className="text-sm sm:text-lg font-black relative z-10 neo-text-glow">{params.roomId}</span>
                      <button 
                        onClick={copyRoomCode} 
                        className="hover:scale-125 hover:rotate-12 transition-all text-black/40 hover:text-black relative z-10"
                        title="Salin Kode"
                      >
                        {copied ? <CheckCircle2 className="text-[var(--success)] w-4 lg:w-6 h-4 lg:h-6" strokeWidth={4} /> : <Copy className="w-4 lg:w-6 h-4 lg:h-6" strokeWidth={4} />}
                      </button>
                    </div>
                    {room.settings.isPublic && (
                      <span className="neo-badge bg-[var(--success)] text-xs sm:text-sm px-4 py-2 hidden sm:flex items-center gap-2 animate-pulse neo-pop">
                        <div className="w-1.5 h-1.5 bg-black rounded-full" />
                        PUBLIK
                      </span>
                    )}
                  </div>
                </div>
              </div>

            </div>


            <div className="flex items-center gap-4 sm:gap-8">
              <div className="hidden lg:flex items-center gap-4 px-4 py-2 bg-white neo-border neo-shadow-sm -rotate-1">
                <div className="text-center group">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 mb-0 group-hover:text-black transition-colors italic leading-none">KAPASITAS</p>
                  <p className="text-base sm:text-lg font-black leading-tight italic">{room.players.length}<span className="text-black/20 mx-1">/</span>{room.settings.maxPlayers}</p>
                </div>
                <div className="w-[2px] h-6 bg-black rotate-12" />
                <div className="text-center group">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 mb-0 group-hover:text-black transition-colors italic leading-none">WAKTU</p>
                  <p className="text-base sm:text-lg font-black leading-tight italic">{room.settings.turnDurationSeconds}d</p>
                </div>
              </div>

              <div className="flex items-center gap-3 px-4 py-2 bg-white neo-border neo-shadow-sm rotate-1">
                <div className="relative">
                  <div className={`w-2 h-2 neo-border ${isConnected ? 'bg-[var(--success)]' : 'bg-[var(--danger)]'}`} />
                  {isConnected && <div className="absolute inset-0 bg-[var(--success)] rounded-full animate-ping opacity-30" />}
                </div>
                <span className="text-xs sm:text-sm font-black uppercase tracking-[0.3em] italic">
                  {isConnected ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
            </div>
          </div>
        </header>


        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
          <div className="max-w-[1920px] mx-auto p-6 sm:p-10 lg:p-12">
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-start">
              
              {/* Player List Section */}
              <div className="flex-1 w-full space-y-10 sm:space-y-12">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 sm:gap-8 relative">
                  <div className="flex items-center gap-5 sm:gap-6">
                    <motion.div 
                      animate={{ rotate: [-5, 5, -5], scale: [1, 1.05, 1] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                      className="p-3 bg-[var(--secondary)] neo-border-sm neo-shadow-sm -rotate-6"
                    >
                      <Users className="w-6 lg:w-8 h-6 lg:h-8" strokeWidth={2} />
                    </motion.div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs sm:text-sm font-black uppercase tracking-[0.4em] text-black/30 italic">DAFTAR PEMAIN</span>
                      <h2 
                        className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter leading-none"
                      >
                        PESTA KITA
                      </h2>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="text-lg sm:text-2xl bg-white px-4 py-1.5 sm:px-6 sm:py-2 neo-border-sm neo-shadow-sm font-black italic rotate-3 border-l-[4px] border-l-[var(--primary)] neo-pop">
                      {room.players.length}
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="bg-[var(--warning)] neo-border-sm neo-shadow-sm px-4 py-1.5 sm:px-6 sm:py-2 -rotate-2 font-black text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] flex items-center gap-2 italic">
                        <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
                        {room.players.length < 3 ? 'MENUNGGU PEMAIN...' : 'SIAP BERMAIN?'}
                      </div>
                    </div>
                  </div>
                </div>



                <div className="grid grid-cols-1 gap-6 sm:gap-8">
                  <AnimatePresence mode="popLayout">
                    {room.players.map((player: Player, index: number) => (
                      <motion.div
                        key={player.id}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ delay: index * 0.05 }}
                        layout
                        className={`relative p-5 sm:p-6 neo-card group overflow-hidden transition-all flex flex-col gap-4 ${
                          player.id === playerId 
                            ? 'bg-white border-l-[8px] border-l-[var(--primary)]' 
                            : 'bg-white'
                        }`}
                      >
                        {/* Decorative Strip for own card */}
                        {player.id === playerId && (
                          <>
                            <div className="absolute top-0 right-0 w-2 h-full neo-strip-secondary opacity-15" />
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

                          <div className="flex flex-col gap-4 relative z-10 w-full">
                            <div className="flex items-center justify-between w-full">
                              <div className={`w-12 h-12 sm:w-16 sm:h-16 neo-avatar flex items-center justify-center font-black text-xl sm:text-2xl transition-all group-hover:scale-110 ${
                                player.id === playerId ? 'bg-[var(--primary)] rotate-6 group-hover:rotate-0' : 'bg-[var(--neutral)] -rotate-3 group-hover:rotate-6'
                              }`}>
                                {player.name[0].toUpperCase()}
                              </div>

                              <div className="flex items-center gap-2">
                                {player.isHost && (
                                  <motion.div animate={{ y: [0, -3, 0], rotate: [0, 15, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
                                    <Crown className="text-black fill-[var(--primary)] w-5 lg:w-7 h-5 lg:h-7" strokeWidth={3} />
                                  </motion.div>
                                )}
                                {player.id === playerId && (
                                  <div className="bg-black text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest italic neo-shadow-sm rotate-3">
                                    KAMU
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/20 italic leading-none mb-1">AGEN TERDATA</span>
                                <p className="font-black text-xl sm:text-2xl tracking-tighter truncate uppercase italic leading-none">
                                  {player.name}
                                </p>
                              </div>

                              <div className="flex items-center justify-between pt-3 border-t-2 border-black/5 border-dashed">
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 neo-border-sm transition-colors duration-500 ${player.isReady ? 'bg-[var(--success)]' : 'bg-white'}`} />
                                    <p className={`text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] transition-colors ${player.isReady ? 'text-[var(--success)]' : 'text-black/40'}`}>
                                      {player.isReady ? 'SIAP TEMPUR' : 'BERSIAP...'}
                                    </p>
                                </div>
                                <div className={`p-2 neo-border-sm neo-shadow-sm transition-all ${
                                  player.isReady ? 'bg-[var(--secondary)] rotate-12' : 'bg-[var(--neutral)] opacity-20'
                                }`}>
                                  {player.isReady ? <CheckCircle2 size={14} strokeWidth={4} /> : <Circle size={14} strokeWidth={2} />}
                                </div>
                              </div>
                            </div>
                          </div>
                        
                        {/* Decorative background info */}
                        <div className="absolute -bottom-6 -right-2 text-[80px] sm:text-[100px] font-black opacity-[0.03] select-none italic group-hover:opacity-[0.06] transition-opacity leading-none">
                          0{index + 1}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

              </div>

              {/* Sidebar Controls */}
              <div className="w-full lg:w-96 space-y-12 sm:space-y-16">
                <div className="bg-white p-6 sm:p-8 neo-card relative overflow-hidden group">
                  {/* Visual Accent */}
                  <div className="absolute top-0 left-0 w-full h-1.5 neo-strip" />
                  
                  <div className="absolute -top-12 -right-12 p-12 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                    <Zap className="w-24 lg:w-32 h-24 lg:h-32 rotate-12" />
                  </div>

                  <div className="flex flex-col gap-1 mb-6 relative z-10">
                    <span className="text-xs sm:text-sm font-black uppercase tracking-[0.4em] text-black/30 italic">PANEL KONTROL</span>
                    <h3 className="text-lg sm:text-xl font-black italic uppercase flex items-center gap-3 leading-none">
                      <div className="p-2 bg-[var(--primary)] neo-border-sm -rotate-12 neo-shadow-sm group-hover:rotate-0 transition-all duration-700">
                        <Gamepad2 className="w-6 lg:w-8 h-6 lg:h-8" strokeWidth={3} />
                      </div>
                      AKSI CEPAT
                    </h3>
                  </div>

                  <div className="space-y-6 relative z-10">
                    <button
                      onClick={() => setReady(!currentPlayer?.isReady)}
                      className={`w-full neo-button text-base sm:text-lg h-16 transition-all active:translate-y-1 active:shadow-none relative overflow-hidden group/btn neo-pop ${
                        currentPlayer?.isReady 
                          ? 'bg-white text-black border-dashed opacity-80 hover:opacity-100' 
                          : 'bg-[var(--secondary)] text-black hover:-rotate-1'
                      }`}
                    >
                      <motion.div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                      <span className="font-black italic uppercase tracking-tighter relative z-10">
                        {currentPlayer?.isReady ? 'BATALKAN SIAP' : "SAYA SIAP!"}
                      </span>
                    </button>


                    {isHost && (
                      <div className="space-y-6 pt-6 border-t-[3px] border-black/5 border-dashed">
                        <button
                          onClick={startGame}
                          disabled={!allReady}
                          className="w-full neo-button bg-[var(--success)] text-black text-base sm:text-lg h-16 group relative overflow-hidden disabled:bg-black/10 disabled:grayscale disabled:opacity-40 neo-pop"
                        >
                          <motion.div 
                            className="absolute inset-0 bg-white/30 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12" 
                          />
                          <div className="flex items-center justify-center gap-3 relative z-10">
                            <Play fill="black" className="group-hover:scale-125 transition-transform group-hover:rotate-12 w-5 lg:w-7 h-5 lg:h-7" />
                            <span className="font-black italic tracking-tighter">MULAI PESTA</span>
                          </div>
                        </button>

                        
                        {!allReady && (
                          <div className="flex items-center justify-center gap-2 py-3 bg-[var(--danger)]/5 neo-border-sm border-dashed">
                            <AlertCircle className="text-[var(--danger)] w-5 lg:w-6 h-5 lg:h-6" />
                            <p className="text-xs sm:text-sm font-black uppercase text-[var(--danger)] italic animate-pulse tracking-[0.2em]">
                               MENUNGGU SEMUA SIAP
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {!allReady && (
                      <div className="p-5 sm:p-6 bg-[var(--neutral)] neo-border-sm neo-shadow-sm relative overflow-hidden group border-l-[6px] border-l-[var(--warning)] mt-4">
                        <div className="absolute top-0 left-0 w-full h-1 bg-[var(--warning)] animate-shimmer" />
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] italic text-black/60">
                              {room.players.length < 3 
                                ? 'BUTUH LEBIH BANYAK AGEN' 
                                : 'PEMAIN SEDANG BERSIAP...'}
                            </p>
                            <Loader2 className="animate-spin text-[var(--warning)] w-5 lg:w-6 h-5 lg:h-6" strokeWidth={4} />
                          </div>
                          <div className="neo-progress-bar h-3 sm:h-4">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(room.players.length / room.settings.maxPlayers) * 100}%` }}
                              className="neo-progress-bar-fill bg-[var(--warning)]"
                            />
                          </div>
                          <p className="text-[10px] sm:text-xs font-black uppercase text-center text-black/30 tracking-[0.2em]">
                            {room.players.length} / {room.settings.maxPlayers} SLOT TERISI
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
                    className="bg-white p-6 sm:p-8 neo-card relative overflow-hidden group"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 neo-strip-secondary opacity-30" />
                    
                    <div className="absolute -bottom-12 -left-12 p-12 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                      <Sliders className="w-24 lg:w-32 h-24 lg:h-32 -rotate-12" />
                    </div>
                    
                    <div className="flex flex-col gap-1 mb-6 relative z-10">
                      <span className="text-xs sm:text-sm font-black uppercase tracking-[0.4em] text-black/30 italic">KONFIGURASI</span>
                      <h3 className="text-lg sm:text-xl font-black italic uppercase flex items-center gap-3 leading-none">
                        <div className="p-2 bg-[var(--warning)] neo-border-sm rotate-6 neo-shadow-sm group-hover:rotate-0 transition-all duration-700">
                          <Settings2 className="w-6 lg:w-8 h-6 lg:h-8" strokeWidth={3} />
                        </div>
                        PENGATURAN
                      </h3>
                    </div>
                    
                      <div className="space-y-10 relative z-10">
                        <div className="grid grid-cols-1 gap-6">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                              <div className="flex items-center gap-2">
                                <Users className="text-black/40 w-4 lg:w-6 h-4 lg:h-6" />
                                <label className="text-xs sm:text-sm font-black uppercase tracking-[0.3em] block text-black/40 italic">KAPASITAS</label>
                              </div>
                            </div>
                            <div className="relative group">
                              <select 
                                value={room.settings.maxPlayers}
                                onChange={(e) => updateSettings({ maxPlayers: parseInt(e.target.value) })}
                                className="w-full neo-input cursor-pointer text-base lg:text-lg italic uppercase hover:bg-[var(--neutral)] transition-all appearance-none pr-12 py-4"
                              >
                                {[3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map(n => (
                                  <option key={n} value={n}>{n} AGEN MAX</option>
                                ))}
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none group-hover:rotate-180 transition-transform duration-500">
                                <ChevronRight className="w-5 lg:w-7 h-5 lg:h-7" strokeWidth={4} />
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                              <div className="flex items-center gap-2">
                                <TimerIcon className="text-black/40 w-4 lg:w-6 h-4 lg:h-6" />
                                <label className="text-xs sm:text-sm font-black uppercase tracking-[0.3em] block text-black/40 italic">DURASI TURN</label>
                              </div>
                            </div>
                            <div className="relative group">
                              <select 
                                value={room.settings.turnDurationSeconds}
                                onChange={(e) => updateSettings({ turnDurationSeconds: parseInt(e.target.value) })}
                                className="w-full neo-input cursor-pointer text-base lg:text-lg italic uppercase hover:bg-[var(--neutral)] transition-all appearance-none pr-12 py-4"
                              >
                                {[15, 30, 45, 60, 90, 120].map(s => (
                                  <option key={s} value={s}>{s} DETIK</option>
                                ))}
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none group-hover:scale-125 transition-transform duration-300">
                                <Sparkles className="text-[var(--primary)] w-5 lg:w-7 h-5 lg:h-7" strokeWidth={2} />
                              </div>
                            </div>
                          </div>

                          <div className="pt-4">
                            <label className="flex items-center justify-between cursor-pointer p-5 bg-[var(--neutral)] neo-border group transition-all hover:bg-white active:translate-y-1 hover:neo-shadow-sm border-l-[10px] border-l-black">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-base sm:text-lg font-black uppercase tracking-[0.1em] group-hover:italic transition-all leading-tight">RUANGAN PUBLIK</span>
                                <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest italic">DAPAT DITEMUKAN GLOBAL</span>
                              </div>
                              <div className="relative w-8 h-8 shrink-0">
                                <input 
                                  type="checkbox" 
                                  checked={room.settings.isPublic} 
                                  onChange={(e) => updateSettings({ isPublic: e.target.checked })}
                                  className="peer absolute inset-0 opacity-0 cursor-pointer z-10"
                                />
                                <div className="w-8 h-8 neo-border bg-white peer-checked:bg-[var(--success)] flex items-center justify-center transition-all neo-shadow-sm peer-active:shadow-none">
                                  <motion.div 
                                    animate={{ 
                                      scale: room.settings.isPublic ? 1 : 0, 
                                      rotate: room.settings.isPublic ? 0 : -180,
                                    }}
                                    className="w-5 h-5 bg-black rounded-[2px]"
                                  />
                                </div>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>
                  </motion.div>
                )}

              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Animated Bottom Bar */}
        <div className="h-6 bg-black w-full shrink-0 flex overflow-hidden neo-border-t">
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
