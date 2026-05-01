import { describe, test, expect } from '@jest/globals';
import { getRandomWordPair, getWordPairById, wordPairs } from '../utils/wordPairs.js';

describe('Word Pairs Utility', () => {
  test('getRandomWordPair should return a valid word pair', () => {
    const pair = getRandomWordPair();
    expect(pair).toBeDefined();
    expect(pair.civilian).toBeDefined();
    expect(pair.undercover).toBeDefined();
    expect(wordPairs).toContain(pair);
  });

  test('getWordPairById should return the correct pair', () => {
    const firstPair = wordPairs[0];
    const found = getWordPairById(firstPair.id);
    expect(found).toEqual(firstPair);
  });

  test('getWordPairById should return undefined for non-existent id', () => {
    const found = getWordPairById('non-existent');
    expect(found).toBeUndefined();
  });

  test('all word pairs should have distinct civilian and undercover words', () => {
    wordPairs.forEach(pair => {
      expect(pair.civilian.toLowerCase()).not.toBe(pair.undercover.toLowerCase());
    });
  });
});
