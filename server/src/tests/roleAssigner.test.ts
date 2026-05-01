import { describe, test, expect } from '@jest/globals';
import { assignRoles } from '../utils/roleAssigner.js';
import { WordPair } from '../state/types.js';

describe('Role Assigner', () => {
  const mockWordPair: WordPair = {
    id: 'test',
    civilian: 'Apple',
    undercover: 'Pear'
  };

  test('should assign roles correctly for 3 players (1 Undercover, 0 Mr White, 2 Civilian)', () => {
    const playerIds = ['p1', 'p2', 'p3'];
    const assignments = assignRoles(playerIds, mockWordPair);

    expect(assignments.size).toBe(3);
    
    const values = Array.from(assignments.values());
    const undercovers = values.filter(a => a.role === 'undercover');
    const mrWhites = values.filter(a => a.role === 'mrwhite');
    const civilians = values.filter(a => a.role === 'civilian');

    expect(undercovers.length).toBe(1);
    expect(mrWhites.length).toBe(0);
    expect(civilians.length).toBe(2);

    // Check words
    undercovers.forEach(a => expect(a.word).toBe('Pear'));
    civilians.forEach(a => expect(a.word).toBe('Apple'));
  });

  test('should assign roles correctly for 5 players (1 Undercover, 1 Mr White, 3 Civilian)', () => {
    const playerIds = ['p1', 'p2', 'p3', 'p4', 'p5'];
    const assignments = assignRoles(playerIds, mockWordPair);

    const values = Array.from(assignments.values());
    expect(values.filter(a => a.role === 'undercover').length).toBe(1);
    expect(values.filter(a => a.role === 'mrwhite').length).toBe(1);
    expect(values.filter(a => a.role === 'civilian').length).toBe(3);
    
    // Mr White should have empty word
    const mrWhite = values.find(a => a.role === 'mrwhite');
    expect(mrWhite?.word).toBe('');
  });

  test('should assign roles correctly for 7 players (2 Undercover, 1 Mr White, 4 Civilian)', () => {
    const playerIds = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7'];
    const assignments = assignRoles(playerIds, mockWordPair);

    const values = Array.from(assignments.values());
    expect(values.filter(a => a.role === 'undercover').length).toBe(2);
    expect(values.filter(a => a.role === 'mrwhite').length).toBe(1);
    expect(values.filter(a => a.role === 'civilian').length).toBe(4);
  });

  test('roles should be shuffled (random distribution)', () => {
    const playerIds = ['p1', 'p2', 'p3'];
    const results = new Set();
    
    // Run multiple times to see different assignments
    for (let i = 0; i < 10; i++) {
        const assignments = assignRoles(playerIds, mockWordPair);
        results.add(JSON.stringify(Array.from(assignments.entries())));
    }
    
    // Highly likely to have more than 1 unique distribution
    expect(results.size).toBeGreaterThan(1);
  });
});
