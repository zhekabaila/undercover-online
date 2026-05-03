import * as roomStore from '../state/roomStore.js'
import { Player, RoleType, Room } from '../state/types.js'
import { WSEvent, ErrorCode } from '../ws/events.js'
import { broadcast, playerSockets, sendToPlayer } from './roomManager.js'
import { assignRoles } from '../utils/roleAssigner.js'
import { getRandomWordPair } from '../utils/wordPairs.js'
import { startTimer, clearTimer } from './timerManager.js'

export function handleStartGame(playerId: string) {
  const rooms = roomStore.getAllRooms()
  for (const [roomId, room] of rooms.entries()) {
    if (room.players.has(playerId)) {
      const player = room.players.get(playerId)!
      if (!player.isHost) {
        sendToPlayer(playerSockets.get(playerId)!, WSEvent.ERROR, {
          code: ErrorCode.NOT_HOST,
          message: 'Only host can start game',
        })
        return
      }

      const players = Array.from(room.players.values())
      if (players.length < 3) {
        sendToPlayer(playerSockets.get(playerId)!, WSEvent.ERROR, {
          code: ErrorCode.NOT_ENOUGH_PLAYERS,
          message: 'Need at least 3 players',
        })
        return
      }

      if (players.some((p) => !p.isReady)) {
        sendToPlayer(playerSockets.get(playerId)!, WSEvent.ERROR, {
          code: ErrorCode.PLAYER_NOT_READY,
          message: 'Not all players are ready',
        })
        return
      }

      startGameFlow(room)
      break
    }
  }
}

function startGameFlow(room: Room | any) {
  const wordPair = getRandomWordPair()
  const playerIds = Array.from(room.players.keys()) as string[]
  const assignments = assignRoles(playerIds, wordPair)

  // Assign roles and words
  assignments.forEach((assign, pId) => {
    const p = room.players.get(pId)!
    p.role = assign.role
    p.word = assign.word
    p.isAlive = true
    p.hasSpokenThisRound = false

    const ws = playerSockets.get(pId)
    if (ws) {
      sendToPlayer(ws, WSEvent.ROLE_ASSIGNED, { role: p.role, word: p.word })
    }
  })

  // Shuffle turn order (keep for potential future use)
  const shuffledIds = [...playerIds].sort(() => Math.random() - 0.5)

  room.game = {
    phase: 'starting',
    roundNumber: 1,
    turnOrder: {
      playerIds: shuffledIds,
      currentIndex: 0,
    },
    votes: {},
    passes: {},
  }

  broadcast(room.id, WSEvent.GAME_STARTING, { countdown: 3 })

  startTimer(room.id, 3000, () => {
    // Skip speaking phase, go directly to discussion
    startDiscussionPhase(room)
  })
}

function startSpeakingPhase(room: Room | any) {
  // This phase is now skipped - kept for backward compatibility
  if (!room.game) return
  startDiscussionPhase(room)
}

export function handleTurnDone(playerId: string) {
  const rooms = roomStore.getAllRooms()
  for (const [roomId, room] of rooms.entries()) {
    if (
      room.players.has(playerId) &&
      room.game &&
      room.game.phase === 'speaking'
    ) {
      const currentPlayerId =
        room.game.turnOrder.playerIds[room.game.turnOrder.currentIndex]
      if (currentPlayerId !== playerId) return // Not their turn

      clearTimer(room.id)
      room.game.turnOrder.currentIndex++

      // Check if more players need to speak
      const playerIds = room.game.turnOrder.playerIds
      let foundNext = false
      for (
        let i = room.game.turnOrder.currentIndex;
        i < playerIds.length;
        i++
      ) {
        if (room.players.get(playerIds[i])!.isAlive) {
          foundNext = true
          break
        }
      }

      if (foundNext) {
        startSpeakingPhase(room)
      } else {
        startDiscussionPhase(room)
      }
      break
    }
  }
}

function startDiscussionPhase(room: Room | any) {
  if (!room.game) return
  room.game.phase = 'discussion'
  const duration = room.settings.discussionDurationSeconds || 120

  broadcast(room.id, WSEvent.DISCUSSION_STARTED, { durationSeconds: duration })

  startTimer(room.id, duration * 1000, () => {
    startVotingPhase(room)
  })
}

