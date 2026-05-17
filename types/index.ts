export type ThemeId = 'golden-valley' | 'misty-canyon' | 'starry-plateau';

export interface Theme {
  id: ThemeId;
  name: string;
  image: string;
  colorScheme: {
    primary: string;
    text: string;
    glass: string;
    shadow: string;
  };
}

export const THEMES: Record<ThemeId, Theme> = {
  'golden-valley': {
    id: 'golden-valley',
    name: 'Golden Valley (หุบเขาสีทอง)',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1920&auto=format&fit=crop',
    colorScheme: { // Warm sunset tones
      primary: 'rgba(234, 179, 8)', // yellow-500
      text: 'text-amber-50',
      glass: 'bg-amber-900/40 border-amber-500/20',
      shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]',
    }
  },
  'misty-canyon': {
    id: 'misty-canyon',
    name: 'Misty Canyon (หุบผาในสายหมอก)',
    image: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=1920&auto=format&fit=crop',
    colorScheme: { // Cool blue/grey tones
      primary: 'rgba(96, 165, 250)', // blue-400
      text: 'text-slate-50',
      glass: 'bg-slate-900/40 border-slate-400/20',
      shadow: 'shadow-[0_0_15px_rgba(56,189,248,0.3)]',
    }
  },
  'starry-plateau': {
    id: 'starry-plateau',
    name: 'Starry Plateau (ที่ราบแสงดาว)',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1920&auto=format&fit=crop',
    colorScheme: { // Deep galaxy tones
      primary: 'rgba(167, 139, 250)', // violet-400
      text: 'text-purple-50',
      glass: 'bg-indigo-950/50 border-purple-500/20',
      shadow: 'shadow-[0_0_15px_rgba(139,92,246,0.3)]',
    }
  }
};

export interface SkillLog {
  id: string;
  skillId: string;
  taskTitle: string;
  reflection: string; // สรุปบทเรียน
  expGained: number;
  date: number; // timestamp
}

export interface Skill {
  id: string;
  name: string; // e.g. "ภาษาอังกฤษ", "ปรัชญา", "การทำงาน"
  level: number;
  currentExp: number;
  lastActive: number; // timestamp for decay
}
