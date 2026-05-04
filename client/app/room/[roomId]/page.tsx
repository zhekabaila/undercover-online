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
      <main className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-400 animate-pulse font-medium">Restoring your session...</p>
      </main>
    );
  }

  // If room is null, we either need to join or we're waiting for reconnect
  if (!room) {
    return (
      <main className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
        
        <div className="max-w-md w-full z-10 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-black mb-2">Join Room</h1>
              <p className="text-gray-400">Enter your name to join <span className="text-blue-500 font-mono font-bold">{params.roomId}</span></p>
            </div>

            <form onSubmit={handleJoin} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">
                  Your Nickname
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Agent 007"
                  maxLength={15}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isJoining || !isConnected}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 py-4 rounded-2xl font-bold text-lg transition-all active:scale-95 shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                {isJoining ? <Loader2 className="animate-spin" /> : 'Join Lobby'}
              </button>

              <button 
                type="button"
                onClick={handleBackToMenu}
                className="w-full text-gray-500 hover:text-white font-medium transition-colors"
              >
                Cancel
              </button>
            </form>

            {error && (
              <p className="mt-4 text-red-400 text-sm text-center font-medium">
                {error.message}
              </p>
            )}

            {!isConnected && (
              <p className="mt-4 text-yellow-500/80 text-xs text-center font-medium animate-pulse">
                Reconnecting to server...
              </p>
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
    <main className="h-screen flex flex-col bg-[#020617] text-white relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] sm:w-[40%] h-[60%] sm:h-[40%] bg-blue-600/10 blur-[80px] sm:blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] sm:w-[40%] h-[60%] sm:h-[40%] bg-purple-600/10 blur-[80px] sm:blur-[120px] rounded-full pointer-events-none" />

      {/* Synchronized Header - Sticky and Consistent */}
      <header className="sticky top-0 z-50 w-full shrink-0 h-16 sm:h-20 border-b border-white/10 bg-[#020617]/80 backdrop-blur-xl flex items-center px-4 sm:px-8 shadow-2xl">
        <div className="w-full flex items-center justify-between max-w-[1920px] mx-auto gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleBackToMenu} 
              className="p-2.5 hover:bg-white/5 rounded-xl transition-all group border border-transparent hover:border-white/10"
              title="Back to Menu"
            >
              <ArrowLeft size={20} className="text-slate-400 group-hover:text-white transition-colors" />
            </button>
            <div className="h-6 w-px bg-white/10 hidden sm:block" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest hidden sm:inline">Room Code</span>
                <h1 className="text-sm sm:text-lg font-mono font-bold text-blue-500 flex items-center gap-2 leading-none">
                  {params.roomId}
                  <button 
                    onClick={copyRoomCode}
                    className="p-1 hover:bg-white/10 rounded transition-all active:scale-90"
                  >
                    {copied ? <CheckCircle2 size={14} className="text-green-500" /> : <Copy size={14} className="text-gray-500" />}
                  </button>
                </h1>
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-md hidden md:block">
            <div className="bg-white/5 backdrop-blur-xl px-6 py-2.5 rounded-2xl border border-white/10 flex items-center justify-around gap-6">
              <div className="text-center">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-0.5">Agents</p>
                <p className="text-sm font-black text-blue-400">{room.players.length}/{room.settings.maxPlayers}</p>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div className="text-center">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-0.5">Turn</p>
                <p className="text-sm font-black text-blue-400">{room.settings.turnDurationSeconds}s</p>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div className="text-center">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-0.5">Disc.</p>
                <p className="text-sm font-black text-blue-400">{room.settings.discussionDurationSeconds}s</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isHost && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                <Crown size={12} className="text-yellow-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-yellow-500">Host Access</span>
              </div>
            )}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <div className={`w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px] ${isConnected ? 'bg-green-500 shadow-green-500/50' : 'bg-red-500 shadow-red-500/50'}`} />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                {isConnected ? 'Sync' : 'Lost'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8 lg:p-12">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Player List Section */}
            <div className="flex-1 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Users size={20} className="text-white" />
                  </div>
                  PLAYERS
                  <span className="text-sm font-bold text-gray-500 ml-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    {room.players.length}
                  </span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {room.players.map((player: Player) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -20 }}
                      layout
                      className={`group relative p-4 sm:p-5 rounded-2xl sm:rounded-3xl border-2 transition-all duration-300 ${
                        player.id === playerId 
                          ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.1)]' 
                          : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-black text-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${
                            player.id === playerId ? 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/20' : 'bg-white/10'
                          }`}>
                            {player.name[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-black text-base sm:text-lg tracking-tight truncate max-w-[120px] sm:max-w-[180px]">
                                {player.name}
                              </p>
                              {player.isHost && <Crown size={14} className="text-yellow-500 fill-yellow-500/20" />}
                              {player.id === playerId && (
                                <span className="text-[8px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full">YOU</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${player.isReady ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-gray-600'}`} />
                              <p className={`text-[10px] font-black uppercase tracking-widest ${
                                player.isReady ? 'text-green-500' : 'text-gray-500'
                              }`}>
                                {player.isReady ? 'Ready' : 'Waiting...'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className={`p-2 rounded-full transition-colors ${player.isReady ? 'bg-green-500/10 text-green-500' : 'bg-white/5 text-gray-700'}`}>
                          {player.isReady ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Controls Sidebar */}
            <div className="w-full lg:w-80 space-y-6">
              <div className="bg-white/[0.03] backdrop-blur-2xl p-6 sm:p-8 rounded-[2rem] border border-white/10 shadow-2xl lg:sticky lg:top-0">
                <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                  <div className="p-2 bg-purple-600 rounded-lg">
                    <Settings size={20} className="text-white" />
                  </div>
                  CONTROLS
                </h3>

                <div className="space-y-4">
                  <button
                    onClick={() => setReady(!currentPlayer?.isReady)}
                    className={`w-full py-4 rounded-2xl font-black text-base transition-all duration-300 active:scale-95 shadow-xl ${
                      currentPlayer?.isReady 
                        ? 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white' 
                        : 'bg-green-600 text-white hover:bg-green-500 shadow-green-600/20 border-b-4 border-green-700 hover:border-green-600 active:border-b-0 translate-y-[-2px] active:translate-y-0'
                    }`}
                  >
                    {currentPlayer?.isReady ? 'UNREADY' : 'I AM READY!'}
                  </button>

                  {isHost && (
                    <button
                      onClick={startGame}
                      disabled={!allReady}
                      className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 shadow-xl shadow-blue-500/20 border-b-4 border-blue-700 hover:border-blue-600 active:border-b-0 translate-y-[-2px] active:translate-y-0"
                    >
                      <Play size={20} className="fill-current" />
                      START GAME
                    </button>
                  )}

                  {!allReady && (
                    <div className="p-4 bg-white/5 rounded-2xl border border-dashed border-white/10">
                      <p className="text-center text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                        {room.players.length < 3 
                          ? 'Waiting for at least 3 players to start...' 
                          : 'Waiting for all players to be ready...'}
                      </p>
                    </div>
                  )}
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl"
                  >
                    <p className="text-red-400 text-xs text-center font-bold uppercase tracking-tight">
                      {error.message}
                    </p>
                  </motion.div>
                )}
              </div>

              {isHost && (
                <div className="bg-white/[0.03] backdrop-blur-2xl p-6 sm:p-8 rounded-[2rem] border border-white/10 shadow-2xl">
                  <h3 className="text-lg font-black mb-6 flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <Settings size={18} className="text-white" />
                    </div>
                    SETTINGS
                  </h3>
                  <div className="space-y-5">
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2.5 px-1">Max Players</label>
                      <select 
                        value={room.settings.maxPlayers}
                        onChange={(e) => updateSettings({ maxPlayers: parseInt(e.target.value) })}
                        className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer hover:bg-white/[0.08]"
                      >
                        {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(n => (
                          <option key={n} value={n} className="bg-[#020617] text-white">{n} Players</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2.5 px-1">Turn Duration</label>
                      <select 
                        value={room.settings.turnDurationSeconds}
                        onChange={(e) => updateSettings({ turnDurationSeconds: parseInt(e.target.value) })}
                        className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer hover:bg-white/[0.08]"
                      >
                        {[15, 30, 45, 60, 90, 120].map(s => (
                          <option key={s} value={s} className="bg-[#020617] text-white">{s} Seconds</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2.5 px-1">Discussion</label>
                      <select 
                        value={room.settings.discussionDurationSeconds}
                        onChange={(e) => updateSettings({ discussionDurationSeconds: parseInt(e.target.value) })}
                        className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer hover:bg-white/[0.08]"
                      >
                        {[30, 60, 90, 120, 180, 300].map(s => (
                          <option key={s} value={s} className="bg-[#020617] text-white">{s} Seconds</option>
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

