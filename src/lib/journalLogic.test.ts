import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateStreaks,
  calculateMoodDistribution,
  calculateWeekdayMood,
  calculateTagCorrelations,
  validateBackupData,
  getTodayDateString,
  addDays,
} from './journalLogic';
import { Entry, Tag } from '../types/journal';

test('calculateStreaks handles empty entries', () => {
  const result = calculateStreaks([]);
  assert.equal(result.currentStreak, 0);
  assert.equal(result.longestStreak, 0);
  assert.equal(result.totalEntries, 0);
  assert.equal(result.lastEntryDate, null);
});

test('calculateStreaks calculates consecutive daily streaks', () => {
  const today = '2026-10-26';
  const yesterday = '2026-10-25';
  const twoDaysAgo = '2026-10-24';
  const fiveDaysAgo = '2026-10-21';
  const sixDaysAgo = '2026-10-20';

  const mockEntries: Entry[] = [
    { id: '1', date: today, title: 'Today', body: 'Body 1', mood: 5, tagIds: [], createdAt: '', updatedAt: '' },
    { id: '2', date: yesterday, title: 'Yesterday', body: 'Body 2', mood: 4, tagIds: [], createdAt: '', updatedAt: '' },
    { id: '3', date: twoDaysAgo, title: 'Two days ago', body: 'Body 3', mood: 3, tagIds: [], createdAt: '', updatedAt: '' },
    { id: '4', date: fiveDaysAgo, title: 'Older', body: 'Body 4', mood: 2, tagIds: [], createdAt: '', updatedAt: '' },
    { id: '5', date: sixDaysAgo, title: 'Older 2', body: 'Body 5', mood: 1, tagIds: [], createdAt: '', updatedAt: '' },
  ];

  const result = calculateStreaks(mockEntries, today);
  assert.equal(result.currentStreak, 3);
  assert.equal(result.longestStreak, 3);
  assert.equal(result.totalEntries, 5);
  assert.equal(result.lastEntryDate, today);
});

test('calculateStreaks continues streak if entry was yesterday but not yet today', () => {
  const today = '2026-10-26';
  const yesterday = '2026-10-25';
  const twoDaysAgo = '2026-10-24';

  const mockEntries: Entry[] = [
    { id: '2', date: yesterday, title: 'Yesterday', body: 'Body 2', mood: 4, tagIds: [], createdAt: '', updatedAt: '' },
    { id: '3', date: twoDaysAgo, title: 'Two days ago', body: 'Body 3', mood: 3, tagIds: [], createdAt: '', updatedAt: '' },
  ];

  const result = calculateStreaks(mockEntries, today);
  assert.equal(result.currentStreak, 2);
  assert.equal(result.longestStreak, 2);
});

test('calculateMoodDistribution accurately counts percentages', () => {
  const mockEntries: Entry[] = [
    { id: '1', date: '2026-10-01', title: '', body: '', mood: 5, tagIds: [], createdAt: '', updatedAt: '' },
    { id: '2', date: '2026-10-02', title: '', body: '', mood: 5, tagIds: [], createdAt: '', updatedAt: '' },
    { id: '3', date: '2026-10-03', title: '', body: '', mood: 4, tagIds: [], createdAt: '', updatedAt: '' },
    { id: '4', date: '2026-10-04', title: '', body: '', mood: 1, tagIds: [], createdAt: '', updatedAt: '' },
  ];

  const distribution = calculateMoodDistribution(mockEntries);
  const mood5 = distribution.find((d) => d.mood === 5);
  const mood4 = distribution.find((d) => d.mood === 4);
  const mood1 = distribution.find((d) => d.mood === 1);

  assert.equal(mood5?.count, 2);
  assert.equal(mood5?.percentage, 50);
  assert.equal(mood4?.count, 1);
  assert.equal(mood4?.percentage, 25);
  assert.equal(mood1?.count, 1);
  assert.equal(mood1?.percentage, 25);
});

test('calculateTagCorrelations calculates tag frequency and average mood', () => {
  const mockTags: Tag[] = [
    { id: 'work', name: 'Work', color: '#3b82f6' },
    { id: 'exercise', name: 'Exercise', color: '#10b981' },
  ];

  const mockEntries: Entry[] = [
    { id: '1', date: '2026-10-01', title: '', body: '', mood: 5, tagIds: ['exercise'], createdAt: '', updatedAt: '' },
    { id: '2', date: '2026-10-02', title: '', body: '', mood: 4, tagIds: ['exercise', 'work'], createdAt: '', updatedAt: '' },
    { id: '3', date: '2026-10-03', title: '', body: '', mood: 2, tagIds: ['work'], createdAt: '', updatedAt: '' },
  ];

  const correlations = calculateTagCorrelations(mockEntries, mockTags);
  const exercise = correlations.find((c) => c.tagId === 'exercise');
  const work = correlations.find((c) => c.tagId === 'work');

  assert.equal(exercise?.count, 2);
  assert.equal(exercise?.averageMood, 4.5);
  assert.equal(work?.count, 2);
  assert.equal(work?.averageMood, 3.0);
});

test('validateBackupData accepts valid format and rejects invalid', () => {
  const valid = {
    version: 1,
    exportedAt: '2026-10-26T00:00:00.000Z',
    entries: [
      { id: 'e1', date: '2026-10-26', title: 'Hello', body: 'World', mood: 5, tagIds: [], createdAt: '', updatedAt: '' },
    ],
  };
  const validRes = validateBackupData(valid);
  assert.equal(validRes.isValid, true);
  assert.equal(validRes.entries?.length, 1);

  const invalid = { foo: 'bar' };
  const invalidRes = validateBackupData(invalid);
  assert.equal(invalidRes.isValid, false);
});
