'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Crown, Settings, Play, CheckCircle2, Circle, ArrowLeft, Copy, Loader2 } from 'lucide-react';
import { useGameState } from '../../../hooks/useGameState';
import { Player } from '../../../types/game';

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
    navigator.clipboard.writeText(params.roomId as string);
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
      <main className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-6">
        <Loader2 className="w-12 h-12 text-[#FFD600] animate-spin mb-4" />
        <p className="text-black font-black uppercase tracking-widest animate-pulse">Establishing Connection...</p>
      </main>
    );
  }

  // If room is null, we either need to join or we're waiting for reconnect
  if (!room) {
    return (
      <main className="min-h-screen bg-[#F5F5F5] text-black flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-5 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '30px 30px' }} />
        
        <div className="max-w-md w-full z-10 relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 neo-card"
          >
            <div className="text-center mb-8">
              <h1 className="text-4xl font-black mb-2 uppercase italic">Join Room</h1>
              <p className="text-sm font-bold uppercase tracking-widest">
                Room Code: <span className="bg-[#FFD600] px-2 neo-border">{params.roomId}</span>
              </p>
            </div>

            <form onSubmit={handleJoin} className="space-y-6 text-left">
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-widest">Your Codename</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Agent 007"
                  maxLength={15}
                  className="w-full neo-input text-lg"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isJoining || !isConnected}
                className="w-full neo-button bg-[#00E699] text-black text-lg h-14"
              >
                {isJoining ? <Loader2 className="animate-spin" /> : 'Join Mission'}
              </button>

              <button 
                type="button"
                onClick={handleBackToMenu}
                className="w-full text-black font-black uppercase tracking-widest text-sm hover:underline"
              >
                Abondon Mission
              </button>
            </form>

            {error && (
              <div className="mt-6 bg-[#FF4D4D] text-white p-3 neo-border neo-shadow-sm font-bold text-sm">
                {error.message}
              </div>
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
    <main className="h-screen flex flex-col bg-[#F5F5F5] text-black relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '30px 30px' }} />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full shrink-0 h-20 border-b-4 border-black bg-white flex items-center px-4 sm:px-8">
        <div className="w-full flex items-center justify-between max-w-[1920px] mx-auto gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBackToMenu} 
              className="neo-button bg-white p-2 w-10 h-10 shadow-sm hover:bg-[#F5F5F5]"
            >
              <ArrowLeft size={20} strokeWidth={3} />
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Room</span>
                <h1 className="text-xl font-black bg-[#FFD600] px-3 neo-border neo-shadow-sm flex items-center gap-2 italic">
                  {params.roomId}
                  <button onClick={copyRoomCode} className="hover:scale-110 transition-transform">
                    {copied ? <CheckCircle2 size={16} className="text-black" /> : <Copy size={16} />}
                  </button>
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-6 px-6 py-2 bg-white neo-border neo-shadow-sm">
              <div className="text-center">
                <p className="text-[9px] font-black uppercase tracking-widest">Agents</p>
                <p className="text-sm font-black">{room.players.length}/{room.settings.maxPlayers}</p>
              </div>
              <div className="w-0.5 h-6 bg-black" />
              <div className="text-center">
                <p className="text-[9px] font-black uppercase tracking-widest">Turn</p>
                <p className="text-sm font-black">{room.settings.turnDurationSeconds}s</p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-white neo-border neo-shadow-sm">
              <div className={`w-3 h-3 neo-border ${isConnected ? 'bg-[#00E699]' : 'bg-[#FF4D4D] animate-pulse'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {isConnected ? 'Synced' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
        <div className="max-w-6xl mx-auto p-4 sm:p-8 md:p-12">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
            {/* Player List Section */}
            <div className="flex-1 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-4">
                  <div className="p-3 bg-[#FF90E8] neo-border neo-shadow-sm">
                    <Users size={28} />
                  </div>
                  Active Agents
                  <span className="text-lg bg-white px-4 py-1 neo-border neo-shadow-sm not-italic ml-2">
                    {room.players.length}
                  </span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                  {room.players.map((player: Player) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      layout
                      className={`relative p-5 neo-card transition-all ${
                        player.id === playerId ? 'ring-4 ring-[#FFD600] ring-offset-4' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 neo-border neo-shadow-sm flex items-center justify-center font-black text-2xl ${
                            player.id === playerId ? 'bg-[#FFD600]' : 'bg-white'
                          }`}>
                            {player.name[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-black text-xl tracking-tight truncate max-w-[150px]">
                                {player.name}
                              </p>
                              {player.isHost && <Crown size={18} className="text-black fill-[#FFD600]" />}
                              {player.id === playerId && (
                                <span className="neo-badge bg-[#00E699]">YOU</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`w-2.5 h-2.5 neo-border ${player.isReady ? 'bg-[#00E699]' : 'bg-white'}`} />
                              <p className="text-xs font-black uppercase tracking-widest">
                                {player.isReady ? 'Ready to Go' : 'Preparing...'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className={`p-2 neo-border neo-shadow-sm ${player.isReady ? 'bg-[#FF90E8]' : 'bg-white'}`}>
                          {player.isReady ? <CheckCircle2 size={28} /> : <Circle size={28} />}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Controls Sidebar */}
            <div className="w-full lg:w-96 space-y-8">
              <div className="bg-white p-8 neo-card lg:sticky lg:top-8">
                <h3 className="text-2xl font-black italic uppercase mb-8 flex items-center gap-4">
                  <div className="p-2 bg-[#FFD600] neo-border">
                    <Settings size={24} />
                  </div>
                  Terminal
                </h3>

                <div className="space-y-6">
                  <button
                    onClick={() => setReady(!currentPlayer?.isReady)}
                    className={`w-full neo-button text-lg h-16 ${
                      currentPlayer?.isReady 
                        ? 'bg-white text-black' 
                        : 'bg-[#FF90E8] text-black'
                    }`}
                  >
                    {currentPlayer?.isReady ? 'I AM NOT READY' : 'I AM READY!'}
                  </button>

                  {isHost && (
                    <button
                      onClick={startGame}
                      disabled={!allReady}
                      className="w-full neo-button bg-[#00E699] text-black text-lg h-16"
                    >
                      <Play size={24} fill="black" />
                      START MISSION
                    </button>
                  )}

                  {!allReady && (
                    <div className="p-4 bg-[#F5F5F5] neo-border">
                      <p className="text-center text-[11px] font-black uppercase tracking-widest leading-relaxed">
                        {room.players.length < 3 
                          ? 'Recruiting agents (Min 3)...' 
                          : 'Waiting for team confirmation...'}
                      </p>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="mt-8 bg-[#FF4D4D] text-white p-4 neo-border neo-shadow-sm font-black text-xs uppercase tracking-widest text-center">
                    {error.message}
                  </div>
                )}
              </div>

              {isHost && (
                <div className="bg-white p-8 neo-card">
                  <h3 className="text-xl font-black italic uppercase mb-6 flex items-center gap-4">
                    <div className="p-2 bg-[#00E699] neo-border">
                      <Settings size={20} />
                    </div>
                    Mission Specs
                  </h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest block px-1">Max Agents</label>
                      <select 
                        value={room.settings.maxPlayers}
                        onChange={(e) => updateSettings({ maxPlayers: parseInt(e.target.value) })}
                        className="w-full neo-input cursor-pointer"
                      >
                        {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(n => (
                          <option key={n} value={n}>{n} Agents</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest block px-1">Turn Time</label>
                      <select 
                        value={room.settings.turnDurationSeconds}
                        onChange={(e) => updateSettings({ turnDurationSeconds: parseInt(e.target.value) })}
                        className="w-full neo-input cursor-pointer"
                      >
                        {[15, 30, 45, 60, 90, 120].map(s => (
                          <option key={s} value={s}>{s} Seconds</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

