import React from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface AnalysisChartProps {
  score: number;
  label: string;
  color: string;
}

export const AnalysisChart: React.FC<AnalysisChartProps> = ({ score, label, color }) => {
  const data = [{ name: label, value: score, fill: color }];

  return (
    <div className="relative flex flex-col items-center justify-center w-48 h-48">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart 
          innerRadius="70%" 
          outerRadius="100%" 
          barSize={10} 
          data={data} 
          startAngle={90} 
          endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar
            background
            dataKey="value"
            cornerRadius={30} 
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-4xl font-bold text-white">{score}</span>
        <span className="text-xs text-slate-400 uppercase tracking-wider mt-1">{label}</span>
      </div>
    </div>
  );
};