function startVotingPhase(room: Room | any) {
  if (!room.game) return
  room.game.phase = 'voting'
  room.game.votes = {}
  room.game.passes = {}

  broadcast(room.id, WSEvent.VOTE_STARTED, {})

  // Voting timeout after 60s if not everyone voted/passed
  startTimer(room.id, 60000, () => {
    processVotes(room)
  })
}

export function handleCastVote(
  voterId: string,
  payload: { targetId?: string; pass?: boolean },
) {
  const rooms = roomStore.getAllRooms()
  for (const [roomId, room] of rooms.entries()) {
    if (
      room.players.has(voterId) &&
      room.game &&
      room.game.phase === 'voting'
    ) {
      const voter = room.players.get(voterId)!
      if (!voter.isAlive) return

      // Handle pass or vote
      if (payload.pass) {
        room.game.passes[voterId] = true
        broadcast(room.id, WSEvent.VOTE_CAST, { voterId, pass: true })

        // Broadcast chat message for pass
        broadcast(room.id, WSEvent.CHAT_MESSAGE, {
          playerId: 'SYSTEM',
          playerName: 'SYSTEM',
          message: `${voter.name} has passed (no elimination)`,
          type: 'pass',
          targetPlayerId: null,
        })
      } else if (payload.targetId) {
        room.game.votes[voterId] = payload.targetId
        const targetPlayer = room.players.get(payload.targetId)!
        broadcast(room.id, WSEvent.VOTE_CAST, {
          voterId,
          targetId: payload.targetId,
        })

        // Broadcast chat message for vote
        broadcast(room.id, WSEvent.CHAT_MESSAGE, {
          playerId: 'SYSTEM',
          playerName: 'SYSTEM',
          message: `${voter.name} voted for ${targetPlayer.name}`,
          type: 'vote',
          voterId: voterId,
          targetPlayerId: payload.targetId,
        })
      }

      const alivePlayers = Array.from(room.players.values()).filter(
        (p) => p.isAlive,
      )
      const totalActions =
        Object.keys(room.game.votes).length +
        Object.keys(room.game.passes).length

      if (totalActions >= alivePlayers.length) {
        clearTimer(room.id)
        processVotes(room)
      }
      break
    }
  }
}

function processVotes(room: Room | any) {
  if (!room.game) return

  const alivePlayers = Array.from(room.players.values()).filter(
    (p: any) => p.isAlive,
  )
  const passCount = Object.keys(room.game.passes).length
  const voteCount = Object.keys(room.game.votes).length

  // If majority passed, no elimination, go to next round
  if (passCount > voteCount) {
    broadcast(room.id, WSEvent.VOTE_RESULT, {
      eliminatedId: null,
      role: null,
      passed: true,
      isDraw: false,
    })
    nextRound(room)
    return
  }

  // Count votes if there are any
  const voteCounts: Record<string, number> = {}
  Object.values(room.game.votes as Record<string, string>).forEach(
    (targetId) => {
      voteCounts[targetId] = (voteCounts[targetId] || 0) + 1
    },
  )

  let maxVotes = 0
  let eliminatedIds: string[] = []

  Object.entries(voteCounts).forEach(([id, count]) => {
    if (count > maxVotes) {
      maxVotes = count
      eliminatedIds = [id]
    } else if (count === maxVotes) {
      eliminatedIds.push(id)
    }
  })

  // If no one was voted (all passed or not enough votes), go to next round
  if (!maxVotes || eliminatedIds.length === 0) {
    broadcast(room.id, WSEvent.VOTE_RESULT, {
      eliminatedId: null,
      role: null,
      passed: true,
      isDraw: false,
    })
    nextRound(room)
    return
  }

  // Check for draw (multiple players with same max votes)
  if (eliminatedIds.length > 1) {
    broadcast(room.id, WSEvent.VOTE_RESULT, {
      eliminatedId: null,
      role: null,
      isDraw: true,
      drawnPlayerIds: eliminatedIds,
    })
    nextRound(room)
    return
  }

  // Someone was eliminated
  const eliminatedId = eliminatedIds[0]
  const eliminatedPlayer = room.players.get(eliminatedId)!
  eliminatedPlayer.isAlive = false
  broadcast(room.id, WSEvent.VOTE_RESULT, {
    eliminatedId,
    role: eliminatedPlayer.role,
    isDraw: false,
  })

  if (eliminatedPlayer.role === 'mrwhite') {
    room.game.phase = 'mrwhite_guessing'
    room.game.eliminatedPlayerId = eliminatedId
    // 30 seconds for Mr White to guess
    const endsAt = Date.now() + 30000
    room.game.turnEndTime = endsAt
    broadcast(room.id, WSEvent.ROOM_UPDATED, {
      room: { ...room, players: Array.from(room.players.values()) },
    })

    startTimer(room.id, 30000, () => {
      checkWinConditions(room)
    })
  } else {
    checkWinConditions(room)
  }
}

