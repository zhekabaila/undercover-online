import { useState, useEffect, useCallback } from 'react'
import wsClient from '../lib/wsClient'
import { WSEvent, ErrorCode } from '../types/events'
import { Room, Player, ChatMessage, PublicRoom } from '../types/game'

// Global state to persist between page navigations - defined OUTSIDE the hook
let globalRoom: Room | null = null
let globalPlayerId: string | null = null
let globalMessages: ChatMessage[] = []
let globalPublicRooms: PublicRoom[] = []
let globalIsInitialLoading = true
const listeners = new Set<() => void>()

const updateGlobalState = (updates: {
  room?: Room | null
  playerId?: string | null
  messages?: ChatMessage[]
  publicRooms?: PublicRoom[]
  isInitialLoading?: boolean
}) => {
  if (updates.room !== undefined) globalRoom = updates.room
  if (updates.playerId !== undefined) globalPlayerId = updates.playerId
  if (updates.messages !== undefined) globalMessages = updates.messages
  if (updates.publicRooms !== undefined) globalPublicRooms = updates.publicRooms
  if (updates.isInitialLoading !== undefined)
    globalIsInitialLoading = updates.isInitialLoading
  listeners.forEach((l) => l())
}

export function useGameState() {
  const [room, setRoom] = useState<Room | null>(globalRoom)
  const [playerId, setPlayerId] = useState<string | null>(globalPlayerId)
  const [error, setError] = useState<{ code: string; message: string } | null>(
    null,
  )
  const [messages, setMessages] = useState<ChatMessage[]>(globalMessages)
  const [publicRooms, setPublicRooms] = useState<PublicRoom[]>(globalPublicRooms)
  const [isInitialLoading, setIsInitialLoading] = useState(
    globalIsInitialLoading,
  )
  const [isConnected, setIsConnected] = useState(
    wsClient?.isConnected() || false,
  )

  useEffect(() => {
    const handleChange = () => {
      setRoom(globalRoom)
      setPlayerId(globalPlayerId)
      setMessages(globalMessages)
      setPublicRooms(globalPublicRooms)
      setIsInitialLoading(globalIsInitialLoading)
    }
    listeners.add(handleChange)
    return () => {
      listeners.delete(handleChange)
    }
  }, [])

  useEffect(() => {
    if (!wsClient) return

    const unsubscribers = [
      wsClient.on('CONNECTED', () => {
        setIsConnected(true)
        // Auto-reconnect if we have a saved session
        const savedRoomId = localStorage.getItem('party_roomId')
        const savedPlayerId = localStorage.getItem('party_playerId')
        if (savedRoomId && savedPlayerId) {
          wsClient?.send(WSEvent.RECONNECT, {
            roomId: savedRoomId,
            playerId: savedPlayerId,
          })
        }
      }),
      wsClient.on('DISCONNECTED', () => setIsConnected(false)),
      wsClient.on(WSEvent.ROOM_CREATED, (payload) => {
        updateGlobalState({
          room: payload.room,
          playerId: payload.playerId,
          isInitialLoading: false,
        })
        localStorage.setItem('party_roomId', payload.room.id)
        localStorage.setItem('party_playerId', payload.playerId)
      }),
      wsClient.on(WSEvent.ROOM_JOINED, (payload) => {
        updateGlobalState({
          room: payload.room,
          playerId: payload.playerId,
          isInitialLoading: false,
        })
        localStorage.setItem('party_roomId', payload.room.id)
        localStorage.setItem('party_playerId', payload.playerId)
      }),
      wsClient.on(WSEvent.PLAYER_JOINED, (payload) => {
        if (!globalRoom) return
        // Check if player already exists to prevent duplicates (ROOM_JOINED + PLAYER_JOINED race)
        const exists = globalRoom.players.some(
          (p: Player) => p.id === payload.player.id,
        )
        if (exists) return

        const players = [...globalRoom.players, payload.player]
        updateGlobalState({ room: { ...globalRoom, players } })
      }),
      wsClient.on(WSEvent.PLAYER_LEFT, (payload) => {
        if (!globalRoom) return
        const players = globalRoom.players.filter(
          (p: Player) => p.id !== payload.playerId,
        )
        updateGlobalState({ room: { ...globalRoom, players } })
      }),
      wsClient.on(WSEvent.PLAYER_READY, (payload) => {
        if (!globalRoom) return
        const players = globalRoom.players.map((p: Player) =>
          p.id === payload.playerId ? { ...p, isReady: payload.isReady } : p,
        )
        updateGlobalState({ room: { ...globalRoom, players } })
      }),
      wsClient.on(WSEvent.ROOM_UPDATED, (payload) => {
        updateGlobalState({ room: payload.room })
      }),
      wsClient.on(WSEvent.PUBLIC_ROOMS_LIST, (payload) => {
        updateGlobalState({ publicRooms: payload.rooms })
      }),
      wsClient.on(WSEvent.GAME_STARTING, (payload) => {
        if (!globalRoom) return
        updateGlobalState({
          room: {
            ...globalRoom,
            game: {
              phase: 'starting',
              roundNumber: 1,
              turnOrder: { playerIds: [], currentIndex: 0 },
              votes: {},
            } as any,
          },
          messages: [], // Clear chat history for new game
        })
      }),
      wsClient.on(WSEvent.ROLE_ASSIGNED, (payload) => {
        if (!globalRoom) return
        const players = globalRoom.players.map((p: Player) =>
          p.id === globalPlayerId
            ? { ...p, role: payload.role, word: payload.word }
            : p,
        )
        updateGlobalState({ room: { ...globalRoom, players } })
      }),
      wsClient.on(WSEvent.TURN_STARTED, (payload) => {
        if (!globalRoom || !globalRoom.game) return
        updateGlobalState({
          room: {
            ...globalRoom,
            game: {
              ...globalRoom.game,
              phase: 'speaking',
              turnEndTime: payload.endsAt,
              turnOrder: {
                ...globalRoom.game.turnOrder,
                currentIndex: globalRoom.game.turnOrder.playerIds.indexOf(
                  payload.playerId,
                ),
              },
            },
          },
        })
      }),
      wsClient.on(WSEvent.DISCUSSION_STARTED, (payload) => {
        if (!globalRoom || !globalRoom.game) return
        updateGlobalState({
          room: {
            ...globalRoom,
            game: {
              ...globalRoom.game,
              phase: 'discussion',
              turnEndTime: Date.now() + payload.durationSeconds * 1000,
            },
          },
        })
      }),
      wsClient.on(WSEvent.VOTE_STARTED, () => {
        if (!globalRoom || !globalRoom.game) return
        updateGlobalState({
          room: {
            ...globalRoom,
            game: {
              ...globalRoom.game,
              phase: 'voting',
              votes: {},
              passes: {},
            },
          },
        })
      }),
      wsClient.on(WSEvent.VOTE_RESULT, (payload) => {
        if (!globalRoom) return

        // Handle draw case
        if (payload.isDraw) {
          const drawPlayerNames =
            payload.drawnPlayerIds
              ?.map((id: string) => {
                const p = globalRoom?.players.find(
                  (player: Player) => player.id === id,
                )
                return p?.name
              })
              .join(', ') || 'Unknown'

          // Just update game state, no elimination
          updateGlobalState({ room: globalRoom })
          return
        }

        // Handle normal elimination
        if (payload.eliminatedId) {
          const players = globalRoom.players.map((p: Player) =>
            p.id === payload.eliminatedId
              ? { ...p, isAlive: false, role: payload.role }
              : p,
          )
          updateGlobalState({ room: { ...globalRoom, players } })
        } else {
          // Pass case (no elimination)
          updateGlobalState({ room: globalRoom })
        }
      }),
      wsClient.on(WSEvent.GAME_ENDED, (payload) => {
        if (!globalRoom || !globalRoom.game) return
        updateGlobalState({
          room: {
            ...globalRoom,
            game: {
              ...globalRoom.game,
              phase: 'ended',
              winnerRole: payload.winnerRole,
            },
            players: payload.players,
          },
          messages: [], // Clear chat history when game ends
        })
      }),
      wsClient.on(WSEvent.CHAT_MESSAGE, (payload) => {
        updateGlobalState({ messages: [...globalMessages, payload] })
      }),
      wsClient.on(WSEvent.ERROR, (payload) => {
        setError(payload)

        // If room is not found, clear local session to stop loading loops
        if (
          payload.code === ErrorCode.ROOM_NOT_FOUND ||
          payload.message?.toLowerCase().includes('not found')
        ) {
          clearSession()
        }
        updateGlobalState({ isInitialLoading: false })

        setTimeout(() => setError(null), 5000)
      }),
    ]

    // Initial loading state resolution:
    // If we have a session, isInitialLoading will stay true until ROOM_JOINED or ERROR.
    // If we don't have a session, we can set it to false immediately.
    const savedRoomId = localStorage.getItem('party_roomId')
    const savedPlayerId = localStorage.getItem('party_playerId')
    if (!savedRoomId || !savedPlayerId) {
      updateGlobalState({ isInitialLoading: false })
    }

    wsClient.connect()

    return () => unsubscribers.forEach((unsub) => unsub())
  }, [])

  const createRoom = useCallback((name: string, settings: any) => {
    wsClient?.send(WSEvent.CREATE_ROOM, { name, settings })
  }, [])

  const joinRoom = useCallback((roomId: string, name: string) => {
    wsClient?.send(WSEvent.JOIN_ROOM, { roomId, name })
  }, [])

  const setReady = useCallback((isReady: boolean) => {
    wsClient?.send(WSEvent.SET_READY, { isReady, playerId: globalPlayerId, roomId: globalRoom?.id })
  }, [])

  const startGame = useCallback(() => {
    wsClient?.send(WSEvent.START_GAME, { playerId: globalPlayerId, roomId: globalRoom?.id })
  }, [])

  const sendChat = useCallback((message: string) => {
    wsClient?.send(WSEvent.SEND_CHAT, { message, playerId: globalPlayerId, roomId: globalRoom?.id })
  }, [])

  const castVote = useCallback((targetId: string) => {
    wsClient?.send(WSEvent.CAST_VOTE, { targetId, playerId: globalPlayerId, roomId: globalRoom?.id })
  }, [])

  const passVote = useCallback(() => {
    wsClient?.send(WSEvent.CAST_VOTE, { pass: true, playerId: globalPlayerId, roomId: globalRoom?.id })
  }, [])

  const turnDone = useCallback(() => {
    wsClient?.send(WSEvent.TURN_DONE, { playerId: globalPlayerId, roomId: globalRoom?.id })
  }, [])

  const mrWhiteGuess = useCallback((word: string) => {
    wsClient?.send(WSEvent.MRWHITE_GUESS, { word, playerId: globalPlayerId, roomId: globalRoom?.id })
  }, [])

  const leaveRoom = useCallback(() => {
    wsClient?.send(WSEvent.LEAVE_ROOM, { playerId: globalPlayerId, roomId: globalRoom?.id })
    updateGlobalState({ room: null, playerId: null })
    localStorage.removeItem('party_roomId')
    localStorage.removeItem('party_playerId')
  }, [])

  const clearSession = useCallback(() => {
    updateGlobalState({ room: null, playerId: null })
    localStorage.removeItem('party_roomId')
    localStorage.removeItem('party_playerId')
  }, [])

  const submitDescription = useCallback((description: string) => {
    wsClient?.send(WSEvent.SUBMIT_DESCRIPTION, { description, playerId: globalPlayerId, roomId: globalRoom?.id })
  }, [])

  const refreshPublicRooms = useCallback(() => {
    wsClient?.send(WSEvent.LIST_PUBLIC_ROOMS, {})
  }, [])

  const updateSettings = useCallback((settings: any) => {
    if (globalRoom) {
      const updatedSettings = { ...globalRoom.settings, ...settings };
      updateGlobalState({
        room: {
          ...globalRoom,
          settings: updatedSettings,
        },
      });
      wsClient?.send(WSEvent.UPDATE_SETTINGS, { 
        settings: updatedSettings,
        playerId: globalPlayerId,
        roomId: globalRoom.id 
      });
    }
  }, [])

  return {
    room,
    playerId,
    isConnected,
    error,
    messages,
    createRoom,
    joinRoom,
    setReady,
    startGame,
    sendChat,
    castVote,
    passVote,
    turnDone,
    mrWhiteGuess,
    leaveRoom,
    clearSession,
    submitDescription,
    updateSettings,
    refreshPublicRooms,
    isInitialLoading,
    publicRooms,
  }
}
