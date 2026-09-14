import type { AsciiStarsSettings } from './ascii-stars-scene'

type Constellation = Pick<
  AsciiStarsSettings,
  | 'theme'
  | 'rotationX'
  | 'rotationY'
  | 'rotationZ'
  | 'scale'
  | 'backgroundColor'
  | 'foregroundColor'
>

export const serviceConstellations: Record<string, Constellation> = {
  web: {
    theme: 'light',
    backgroundColor: '#f4f3ee',
    foregroundColor: '#22231f',
    rotationX: 0.25,
    rotationY: -0.25,
    rotationZ: -0.3,
    scale: 1.2,
  },
  'bots-crm': {
    theme: 'light',
    backgroundColor: '#ceb4f5',
    foregroundColor: '#332343',
    rotationX: 0.65,
    rotationY: -0.35,
    rotationZ: 0.55,
    scale: 1.18,
  },
  ai: {
    theme: 'dark',
    backgroundColor: '#22231f',
    foregroundColor: '#ceb4f5',
    rotationX: -0.4,
    rotationY: 0.8,
    rotationZ: -0.9,
    scale: 1.18,
  },
  'video-content': {
    theme: 'light',
    backgroundColor: '#e8e7e3',
    foregroundColor: '#70518c',
    rotationX: 0.8,
    rotationY: 0.4,
    rotationZ: 1.1,
    scale: 1.18,
  },
}
