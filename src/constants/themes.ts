import { ThemeId } from '../types/journal';

export interface Theme {
  id: ThemeId;
  name: string;
  isPremium: boolean;
  dark: boolean;
  bg: string;
  card: string;
  border: string;
  text: string;
  textMuted: string;
  textFaint: string;
  accent: string;
  onAccent: string;
  accentSoft: string;
  subtle: string; // quiet fills: inputs, segmented controls, empty bars
  danger: string;
  success: string;
}

export const THEMES: Record<ThemeId, Theme> = {
  light: {
    id: 'light',
    name: 'Serene Day',
    isPremium: false,
    dark: false,
    bg: '#faf7f2',
    card: '#ffffff',
    border: '#ebe5dc',
    text: '#1c1917',
    textMuted: '#6b635b',
    textFaint: '#a39a90',
    accent: '#a5541b',
    onAccent: '#ffffff',
    accentSoft: '#f6e9dc',
    subtle: '#f3eee7',
    danger: '#c2410c',
    success: '#3f7d4e',
  },
  dark: {
    id: 'dark',
    name: 'Quiet Night',
    isPremium: false,
    dark: true,
    bg: '#121214',
    card: '#1c1c20',
    border: '#2a2a30',
    text: '#f4f4f5',
    textMuted: '#a1a1aa',
    textFaint: '#6b6b74',
    accent: '#e0a458',
    onAccent: '#1c1408',
    accentSoft: '#2e261b',
    subtle: '#242429',
    danger: '#f87171',
    success: '#6fbf85',
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Velvet',
    isPremium: true,
    dark: true,
    bg: '#0b1020',
    card: '#131a2e',
    border: '#212a44',
    text: '#eef1fa',
    textMuted: '#9aa4c2',
    textFaint: '#5f6987',
    accent: '#8b9cf7',
    onAccent: '#0b1020',
    accentSoft: '#1d2546',
    subtle: '#1a2239',
    danger: '#f58b8b',
    success: '#7cc79a',
  },
  forest: {
    id: 'forest',
    name: 'Pine & Moss',
    isPremium: true,
    dark: true,
    bg: '#0d1511',
    card: '#15211b',
    border: '#22342a',
    text: '#ecf5ef',
    textMuted: '#97b3a2',
    textFaint: '#5f7a6a',
    accent: '#6cc28d',
    onAccent: '#0b1a12',
    accentSoft: '#1b3326',
    subtle: '#1b2a22',
    danger: '#f28b82',
    success: '#6cc28d',
  },
  sunset: {
    id: 'sunset',
    name: 'Warm Terracotta',
    isPremium: true,
    dark: true,
    bg: '#18110f',
    card: '#231916',
    border: '#3a2a24',
    text: '#fbeee6',
    textMuted: '#c9a596',
    textFaint: '#8a6c60',
    accent: '#ec8a5a',
    onAccent: '#1e0f08',
    accentSoft: '#3b2219',
    subtle: '#2c201c',
    danger: '#ff8a80',
    success: '#8fca8f',
  },
  paper: {
    id: 'paper',
    name: 'Vintage Parchment',
    isPremium: true,
    dark: false,
    bg: '#f3ecdf',
    card: '#fbf7ee',
    border: '#e0d5c1',
    text: '#2a2118',
    textMuted: '#6e6152',
    textFaint: '#a3937e',
    accent: '#4a3b2a',
    onAccent: '#fbf7ee',
    accentSoft: '#e8dcc6',
    subtle: '#ede4d3',
    danger: '#b4441c',
    success: '#4d7a4a',
  },
};

export const FONTS = {
  serif: 'Lora_400Regular',
  serifItalic: 'Lora_400Regular_Italic',
  serifMedium: 'Lora_500Medium',
  serifSemiBold: 'Lora_600SemiBold',
  sans: 'PlusJakartaSans_400Regular',
  sansMedium: 'PlusJakartaSans_500Medium',
  sansSemiBold: 'PlusJakartaSans_600SemiBold',
  sansBold: 'PlusJakartaSans_700Bold',
} as const;
