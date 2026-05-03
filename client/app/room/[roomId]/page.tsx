'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Crown, Settings, Play, CheckCircle2, Circle, ArrowLeft, Copy, Loader2 } from 'lucide-react';
import { useGameState } from '../../../hooks/useGameState';

export default function Lobby() {
  const params = useParams();
  const router = useRouter();
  const { room, playerId, setReady, startGame, leaveRoom, joinRoom, error, isConnected, isInitialLoading } = useGameState();
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

  const currentPlayer = room.players.find(p => p.id === playerId);
  const isHost = currentPlayer?.isHost;
  const allReady = room.players.length >= 3 && room.players.every(p => p.isReady);

  return (
    <main className="min-h-screen bg-[#0f172a] text-white p-4 sm:p-6 md:p-12 relative overflow-x-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[60%] sm:w-[50%] h-[60%] sm:h-[50%] bg-blue-600/10 rounded-full blur-[80px] sm:blur-[120px]" />
      
      <div className="max-w-6xl mx-auto z-10 relative">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 sm:mb-12 bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10">
          <div className="w-full md:w-auto">
            <button onClick={handleBackToMenu} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 group text-sm sm:text-base">
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Back to Menu
            </button>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
                ROOM: <span className="text-blue-500 font-mono">{params.roomId}</span>
                <button 
                  onClick={copyRoomCode}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all active:scale-95"
                >
                  {copied ? <CheckCircle2 size={18} className="text-green-500" /> : <Copy size={18} />}
                </button>
              </h1>
              {isHost && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full w-fit">
                  <Crown size={12} className="text-yellow-500" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-yellow-500">Host</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl p-3 sm:p-4 rounded-2xl border border-white/10 w-full md:w-auto">
            <div className="flex items-center justify-around md:justify-start gap-4 sm:gap-6">
              <div className="text-center">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5 sm:mb-1">Players</p>
                <p className="text-lg sm:text-xl font-black">{room.players.length} / {room.settings.maxPlayers}</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5 sm:mb-1">Turns</p>
                <p className="text-lg sm:text-xl font-black">{room.settings.turnDurationSeconds}s</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Player List */}
          <div className="flex-1 space-y-4">
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 mb-4 sm:mb-6">
              <Users size={20} className="text-blue-500" />
              Players in Lobby
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <AnimatePresence mode="popLayout">
                {room.players.map((player) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    layout
                    className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border transition-all ${
                      player.id === playerId 
                        ? 'bg-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-500/5' 
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center font-bold text-lg sm:text-xl ${
                          player.id === playerId ? 'bg-blue-500' : 'bg-white/10'
                        }`}>
                          {player.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-base sm:text-lg flex items-center gap-2">
                            {player.name}
                            {player.isHost && <Crown size={14} className="text-yellow-500" />}
                          </p>
                          <p className={`text-[10px] font-black uppercase tracking-widest ${
                            player.isReady ? 'text-green-500' : 'text-gray-500'
                          }`}>
                            {player.isReady ? 'Ready' : 'Waiting...'}
                          </p>
                        </div>
                      </div>
                      {player.isReady ? (
                        <CheckCircle2 size={20} className="text-green-500" />
                      ) : (
                        <Circle size={20} className="text-gray-700" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Controls */}
          <div className="w-full lg:w-80 space-y-6">
            <div className="bg-white/5 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/10 lg:sticky lg:top-6">
              <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                <Settings size={20} className="text-purple-500" />
                Room Controls
              </h3>

              <div className="space-y-3 sm:space-y-4">
                <button
                  onClick={() => setReady(!currentPlayer?.isReady)}
                  className={`w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all active:scale-95 ${
                    currentPlayer?.isReady 
                      ? 'bg-white/10 text-white hover:bg-white/20' 
                      : 'bg-green-600 text-white hover:bg-green-500 shadow-xl shadow-green-500/20'
                  }`}
                >
                  {currentPlayer?.isReady ? 'Unready' : 'I am Ready!'}
                </button>

                {isHost && (
                  <button
                    onClick={startGame}
                    disabled={!allReady}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-blue-500/20"
                  >
                    <Play size={20} />
                    Start Game
                  </button>
                )}

                {!allReady && (
                  <p className="text-center text-xs text-gray-500 font-medium">
                    {room.players.length < 3 
                      ? 'Waiting for at least 3 players...' 
                      : 'Waiting for everyone to be ready...'}
                  </p>
                )}
              </div>

              {error && (
                <p className="mt-4 text-red-400 text-sm text-center font-medium">
                  {error.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

