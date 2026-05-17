'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, PenTool } from 'lucide-react';
import { THEMES, ThemeId, Skill } from '@/types';

interface LogModalProps {
  skill: Skill;
  themeId: ThemeId;
  onClose: () => void;
  onSubmit: (title: string, reflection: string) => void;
}

export function LogModal({ skill, themeId, onClose, onSubmit }: LogModalProps) {
  const theme = THEMES[themeId];
  const [title, setTitle] = useState('');
  const [reflection, setReflection] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && reflection.trim()) {
      onSubmit(title.trim(), reflection.trim());
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`relative w-full max-w-lg ${theme.colorScheme.glass} ${theme.colorScheme.text} p-6 md:p-8 rounded-3xl shadow-2xl border`}
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-2xl font-medium mb-1">บันทึกความก้าวหน้า</h2>
          <p className="text-sm opacity-70 mb-6 font-light">ทักษะ: {skill.name}</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-light mb-2 opacity-90">
                ชื่อกิจกรรม (Task Title <span className="opacity-50 text-xs">ทำซ้ำได้ EXP น้อยลง 20%</span>)
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น อ่านหนังสือบทที่ 1, เขียนโค้ด React..."
                className="w-full bg-black/20 border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all placeholder:text-white/30"
                style={{ '--tw-ring-color': theme.colorScheme.primary } as React.CSSProperties}
              />
            </div>

            <div>
              <label className="block text-sm font-light mb-2 opacity-90">
                สรุปบทเรียน (Reflection / Proof of Work) *บังคับ
              </label>
              <textarea
                required
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="วันนี้ได้เรียนรู้อะไรบ้าง? มีความรู้สึกอย่างไร หรือพบอุปสรรคใด?"
                rows={4}
                className="w-full bg-black/20 border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all placeholder:text-white/30 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={!title.trim() || !reflection.trim()}
              className="w-full py-4 rounded-xl font-medium tracking-wide flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style={{ backgroundColor: theme.colorScheme.primary, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
            >
              <PenTool className="w-4 h-4 group-hover:scale-110 transition-transform" />
              บันทึก & รับ EXP
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