function checkWinConditions(room: Room | any) {
  if (!room.game) return

  const players = Array.from(room.players.values()) as Player[]
  const alivePlayers = players.filter((p) => p.isAlive)
  const aliveCivilians = alivePlayers.filter((p) => p.role === 'civilian')
  const aliveUndercovers = alivePlayers.filter((p) => p.role === 'undercover')
  const aliveMrWhites = alivePlayers.filter((p) => p.role === 'mrwhite')

  if (aliveUndercovers.length === 0 && aliveMrWhites.length === 0) {
    endGame(room, 'civilian')
  } else if (
    aliveUndercovers.length >= aliveCivilians.length &&
    aliveCivilians.length <= 1
  ) {
    endGame(room, 'undercover')
  } else {
    nextRound(room)
  }
}

function nextRound(room: Room | any) {
  if (!room.game) return
  room.game.roundNumber++
  room.game.turnOrder.currentIndex = 0
  // Re-shuffle turn order for next round? Or keep same? Instructions say random at start.
  startSpeakingPhase(room)
}

function endGame(room: Room | any, winnerRole: RoleType | 'civilian') {
  if (!room.game) return
  room.game.phase = 'ended'
  room.game.winnerRole = winnerRole

  broadcast(room.id, WSEvent.GAME_ENDED, {
    winnerRole,
    players: Array.from(room.players.values()),
  })

  // Reset for lobby after 10s
  startTimer(room.id, 10000, () => {
    room.game = null
    room.players.forEach((p: any) => {
      p.isReady = p.isHost // host remains ready
      p.role = undefined
      p.word = undefined
      p.isAlive = true
    })
    broadcast(room.id, WSEvent.ROOM_UPDATED, {
      room: { ...room, players: Array.from(room.players.values()) },
    })
  })
}

export function handleChat(playerId: string, payload: { message: string }) {
  const rooms = roomStore.getAllRooms()
  for (const [roomId, room] of rooms.entries()) {
    if (room.players.has(playerId)) {
      const player = room.players.get(playerId)!

      // Validation: speaking phase chat restriction
      if (room.game && room.game.phase === 'speaking') {
        const game = room.game
        const currentPlayerId =
          game.turnOrder.playerIds[game.turnOrder.currentIndex]
        if (currentPlayerId !== playerId) return
      }

      broadcast(roomId, WSEvent.CHAT_MESSAGE, {
        playerId,
        name: player.name,
        message: payload.message.substring(0, 300),
        timestamp: Date.now(),
      })
      break
    }
  }
}

export function handleMrWhiteGuess(
  playerId: string,
  payload: { word: string },
) {
  const rooms = roomStore.getAllRooms()
  for (const [roomId, room] of rooms.entries()) {
    if (
      room.players.has(playerId) &&
      room.game &&
      room.game.phase === 'mrwhite_guessing'
    ) {
      if (room.game.eliminatedPlayerId !== playerId) return

      clearTimer(room.id)
      const player = room.players.get(playerId)!
      const wordPair = Array.from(room.players.values()).find(
        (p) => p.role === 'civilian',
      )?.word

      if (payload.word.toLowerCase() === wordPair?.toLowerCase()) {
        endGame(room, 'mrwhite') // Mr White wins
      } else {
        checkWinConditions(room)
      }
      break
    }
  }
}
