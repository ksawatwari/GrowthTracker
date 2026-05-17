'use client';

import { THEMES, ThemeId } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Sun, Cloud, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface BackgroundManagerProps {
  currentThemeId: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
  children: React.ReactNode;
}

export function BackgroundManager({ currentThemeId, onThemeChange, children }: BackgroundManagerProps) {
  const currentTheme = THEMES[currentThemeId];

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Images with AnimatePresence for smooth transitions */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentThemeId}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="fixed inset-0 z-0 pointer-events-none"
        >
          <Image
            src={currentTheme.image}
            alt={currentTheme.name}
            fill
            className="object-cover"
            priority
            referrerPolicy="no-referrer"
          />
          {/* Nostalgic Film Grain / Vignette overlay */}
          <div className="absolute inset-0 bg-black/30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-black/60 mix-blend-multiply" />
          <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
        </motion.div>
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header / Theme Switcher */}
        <header className="w-full max-w-7xl mx-auto p-6 md:p-8 flex justify-between items-center">
          <h1 className={`text-2xl md:text-3xl font-light tracking-wider drop-shadow-md ${currentTheme.colorScheme.text}`}>
            Nostalgic Growth
          </h1>
          <div className="flex gap-2">
            {(Object.keys(THEMES) as ThemeId[]).map((id) => {
              const theme = THEMES[id];
              const getIcon = (id: string) => {
                if (id === 'golden-valley') return <Sun className="w-4 h-4" />;
                if (id === 'misty-canyon') return <Cloud className="w-4 h-4" />;
                return <Moon className="w-4 h-4" />;
              };
              
              return (
                <button
                  key={id}
                  onClick={() => onThemeChange(id)}
                  className={`p-3 rounded-full transition-all duration-300 backdrop-blur-md border ${
                    currentThemeId === id 
                    ? 'bg-white/20 border-white/40 shadow-lg scale-110' 
                    : 'bg-black/20 border-white/10 hover:bg-white/10'
                  }`}
                  title={theme.name}
                  aria-label={theme.name}
                >
                  <div className={currentTheme.colorScheme.text}>
                    {getIcon(id)}
                  </div>
                </button>
              );
            })}
          </div>
        </header>

        <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
