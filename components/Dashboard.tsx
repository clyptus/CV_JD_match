import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { AnalysisChart } from './AnalysisChart';
import { optimizeResumeWithNewSkill } from '../services/geminiService';
import { CheckCircle, XCircle, AlertTriangle, Plus, ArrowRight, Loader2 } from 'lucide-react';

interface DashboardProps {
  data: AnalysisResult;
  onUpdateData: (newData: AnalysisResult) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, onUpdateData }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleAddSkill = async (skill: string) => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const updatedResult = await optimizeResumeWithNewSkill(data, skill);
      onUpdateData(updatedResult);
    } catch (e) {
      console.error(e);
      alert("Failed to update analysis. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-8 items-center justify-between bg-slate-800/50 p-8 rounded-2xl border border-slate-700 backdrop-blur-sm">
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-white mb-2">Analysis Complete</h2>
          <p className="text-slate-400 text-lg">{data.summary}</p>
        </div>
        <div className="flex gap-8">
            <AnalysisChart score={data.matchScore} label="Match Score" color="#3b82f6" />
            <AnalysisChart score={data.atsScore} label="ATS Friendly" color="#10b981" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skills Breakdown */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-400" />
                Matching Skills
            </h3>
            <div className="flex flex-wrap gap-2">
                {data.matchingSkills.map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium border border-blue-500/30">
                        {skill}
                    </span>
                ))}
            </div>
        </div>

        {/* Missing Skills (Interactive) */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 relative overflow-hidden">
             {isUpdating && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-10">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        <span className="text-blue-400 font-medium">Re-calibrating Score...</span>
                    </div>
                </div>
            )}
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Missing Skills
                <span className="text-xs font-normal text-slate-400 ml-auto">Click + to simulate adding</span>
            </h3>
            <div className="flex flex-wrap gap-2">
                {data.missingSkills.length === 0 ? (
                    <p className="text-slate-500 italic">No critical skills missing!</p>
                ) : (
                    data.missingSkills.map((skill, i) => (
                        <button 
                            key={i} 
                            onClick={() => handleAddSkill(skill)}
                            className="group flex items-center gap-1 px-3 py-1 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 rounded-full text-sm font-medium border border-amber-500/30 transition-all cursor-pointer"
                        >
                            {skill}
                            <Plus className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                        </button>
                    ))
                )}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths & Weaknesses */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-6">
            <div>
                <h4 className="text-green-400 font-medium mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Strong Points
                </h4>
                <ul className="space-y-2">
                    {data.strengths.map((item, i) => (
                        <li key={i} className="text-slate-300 text-sm pl-2 border-l-2 border-green-500/30">
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="pt-4 border-t border-slate-700/50">
                <h4 className="text-red-400 font-medium mb-3 flex items-center gap-2">
                    <XCircle className="w-4 h-4" /> Areas for Improvement
                </h4>
                <ul className="space-y-2">
                    {data.weaknesses.map((item, i) => (
                        <li key={i} className="text-slate-300 text-sm pl-2 border-l-2 border-red-500/30">
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </div>

        {/* Recommended Actions */}
        <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-xl border border-blue-500/30 p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-purple-400" />
                Action Plan
            </h3>
            <div className="space-y-3">
                {data.recommendedActions.map((action, i) => (
                    <div key={i} className="flex gap-3 p-3 bg-slate-900/40 rounded-lg border border-slate-700/50">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-xs font-bold mt-0.5">
                            {i + 1}
                        </span>
                        <p className="text-slate-200 text-sm leading-relaxed">{action}</p>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};
