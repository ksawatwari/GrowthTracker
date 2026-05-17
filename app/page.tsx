'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { BackgroundManager } from '@/components/BackgroundManager';
import { SpiderChart } from '@/components/SpiderChart';
import { LogModal } from '@/components/LogModal';
import { Skill, SkillLog, ThemeId, THEMES } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Swords, BookOpen, AlertCircle, Sparkles, TrendingUp, History, Pencil, Check, MoreVertical, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const calculateRequiredExp = (level: number) => Math.floor(100 * Math.pow(level, 1.5));

const INITIAL_SKILLS: Skill[] = [
  { id: '1', name: 'ภาษาอังกฤษ', level: 1, currentExp: 0, lastActive: Date.now() },
  { id: '2', name: 'ปรัชญา', level: 1, currentExp: 0, lastActive: Date.now() },
  { id: '3', name: 'การทำงาน', level: 1, currentExp: 0, lastActive: Date.now() },
];

const checkRust = (lastActive: number) => {
  const diff = Date.now() - lastActive;
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
  const FIFTEEN_DAYS = 15 * 24 * 60 * 60 * 1000;
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  
  if (diff > THIRTY_DAYS) return 3;
  if (diff > FIFTEEN_DAYS) return 2;
  if (diff > SEVEN_DAYS) return 1;
  return 0;
};

type Timeframe = 'none' | '1w' | '1m' | '3m' | '6m' | '1y';

const getPastTimestamp = (tf: Timeframe) => {
  const now = new Date();
  switch (tf) {
    case '1w': return new Date(now.setDate(now.getDate() - 7)).getTime();
    case '1m': return new Date(now.setMonth(now.getMonth() - 1)).getTime();
    case '3m': return new Date(now.setMonth(now.getMonth() - 3)).getTime();
    case '6m': return new Date(now.setMonth(now.getMonth() - 6)).getTime();
    case '1y': return new Date(now.setFullYear(now.getFullYear() - 1)).getTime();
    default: return Date.now();
  }
};

const getTotalExpForSkill = (skill: Skill) => {
  let total = 0;
  for (let l = 1; l < skill.level; l++) {
    total += calculateRequiredExp(l);
  }
  return total + skill.currentExp;
};

