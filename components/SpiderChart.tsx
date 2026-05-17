'use client';

import { THEMES, ThemeId, Skill } from '@/types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface SpiderChartProps {
  skills: Skill[];
  historicalSkills?: Skill[];
  themeId: ThemeId;
}

export function SpiderChart({ skills, historicalSkills, themeId }: SpiderChartProps) {
  const theme = THEMES[themeId];
  
  const data = skills.map((s) => {
    const pastSkill = historicalSkills?.find((h) => h.id === s.id);
    return {
      subject: s.name,
      current: s.level,
      past: pastSkill ? pastSkill.level : s.level,
      fullMark: Math.max(...skills.map(skill => skill.level), 10) + 2, // dynamic scale
    };
  });

  if (skills.length < 3) {
    return (
      <div className="flex items-center justify-center h-full w-full opacity-60">
        <p className="text-sm font-light tracking-wide">Add at least 3 skills to see balance</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="85%" data={data} style={{ filter: `drop-shadow(0 0 20px ${theme.colorScheme.primary})` }}>
        <PolarGrid stroke="rgba(255,255,255,0.4)" strokeWidth={1.5} />
        <PolarAngleAxis 
          dataKey="subject" 
          tick={({ x, y, payload }) => (
            <text x={x} y={y} dy={4} textAnchor="middle" fill="white" fontSize={13} fontWeight={500} style={{ filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.8))' }}>
              {payload.value}
            </text>
          )}
        />
        <PolarRadiusAxis angle={30} domain={[0, 'dataMax + 2']} tick={false} axisLine={false} />
        {historicalSkills && historicalSkills.length > 0 && (
          <Radar
            name="Past Skills"
            dataKey="past"
            stroke="rgba(255,255,255,0.3)"
            fill="rgba(255,255,255,0.15)"
            strokeDasharray="4 4"
          />
        )}
        <Radar
          name="Current Skills"
          dataKey="current"
          stroke={theme.colorScheme.primary}
          strokeWidth={2}
          fill={theme.colorScheme.primary}
          fillOpacity={0.65}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
