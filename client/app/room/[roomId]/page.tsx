'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Crown, Play, CheckCircle2, Circle, ArrowLeft, Copy, Loader2, Zap, Sparkles, Smile, PartyPopper, Music, Gamepad2, Settings2, Sliders, AlertCircle, ChevronRight, TimerIcon, Search } from 'lucide-react';
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
      <main className="min-h-screen bg-[var(--bg-cheerful)] text-[var(--text)] flex flex-col items-center justify-center p-6 overflow-hidden">
        <div className="relative">
           <motion.div 
             animate={{ rotate: 360 }}
             transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
             className="w-10 h-10 bg-[var(--primary)] neo-border neo-shadow flex items-center justify-center mb-6"
           >
             <Loader2 className="w-5 h-5 animate-spin" />
           </motion.div>
        </div>
        <p className="text-[var(--text)] font-black uppercase tracking-[0.2em] animate-pulse italic text-xs">Menyiapkan pesta...</p>
      </main>
    );
  }

  // If room is null, we either need to join or we're waiting for reconnect
  if (!room) {
    return (
      <main className="min-h-screen bg-[var(--bg-cheerful)] text-[var(--text)] flex items-center justify-center p-4 relative overflow-hidden selection:bg-[var(--primary)]">
      <div className="fixed inset-0 z-0 opacity-[0.05] pointer-events-none bg-grid-pattern" />
        
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <FloatingShape color="var(--primary)" size={80} top="-5%" left="-5%" delay={0} rotate={12} shape="circle" />
          <FloatingShape color="var(--secondary)" size={60} top="15%" right="-2%" delay={1} rotate={-15} shape="square" />
          <FloatingShape color="var(--success)" size={70} bottom="-2%" left="2%" delay={2} rotate={25} shape="triangle" />
          <FloatingShape color="var(--warning)" size={50} bottom="10%" right="5%" delay={3} rotate={-5} shape="circle" />
        </div>

        <div className="max-w-md w-full z-10 relative px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            className="bg-white p-6 sm:p-8 neo-border neo-shadow relative overflow-hidden"
          >
            {/* Decorative Strip */}
            <div className="absolute top-0 left-0 w-full h-1 neo-strip" />
            
            <div className="absolute top-6 right-6 opacity-5">
              <PartyPopper className="w-12 h-12 rotate-12" />
            </div>

            <div className="text-center mb-6 sm:mb-8 relative z-10">
              <motion.div 
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="inline-block bg-[var(--primary)] neo-border neo-shadow p-2 mb-4 neo-pop"
              >
                <Music className="w-5 h-5" strokeWidth={3} />
              </motion.div>
              
              <h1 
                className="text-lg sm:text-xl font-black mb-2 uppercase italic leading-none tracking-tighter"
                data-text="GABUNG PESTA"
              >
                GABUNG PESTA
              </h1>
                <div className="flex flex-col items-center gap-2 mt-4">
                  <div className="flex items-center gap-2">
                    <span className="neo-badge neo-border py-0.5 px-3 bg-black text-white text-[9px] sm:text-[10px] font-black tracking-[0.2em] shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
                      KODE RUANGAN
                    </span>
                    <div className="w-1.5 h-1.5 bg-[var(--success)] rounded-full animate-pulse" />
                  </div>
                  <span className="text-sm sm:text-base font-black bg-[var(--primary)] text-[var(--text)] px-4 py-1 neo-border neo-shadow italic tracking-tighter neo-text-glow">
                    {params.roomId}
                  </span>
                </div>
              </div>

              <form onSubmit={handleJoin} className="space-y-4 sm:space-y-6 text-left relative z-10">
                <div className="space-y-2 sm:space-y-3">
                  <label className="flex items-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-[var(--text)]/40 px-1 italic">
                    <Smile className="w-4 h-4" strokeWidth={3} /> NAMA PESTAMU
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="MASUKKAN NAMA PANGGILAN..."
                      maxLength={15}
                      className="w-full neo-border neo-shadow bg-white py-2.5 px-4 text-xs sm:text-sm italic uppercase placeholder:text-black/10 transition-all focus:bg-[var(--neutral)] outline-none"
                      required
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                      <Sparkles className="text-[var(--primary)] animate-wiggle w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <button
                    type="submit"
                    disabled={isJoining || !isConnected}
                    className="w-full neo-border neo-shadow bg-[var(--success)] text-[var(--text)] text-xs sm:text-sm py-2 sm:py-2.5 group relative overflow-hidden neo-pop font-black"
                  >
                    <motion.div 
                      className="absolute inset-0 bg-white/30 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12" 
                    />
                    <div className="flex items-center justify-center gap-2 relative z-10">
                      {isJoining ? (
                        <Loader2 className="animate-spin w-4 h-4" strokeWidth={4} />
                      ) : (
                        <>
                          <Zap strokeWidth={4} className="group-hover:scale-125 transition-transform group-hover:rotate-12 w-4 h-4" />
                          <span className="tracking-tighter uppercase italic">SIAP BERGABUNG</span>
                        </>
                      )}
                    </div>
                  </button>

                  <button 
                    type="button"
                    onClick={handleBackToMenu}
                    className="w-full py-2 text-[var(--text)] font-black uppercase tracking-[0.3em] text-[10px] sm:text-xs hover:text-[var(--danger)] transition-all flex items-center justify-center gap-2 group italic"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" strokeWidth={3} />
                    KEMBALI KE BERANDA
                  </button>
                </div>
              </form>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 bg-[var(--danger)] text-white p-3 neo-border-sm neo-shadow-sm font-black text-[10px] sm:text-xs uppercase tracking-widest text-center italic leading-relaxed"
                >
                  <div className="flex items-center justify-center gap-2 mb-1.5">
                    <AlertCircle strokeWidth={4} className="w-4 lg:w-5 h-4 lg:h-5" />
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
    // Logic for role counts (custom or automatic)
    const totalPlayers = room.players.length;
    const currentUcCount = room.settings.undercoverCount != null 
      ? room.settings.undercoverCount 
      : (totalPlayers >= 7 ? 2 : 1);
    const currentMwCount = room.settings.mrWhiteCount != null 
      ? room.settings.mrWhiteCount 
      : (totalPlayers >= 5 ? 1 : 0);
    
    const civilianCount = totalPlayers - currentUcCount - currentMwCount;
    
    // Validation: Civilians must be more than Undercover + Mr. White
    const isValidRolesConfiguration = civilianCount > (currentUcCount + currentMwCount);
    const allReady = room.players.length >= 3 && room.players.every((p: Player) => p.isReady);

    return (
      <main className="h-screen flex flex-col bg-[var(--bg-cheerful)] text-black relative overflow-hidden selection:bg-[var(--primary)]">
        {/* Background patterns and shapes */}
        <div className="fixed inset-0 z-0 opacity-[0.05] pointer-events-none bg-grid-pattern" />
        
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <FloatingShape color="var(--primary)" size={120} top="-20px" left="5%" delay={0} rotate={12} shape="circle" />
          <FloatingShape color="var(--secondary)" size={100} bottom="5%" right="-10px" delay={1.5} rotate={-15} shape="square" />
          <FloatingShape color="var(--success)" size={90} top="35%" left="-15px" delay={3} rotate={25} shape="triangle" />
          <FloatingShape color="var(--warning)" size={70} top="10%" right="10%" delay={4.5} rotate={-10} shape="circle" />
        </div>


        {/* Header */}
        <header className="sticky top-0 overflow-x-auto z-50 w-full shrink-0 h-auto py-2 neo-border-b bg-white flex items-center px-4 sm:px-6 neo-shadow">
          <div className="w-full flex items-center justify-between max-w-[1920px] mx-auto gap-4">
            <div className="flex items-center gap-4 sm:gap-5">
              <motion.button 
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleBackToMenu} 
                className="neo-button group bg-white text-black p-1.5 neo-shadow-sm hover:bg-[var(--danger)] hover:text-white transition-colors flex items-center justify-center neo-pop shrink-0 neo-border"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-colors" strokeWidth={4} />
              </motion.button>
              
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3 lg:gap-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] hidden md:inline text-black/30 italic">RUANG LOBI</span>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex items-center bg-[var(--primary)] px-2.5 py-1 lg:px-4 lg:py-1.5 neo-border neo-shadow italic tracking-tighter gap-2 lg:gap-3 group relative overflow-hidden neo-pop">
                      <motion.div className="absolute inset-0 bg-white/20 animate-shimmer pointer-events-none" />
                      <span className="text-xs lg:text-sm font-black relative z-10 neo-text-glow">{params.roomId}</span>
                      <button 
                        onClick={copyRoomCode} 
                        className="hover:scale-125 hover:rotate-12 transition-all text-black/40 hover:text-black relative z-10"
                        title="Salin Kode"
                      >
                        {copied ? <CheckCircle2 className="text-[var(--success)] w-3.5 lg:w-4 h-3.5 lg:h-4" strokeWidth={4} /> : <Copy className="w-3.5 lg:w-4 h-3.5 lg:h-4" strokeWidth={4} />}
                      </button>
                    </div>
                    {room.settings.isPublic && (
                      <span className="neo-badge neo-border shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] bg-[var(--success)] text-[8px] lg:text-[9px] px-2 py-0.5 hidden sm:flex items-center gap-1.5 animate-pulse neo-pop">
                        <div className="w-1.5 h-1.5 bg-black rounded-full" />
                        PUBLIK
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>


            <div className="flex items-center gap-3 sm:gap-4">
              <div className="hidden lg:flex items-center gap-3 px-3 py-1 bg-white neo-border neo-shadow -rotate-1">
                <div className="text-center group">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 mb-0 group-hover:text-black transition-colors italic leading-none">KAPASITAS</p>
                  <p className="text-sm sm:text-base font-black leading-tight italic">{room.players.length}<span className="text-black/20 mx-1">/</span>{room.settings.maxPlayers}</p>
                </div>
                <div className="w-[1.5px] h-4 bg-black rotate-12" />
                <div className="text-center group">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 mb-0 group-hover:text-black transition-colors italic leading-none">WAKTU</p>
                  <p className="text-sm sm:text-base font-black leading-tight italic">{room.settings.turnDurationSeconds}d</p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-1 bg-white neo-border neo-shadow rotate-1">
                <div className="relative">
                  <div className={`w-1.5 h-1.5 neo-border-sm ${isConnected ? 'bg-[var(--success)]' : 'bg-[var(--danger)]'}`} />
                  {isConnected && <div className="absolute inset-0 bg-[var(--success)] rounded-full animate-ping opacity-30" />}
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">
                  {isConnected ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
            </div>
          </div>
        </header>


        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 px-2 py-2 sm:p-3 lg:p-4">
          <div className="max-w-[1100px] mx-auto w-full flex flex-col gap-6 sm:gap-8">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">
              
              {/* Player List Section */}
              <div className="flex-1 w-full space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 relative">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <motion.div 
                      animate={{ rotate: [-5, 5, -5], scale: [1, 1.05, 1] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                      className="p-2 bg-[var(--secondary)] neo-border neo-shadow -rotate-6"
                    >
                      <Users className="w-5 h-5" strokeWidth={2} />
                    </motion.div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30 italic">DAFTAR PEMAIN</span>
                      <h2 
                        className="text-sm sm:text-lg font-black italic uppercase tracking-tighter leading-none"
                      >
                        PESTA KITA
                      </h2>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="text-xs sm:text-sm bg-white px-3 py-1 sm:px-4 sm:py-1.5 neo-border neo-shadow font-black italic rotate-3 border-l-[3px] border-l-[var(--primary)] neo-pop">
                      {room.players.length}
                    </div>

                    <div className="flex flex-col">
                      <div className="bg-[var(--warning)] neo-border neo-shadow px-2 py-0.5 sm:px-3 sm:py-1 -rotate-2 font-black text-[9px] sm:text-[10px] uppercase tracking-[0.2em] flex items-center gap-1.5 italic">
                        <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
                        {room.players.length < 3 ? 'MENUNGGU PEMAIN...' : 'SIAP BERMAIN?'}
                      </div>
                    </div>
                  </div>
                </div>



                <div className="grid grid-cols-1 gap-3 lg:gap-4">
                  <AnimatePresence mode="popLayout">
                    {room.players.map((player: Player, index: number) => (
                      <motion.div
                        key={player.id}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ delay: index * 0.05 }}
                        layout
                        className={`relative p-2 neo-border-sm neo-shadow-sm group overflow-hidden transition-all flex flex-col gap-2 ${
                          player.id === playerId 
                            ? 'bg-white border-l-[3px] border-l-[var(--primary)]' 
                            : 'bg-white'
                        }`}
                      >
                        {/* Decorative Strip for own card */}
                        {player.id === playerId && (
                          <>
                            <div className="absolute top-0 right-0 w-1.5 h-full neo-strip-secondary opacity-15" />
                            <div className="absolute top-[-1.5px] left-[-1.5px] w-3 h-3 border-2 border-[var(--primary)] border-r-0 border-b-0 z-20 pointer-events-none" />
                            <div className="absolute top-[-1.5px] right-[-1.5px] w-3 h-3 border-2 border-[var(--primary)] border-l-0 border-b-0 z-20 pointer-events-none" />
                            <div className="absolute bottom-[-1.5px] left-[-1.5px] w-3 h-3 border-2 border-[var(--primary)] border-r-0 border-t-0 z-20 pointer-events-none" />
                            <div className="absolute bottom-[-1.5px] right-[-1.5px] w-3 h-3 border-2 border-[var(--primary)] border-l-0 border-t-0 z-20 pointer-events-none" />
                          </>
                        )}

                        {player.isReady && player.id !== playerId && (
                          <>
                            <div className="absolute top-[-1.5px] left-[-1.5px] w-3 h-3 border-2 border-[var(--success)] border-r-0 border-b-0 z-20 pointer-events-none opacity-40" />
                            <div className="absolute bottom-[-1.5px] right-[-1.5px] w-3 h-3 border-2 border-[var(--success)] border-l-0 border-t-0 z-20 pointer-events-none opacity-40" />
                          </>
                        )}

                          <div className="flex flex-col gap-3 relative z-10 w-full">
                            <div className="flex items-center justify-between w-full">
                              <div className={`w-10 h-10 sm:w-12 sm:h-12 neo-border neo-shadow bg-white flex items-center justify-center font-black text-sm sm:text-base transition-all group-hover:scale-110 ${
                                player.id === playerId ? 'bg-[var(--primary)] rotate-6 group-hover:rotate-0' : 'bg-[var(--neutral)] -rotate-3 group-hover:rotate-6'
                              }`}>
                                {player.name[0].toUpperCase()}
                              </div>

                              <div className="flex items-center gap-1.5">
                                {player.isHost && (
                                  <motion.div animate={{ y: [0, -2, 0], rotate: [0, 15, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
                                    <Crown className="text-black fill-[var(--primary)] w-4 lg:w-5 h-4 lg:h-5" strokeWidth={3} />
                                  </motion.div>
                                )}
                                {player.id === playerId && (
                                  <div className="bg-black text-white px-2 py-0.5 text-[8px] sm:text-[10px] font-black uppercase tracking-widest italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rotate-3">
                                    KAMU
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex flex-col">
                                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-black/20 italic leading-none mb-1">AGEN TERDATA</span>
                                <p className="font-black text-xs sm:text-sm tracking-tighter truncate uppercase italic leading-none">
                                  {player.name}
                                </p>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-black/5 border-dashed">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 neo-border transition-colors duration-500 ${player.isReady ? 'bg-[var(--success)]' : 'bg-white'}`} />
                                    <p className={`text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${player.isReady ? 'text-[var(--success)]' : 'text-black/40'}`}>
                                      {player.isReady ? 'SIAP TEMPUR' : 'BERSIAP...'}
                                    </p>
                                </div>
                                <div className={`p-1.5 neo-border neo-shadow-sm transition-all ${
                                  player.isReady ? 'bg-[var(--secondary)] rotate-12' : 'bg-[var(--neutral)] opacity-20'
                                }`}>
                                  {player.isReady ? <CheckCircle2 size={12} strokeWidth={4} /> : <Circle size={12} strokeWidth={2} />}
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
              <div className="w-full lg:w-[280px] space-y-4 sm:space-y-6">
                <div className="bg-white p-3 sm:p-4 neo-border-sm neo-shadow-sm relative overflow-hidden group">
                  {/* Visual Accent */}
                  <div className="absolute top-0 left-0 w-full h-1 neo-strip" />
                  
                  <div className="absolute -top-8 -right-8 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                    <Zap className="w-20 lg:w-24 h-20 lg:h-24 rotate-12" />
                  </div>

                  <div className="flex flex-col gap-1 mb-4 relative z-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30 italic">PANEL KONTROL</span>
                    <h3 className="text-xs sm:text-sm font-black italic uppercase flex items-center gap-3 leading-none">
                      <div className="p-2 bg-[var(--primary)] neo-border -rotate-12 neo-shadow group-hover:rotate-0 transition-all duration-700">
                        <Gamepad2 className="w-5 h-5" strokeWidth={3} />
                      </div>
                      AKSI CEPAT
                    </h3>
                  </div>

                  <div className="space-y-3 relative z-10">
                    <button
                      onClick={() => setReady(!currentPlayer?.isReady)}
                      className={`w-full neo-border neo-shadow text-xs sm:text-sm py-2 sm:py-2.5 transition-all active:translate-y-1 active:shadow-none relative overflow-hidden group/btn neo-pop ${
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
                      <div className="space-y-3 pt-3 border-t-[1.5px] border-black/5 border-dashed">
                        <button
                          onClick={startGame}
                          disabled={!allReady || !isValidRolesConfiguration}
                          className="w-full neo-border neo-shadow bg-[var(--success)] text-black text-xs sm:text-sm py-2 sm:py-2.5 group relative overflow-hidden disabled:bg-black/10 disabled:grayscale disabled:opacity-40 neo-pop font-black"
                        >
                          <motion.div 
                            className="absolute inset-0 bg-white/30 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12" 
                          />
                          <div className="flex items-center justify-center gap-2 relative z-10">
                            <Play fill="black" className="group-hover:scale-125 transition-transform group-hover:rotate-12 w-3.5 h-3.5" />
                            <span className="italic tracking-tighter">MULAI PESTA</span>
                          </div>
                        </button>

                        {!isValidRolesConfiguration && (
                          <div className="flex flex-col gap-1.5 py-3 bg-[var(--danger)]/10 neo-border-sm border-dashed">
                            <div className="flex items-center justify-center gap-1.5">
                              <AlertCircle className="text-[var(--danger)] w-4 lg:w-5 h-4 lg:h-5" />
                              <p className="text-[10px] sm:text-xs font-black uppercase text-[var(--danger)] italic tracking-[0.1em] text-center px-2">
                                KOMPOSISI PERAN TIDAK VALID
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 text-[8px] font-black uppercase text-black/40">
                              <span>CIVILIAN: {civilianCount}</span>
                              <span className="text-black/10">|</span>
                              <span>UC + MW: {currentUcCount + currentMwCount}</span>
                            </div>
                            <p className="text-[8px] font-bold text-center text-[var(--danger)]/60 px-3 leading-tight">
                              CIVILIAN HARUS LEBIH BANYAK DARI TOTAL MUSUH (UC + MR. WHITE)
                            </p>
                          </div>
                        )}
                        
                        {!allReady && isValidRolesConfiguration && (
                          <div className="flex items-center justify-center gap-2 py-2.5 bg-[var(--danger)]/5 neo-border border-dashed">
                            <AlertCircle className="text-[var(--danger)] w-5 h-5" />
                            <p className="text-[10px] sm:text-xs font-black uppercase text-[var(--danger)] italic animate-pulse tracking-[0.2em]">
                               MENUNGGU SEMUA SIAP
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {!allReady && (
                      <div className="p-2.5 sm:p-3 bg-[var(--neutral)] neo-border-sm neo-shadow-sm relative overflow-hidden group border-l-[3px] border-l-[var(--warning)] mt-1.5">
                        <div className="absolute top-0 left-0 w-full h-0.5 bg-[var(--warning)] animate-shimmer" />
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-black uppercase tracking-[0.2em] italic text-black/60">
                              {room.players.length < 3 
                                ? 'BUTUH AGEN' 
                                : 'BERSIAP...'}
                            </p>
                            <Loader2 className="animate-spin text-[var(--warning)] w-5 h-5" strokeWidth={4} />
                          </div>
                          <div className="neo-progress-bar h-2 sm:h-2.5">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(room.players.length / room.settings.maxPlayers) * 100}%` }}
                              className="neo-progress-bar-fill bg-[var(--warning)]"
                            />
                          </div>
                          <p className="text-[10px] font-black uppercase text-center text-black/30 tracking-[0.2em]">
                            {room.players.length}/{room.settings.maxPlayers} SLOT
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
                    className="bg-white p-3 sm:p-4 neo-border-sm neo-shadow-sm relative overflow-hidden group"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 neo-strip-secondary opacity-30" />
                    
                    <div className="absolute -bottom-8 -left-8 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                      <Sliders className="w-16 lg:w-20 h-16 lg:h-20 -rotate-12" />
                    </div>
                    
                    <div className="flex flex-col gap-1 mb-3 relative z-10">
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30 italic">KONFIGURASI</span>
                      <h3 className="text-xs sm:text-sm font-black italic uppercase flex items-center gap-3 leading-none">
                        <div className="p-2 bg-[var(--warning)] rotate-6 neo-border neo-shadow group-hover:rotate-0 transition-all duration-700">
                          <Settings2 className="w-5 h-5" strokeWidth={3} />
                        </div>
                        PENGATURAN
                      </h3>
                    </div>
                    
                      <div className="space-y-4 relative z-10">
                        <div className="grid grid-cols-1 gap-3">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                              <div className="flex items-center gap-2">
                                <Users className="text-black/40 w-4 h-4" />
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] block text-black/40 italic">KAPASITAS</label>
                              </div>
                            </div>
                            <div className="relative group">
                              <select 
                                value={room.settings.maxPlayers}
                                onChange={(e) => updateSettings({ maxPlayers: parseInt(e.target.value) })}
                                className="w-full neo-border bg-white cursor-pointer text-xs italic uppercase hover:bg-[var(--neutral)] transition-all appearance-none pr-8 py-2 px-3 font-black"
                              >
                                {[3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map(n => (
                                  <option key={n} value={n}>{n} AGEN MAX</option>
                                ))}
                              </select>
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none group-hover:rotate-180 transition-transform duration-500">
                                <ChevronRight className="w-4 h-4" strokeWidth={4} />
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                              <div className="flex items-center gap-2">
                                <TimerIcon className="text-black/40 w-4 h-4" />
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] block text-black/40 italic">DURASI TURN</label>
                              </div>
                            </div>
                            <div className="relative group">
                              <select 
                                value={room.settings.turnDurationSeconds}
                                onChange={(e) => updateSettings({ turnDurationSeconds: parseInt(e.target.value) })}
                                className="w-full neo-border bg-white cursor-pointer text-xs italic uppercase hover:bg-[var(--neutral)] transition-all appearance-none pr-8 py-2 px-3 font-black"
                              >
                                {[15, 30, 45, 60, 90, 120].map(s => (
                                  <option key={s} value={s}>{s} DETIK</option>
                                ))}
                              </select>
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none group-hover:scale-125 transition-transform duration-300">
                                <Sparkles className="text-[var(--primary)] w-4 h-4" strokeWidth={2} />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                              <div className="flex items-center gap-2">
                                <Search className="text-black/40 w-4 h-4" />
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] block text-black/40 italic">JUMLAH UC</label>
                              </div>
                            </div>
                            <div className="relative group">
                              <select 
                                value={room.settings.undercoverCount ?? -1}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  updateSettings({ undercoverCount: val });
                                }}
                                className="w-full neo-border bg-white cursor-pointer text-xs italic uppercase hover:bg-[var(--neutral)] transition-all appearance-none pr-8 py-2 px-3 font-black"
                              >
                                <option value={-1}>OTOMATIS</option>
                                {[1, 2, 3, 4, 5].map(n => (
                                  <option key={n} value={n}>{n} AGEN</option>
                                ))}
                              </select>
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none group-hover:rotate-180 transition-transform duration-500">
                                <ChevronRight className="w-4 h-4" strokeWidth={4} />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                              <div className="flex items-center gap-2">
                                <Smile className="text-black/40 w-4 h-4" />
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] block text-black/40 italic">JUMLAH MR. WHITE</label>
                              </div>
                            </div>
                            <div className="relative group">
                              <select 
                                value={room.settings.mrWhiteCount ?? -1}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  updateSettings({ mrWhiteCount: val });
                                }}
                                className="w-full neo-border bg-white cursor-pointer text-xs italic uppercase hover:bg-[var(--neutral)] transition-all appearance-none pr-8 py-2 px-3 font-black"
                              >
                                <option value={-1}>OTOMATIS</option>
                                <option value={0}>0 AGEN</option>
                                {[1, 2, 3, 4, 5].map(n => (
                                  <option key={n} value={n}>{n} AGEN</option>
                                ))}
                              </select>
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none group-hover:rotate-180 transition-transform duration-500">
                                <ChevronRight className="w-4 h-4" strokeWidth={4} />
                              </div>
                            </div>
                          </div>

                          <div className="pt-2">
                            <label className="flex items-center justify-between cursor-pointer p-2 bg-[var(--neutral)] neo-border group transition-all hover:bg-white active:translate-y-1 hover:neo-shadow border-l-[4px] border-l-black">
                              <div className="flex flex-col gap-1">
                                <span className="text-xs sm:text-sm font-black uppercase tracking-[0.1em] group-hover:italic transition-all leading-tight">RUANGAN PUBLIK</span>
                                <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest italic">DAPAT DITEMUKAN</span>
                              </div>
                              <div className="relative w-8 h-8 shrink-0">
                                <input 
                                  type="checkbox" 
                                  checked={room.settings.isPublic} 
                                  onChange={(e) => updateSettings({ isPublic: e.target.checked })}
                                  className="peer absolute inset-0 opacity-0 cursor-pointer z-10"
                                />
                                <div className="w-8 h-8 neo-border bg-white peer-checked:bg-[var(--success)] flex items-center justify-center transition-all neo-shadow peer-active:shadow-none">
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