const calculateLevelFromTotalExp = (totalExp: number) => {
  let level = 1;
  let reqExp = calculateRequiredExp(level);
  let exp = totalExp;
  while (exp >= reqExp) {
    exp -= reqExp;
    level++;
    reqExp = calculateRequiredExp(level);
  }
  return level;
};

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [themeId, setThemeId] = useState<ThemeId>('golden-valley');
  const [skills, setSkills] = useState<Skill[]>([]);
  const [logs, setLogs] = useState<SkillLog[]>([]);
  const [activeSkillModal, setActiveSkillModal] = useState<Skill | null>(null);
  const [newSkillName, setNewSkillName] = useState('');
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [editingSkillName, setEditingSkillName] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [compareTimeframe, setCompareTimeframe] = useState<Timeframe>('none');

  useEffect(() => {
    const savedTheme = localStorage.getItem('growth_theme') as ThemeId;
    if (savedTheme && THEMES[savedTheme]) setThemeId(savedTheme);

    const savedSkills = localStorage.getItem('growth_skills');
    if (savedSkills) setSkills(JSON.parse(savedSkills));
    else setSkills(INITIAL_SKILLS);

    const savedLogs = localStorage.getItem('growth_logs');
    if (savedLogs) setLogs(JSON.parse(savedLogs));

    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('growth_theme', themeId);
      localStorage.setItem('growth_skills', JSON.stringify(skills));
      localStorage.setItem('growth_logs', JSON.stringify(logs));
    }
  }, [themeId, skills, logs, mounted]);

  const historicalSkills = useMemo(() => {
    if (compareTimeframe === 'none') return undefined;
    const pastTimestamp = getPastTimestamp(compareTimeframe);
    
    return skills.map(skill => {
      const currentTotalExp = getTotalExpForSkill(skill);
      const recentLogs = logs.filter(l => l.skillId === skill.id && l.date > pastTimestamp);
      const recentExp = recentLogs.reduce((sum, l) => sum + l.expGained, 0);
      const pastTotalExp = Math.max(0, currentTotalExp - recentExp);
      
      const pastLevel = calculateLevelFromTotalExp(pastTotalExp);
      return {
        ...skill,
        level: pastLevel
      };
    });
  }, [skills, logs, compareTimeframe]);

  if (!mounted) return null;

  const handleThemeChange = (newTheme: ThemeId) => setThemeId(newTheme);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: newSkillName.trim(),
      level: 1,
      currentExp: 0,
      lastActive: Date.now()
    };
    
    setSkills([...skills, newSkill]);
    setNewSkillName('');
    setShowAddSkill(false);
  };

  const handleLogProgress = (title: string, reflection: string) => {
    if (!activeSkillModal) return;

    const recentLogs = logs.filter(l => l.skillId === activeSkillModal.id);
    const hasRepeated = recentLogs.some(l => l.taskTitle.toLowerCase() === title.toLowerCase());
    
    const baseExp = 25;
    const earnedExp = hasRepeated ? Math.floor(baseExp * 0.8) : baseExp;

    const newLog: SkillLog = {
      id: Date.now().toString(),
      skillId: activeSkillModal.id,
      taskTitle: title,
      reflection,
      expGained: earnedExp,
      date: Date.now()
    };

    setLogs([newLog, ...logs]);

    setSkills(skills.map(skill => {
      if (skill.id === activeSkillModal.id) {
        let newExp = skill.currentExp + earnedExp;
        let newLevel = skill.level;
        let reqExp = calculateRequiredExp(newLevel);

        while (newExp >= reqExp) {
          newExp -= reqExp;
          newLevel++;
          reqExp = calculateRequiredExp(newLevel);
        }

        return {
          ...skill,
          level: newLevel,
          currentExp: newExp,
          lastActive: Date.now()
        };
      }
      return skill;
    }));

    setActiveSkillModal(null);
  };

  const startEditSkill = (skill: Skill) => {
    setEditingSkillId(skill.id);
    setEditingSkillName(skill.name);
    setActiveMenuId(null);
  };

  const handleSaveSkillName = (id: string) => {
    if (editingSkillName.trim()) {
      setSkills(skills.map(s => s.id === id ? { ...s, name: editingSkillName.trim() } : s));
    }
    setEditingSkillId(null);
  };

  const handleDeleteSkill = (id: string) => {
    setSkills(skills.filter(s => s.id !== id));
    setLogs(logs.filter(l => l.skillId !== id));
    setActiveMenuId(null);
  };

  const theme = THEMES[themeId];

  return (
    <BackgroundManager currentThemeId={themeId} onThemeChange={handleThemeChange}>
      <div className="flex flex-col gap-8 lg:gap-12" onClick={() => setActiveMenuId(null)}>
        
        {/* TOP: Spider Chart */}
        <div className="w-full flex justify-center -mb-8 lg:-mb-12 relative z-0">
          <div className="w-[120%] max-w-4xl h-72 md:h-96 lg:h-[28rem] relative">
            <SpiderChart skills={skills} historicalSkills={historicalSkills} themeId={themeId} />
            
            <div className="absolute top-0 right-4 lg:right-12 flex flex-col gap-2 z-10 bg-black/20 p-2 rounded-2xl backdrop-blur-md border border-white/10">
              <span className="text-[10px] text-center opacity-60 font-light px-2 mb-1">เปรียบเทียบอดีต</span>
              {(['none', '1w', '1m', '3m', '6m', '1y'] as Timeframe[]).map((tf) => {
                const labels: Record<string, string> = {
                  'none': 'ปัจจุบัน',
                  '1w': '1 สัปดาห์',
                  '1m': '1 เดือน',
                  '3m': '3 เดือน',
                  '6m': '6 เดือน',
                  '1y': '1 ปี'
                };
                return (
                  <button
                    key={tf}
                    onClick={() => setCompareTimeframe(tf)}
                    className={`px-3 py-1.5 text-xs rounded-xl font-light transition-all ${
                      compareTimeframe === tf 
                        ? 'bg-white/20 shadow-md text-white border border-white/30' 
                        : 'text-white/50 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {labels[tf]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* BOTTOM: Skills and History */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 relative z-10">
          
          {/* Left Column: Skills Tracker */}
          <div className="col-span-1 lg:col-span-2 space-y-6">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-3xl font-light tracking-wide mb-1 flex items-center gap-2">
                <Sparkles className="w-6 h-6 opacity-70" />
                ทักษะของคุณ
              </h2>
              <p className="text-sm font-light opacity-70">บันทึกและเติบโตไปอย่างช้าๆ ดั่งธรรมชาติ</p>
            </div>
            <button
              onClick={() => setShowAddSkill(!showAddSkill)}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all font-light text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> เพิ่มทักษะ
            </button>
          </div>

          <AnimatePresence>
            {showAddSkill && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddSkill}
                className="overflow-hidden"
              >
                <div className={`p-4 rounded-2xl mb-4 ${theme.colorScheme.glass} flex gap-3`}>
                  <input
                    type="text"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder="ชื่อทักษะใหม่ (เช่น ยิงธนู, ดนตรี...)"
                    className="flex-1 bg-black/20 border border-white/20 rounded-xl px-4 py-2 outline-none text-sm"
                  />
                  <button type="submit" className="px-6 rounded-xl bg-white/20 hover:bg-white/30 transition-all">
                    เพิ่ม
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {skills.map((skill) => {
                const reqExp = calculateRequiredExp(skill.level);
                const progressPct = Math.min(100, Math.max(0, (skill.currentExp / reqExp) * 100));
                const rustLevel = checkRust(skill.lastActive);
                
                let rustClasses = '';
                if (rustLevel === 1) rustClasses = 'opacity-90 grayscale-[20%]';
                else if (rustLevel === 2) rustClasses = 'opacity-80 grayscale-[40%] sepia-[20%]';
                else if (rustLevel === 3) rustClasses = 'opacity-65 grayscale-[60%] sepia-[40%] mix-blend-luminosity';

                return (
                  <motion.div
                    key={skill.id}
                    layoutId={`skill-${skill.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-6 rounded-3xl ${theme.colorScheme.glass} backdrop-blur-md relative overflow-visible group hover:border-white/30 transition-all duration-500 ${rustClasses}`}
                  >
                    {/* Visual Dust Layer if heavily rusted */}
                    {rustLevel >= 2 && (
                      <div className="absolute inset-0 pointer-events-none opacity-[0.15]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%221.5%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E")' }} />
                    )}
                    
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div className="flex-1">
                        {editingSkillId === skill.id ? (
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                            <input
                              type="text"
                              value={editingSkillName}
                              onChange={(e) => setEditingSkillName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveSkillName(skill.id);
                                if (e.key === 'Escape') setEditingSkillId(null);
                              }}
                              autoFocus
                              className="bg-black/20 border border-white/30 rounded-lg px-2 py-1 text-xl font-medium tracking-wide outline-none w-40 sm:w-auto"
                            />
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleSaveSkillName(skill.id)} className="p-1.5 rounded-md hover:bg-white/20 text-emerald-300">
                                <Check className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <h3 className="text-xl font-medium tracking-wide flex items-baseline gap-2 title-group w-full max-w-[80%] break-words">
                            {skill.name}
                            {rustLevel > 0 && (
                              <span className="text-amber-500/80 text-xs flex flex-shrink-0 items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 ml-2">
                                <AlertCircle className="w-3 h-3" /> ขึ้นสนิม
                              </span>
                            )}
                          </h3>
                        )}
                        <p className="text-xs opacity-50 font-light mt-1">อัปเดต {formatDistanceToNow(skill.lastActive)} ที่แล้ว</p>
                      </div>
                      
                      <div className="flex flex-col items-end shrink-0 gap-2 relative">
                        <div className="flex items-center gap-2">
                          <div className="text-2xl font-light">Lv. {skill.level}</div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === skill.id ? null : skill.id); }}
                            className="p-1.5 hover:bg-white/10 rounded-full transition-colors relative z-20"
                          >
                            <MoreVertical className="w-5 h-5 opacity-70 hover:opacity-100" />
                          </button>
                        </div>
                        
                        {/* Dropdown Menu */}
                        <AnimatePresence>
                          {activeMenuId === skill.id && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95, y: -5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -5 }}
                              className="absolute top-10 right-0 w-32 bg-gray-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                            >
                              <button 
                                onClick={(e) => { e.stopPropagation(); startEditSkill(skill); }}
                                className="w-full text-left px-4 py-3 text-sm hover:bg-white/5 flex items-center gap-2"
                              >
                                <Pencil className="w-3.5 h-3.5" /> แก้ไขชื่อ
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDeleteSkill(skill.id); }}
                                className="w-full text-left px-4 py-3 text-sm hover:bg-white/5 text-red-400 flex items-center gap-2 border-t border-white/5"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> ลบทักษะ
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Natural Progress Bar */}
                    <div className="mt-4 relative z-10">
                      <div className="flex justify-between text-xs font-light opacity-70 mb-2">
                        <span>{skill.currentExp} EXP</span>
                        <span>{reqExp} EXP</span>
                      </div>
                      <div className="h-3 w-full bg-black/30 rounded-full overflow-hidden shadow-inner">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPct}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full rounded-full relative"
                          style={{ backgroundColor: theme.colorScheme.primary }}
                        >
                          <div className="absolute inset-0 bg-white/20 w-full h-full" style={{ filter: 'blur(2px)' }} />
                        </motion.div>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveSkillModal(skill)}
                      className="mt-6 w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all font-light text-sm flex items-center justify-center gap-2 group-hover:border-white/30 relative z-10"
                    >
                      <TrendingUp className="w-4 h-4 opacity-70" />
                      บันทึกความก้าวหน้า
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: History */}
        <div className="space-y-6">
          <div className={`p-6 rounded-3xl ${theme.colorScheme.glass} flex-1 min-h-[300px]`}>
            <h3 className="text-lg font-light tracking-wide mb-4 flex items-center gap-2">
              <History className="w-5 h-5 opacity-70" />
              ความทรงจำ
            </h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {logs.length === 0 ? (
                <p className="text-sm opacity-50 font-light text-center py-8">ยังไม่มีบันทึก เริ่มทำกิจกรรมเถอะ</p>
              ) : (
                logs.slice(0, 10).map((log) => {
                  const skill = skills.find(s => s.id === log.skillId);
                  return (
                    <div key={log.id} className="p-4 rounded-2xl bg-black/20 border border-white/5 flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs opacity-70 px-2 py-0.5 rounded-md bg-white/10 border border-white/10">
                            {skill?.name || 'Unknown'}
                          </span>
                          <h4 className="text-sm font-medium mt-2">{log.taskTitle}</h4>
                        </div>
                        <span className="text-xs font-medium px-2 py-1 bg-white/10 rounded text-emerald-300">
                          +{log.expGained} EXP
                        </span>
                      </div>
                      <p className="text-xs font-light opacity-80 leading-relaxed border-t border-white/10 pt-2 text-wrap break-words">
                        &quot;{log.reflection}&quot;
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
        
      </div>
      </div>

      {activeSkillModal && (
        <LogModal
          skill={activeSkillModal}
          themeId={themeId}
          onClose={() => setActiveSkillModal(null)}
          onSubmit={handleLogProgress}
        />
      )}
    </BackgroundManager>
  );
}
