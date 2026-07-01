import { MOODS, MOOD_LABEL } from '@/features/mood/types';
import { MOOD_COLORS } from '@/theme/colors';

describe('mood tokens', () => {
  it('defines exactly six moods', () => {
    expect(MOODS).toHaveLength(6);
    expect(new Set(MOODS).size).toBe(6);
  });

  it('has a color set and label for every mood', () => {
    for (const mood of MOODS) {
      expect(MOOD_COLORS[mood]).toBeDefined();
      expect(MOOD_COLORS[mood].base).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(MOOD_LABEL[mood]).toBeTruthy();
    }
  });
});
