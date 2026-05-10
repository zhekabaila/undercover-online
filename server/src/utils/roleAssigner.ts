import { RoleType, WordPair } from '../state/types.js';

export function assignRoles(playerIds: string[], wordPair: WordPair, settings?: { undercoverCount?: number, mrWhiteCount?: number }): Map<string, { role: RoleType, word: string }> {
  const playerCount = playerIds.length;
  let undercoverCount = 1;
  let mrWhiteCount = 0;

  if (settings) {
    if (typeof settings.undercoverCount === 'number') {
      undercoverCount = settings.undercoverCount;
    } else {
      // Default undercover count based on player count
      if (playerCount >= 7) undercoverCount = 2;
      else undercoverCount = 1;
    }

    if (typeof settings.mrWhiteCount === 'number') {
      mrWhiteCount = settings.mrWhiteCount;
    } else {
      // Default mrwhite count based on player count
      if (playerCount >= 5) mrWhiteCount = 1;
      else mrWhiteCount = 0;
    }

    // Validation: Civilan must be > (Undercover + Mr. White)
    const totalInfiltrators = undercoverCount + mrWhiteCount;
    const civilianCount = playerCount - totalInfiltrators;

    if (civilianCount <= totalInfiltrators) {
      // Fallback to safe defaults if user settings are invalid for current player count
      if (playerCount >= 7) {
        undercoverCount = 2;
        mrWhiteCount = 1;
      } else if (playerCount >= 5) {
        undercoverCount = 1;
        mrWhiteCount = 1;
      } else {
        undercoverCount = 1;
        mrWhiteCount = 0;
      }
    }
  } else {
    // Original default logic
    if (playerCount >= 5 && playerCount <= 6) {
      mrWhiteCount = 1;
    } else if (playerCount >= 7) {
      undercoverCount = 2;
      mrWhiteCount = 1;
    }
  }

  const roles: RoleType[] = [];
  for (let i = 0; i < undercoverCount; i++) roles.push('undercover');
  for (let i = 0; i < mrWhiteCount; i++) roles.push('mrwhite');
  const civilianCount = playerCount - undercoverCount - mrWhiteCount;
  for (let i = 0; i < civilianCount; i++) roles.push('civilian');

  // Shuffle roles
  for (let i = roles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [roles[i], roles[j]] = [roles[j], roles[i]];
  }

  const assignments = new Map<string, { role: RoleType, word: string }>();
  playerIds.forEach((playerId, index) => {
    const role = roles[index];
    let word = '';
    if (role === 'civilian') {
      word = wordPair.civilian;
    } else if (role === 'undercover') {
      word = wordPair.undercover;
    }
    // mrwhite has empty word
    assignments.set(playerId, { role, word });
  });

  return assignments;
}
