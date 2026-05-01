import { RoleType, WordPair } from '../state/types.js';

export function assignRoles(playerIds: string[], wordPair: WordPair): Map<string, { role: RoleType, word: string }> {
  const playerCount = playerIds.length;
  let undercoverCount = 1;
  let mrWhiteCount = 0;

  if (playerCount >= 5 && playerCount <= 6) {
    mrWhiteCount = 1;
  } else if (playerCount >= 7) {
    undercoverCount = 2;
    mrWhiteCount = 1;
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
