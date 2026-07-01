import '@/global.css';

export * from './colors';

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 12,
  md: 20,
  lg: 28,
  xl: 40,
  pill: 999,
} as const;

export const Typography = {
  title: { fontSize: 30, fontWeight: '700' as const, letterSpacing: -0.5 },
  heading: { fontSize: 22, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
  label: { fontSize: 12, fontWeight: '600' as const, letterSpacing: 0.4 },
} as const;
