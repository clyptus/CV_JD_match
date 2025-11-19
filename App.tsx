import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, File as FileIcon, Trash2, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { AnalysisResult, UploadedFile, FileType } from './types';
import { analyzeResume } from './services/geminiService';
import { Dashboard } from './components/Dashboard';

const App: React.FC = () => {
  const [step, setStep] = useState<'upload' | 'analyzing' | 'results'>('upload');
  const [resumeFile, setResumeFile] = useState<UploadedFile | null>(null);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Basic validation
    const validTypes = [FileType.PDF, FileType.TEXT, FileType.IMAGE_PNG, FileType.IMAGE_JPEG, FileType.IMAGE_WEBP];
    if (!validTypes.includes(file.type as FileType)) {
      setError("Please upload a PDF, Text file, or Image (PNG/JPEG).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target?.result as string;
      // Extract pure Base64 content (remove data:application/pdf;base64, prefix)
      const base64Content = base64String.split(',')[1];
      
      setResumeFile({
        name: file.name,
        type: file.type,
        data: base64Content
      });
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!resumeFile || !jobDescription.trim()) {
      setError("Please provide both a resume and a job description.");
      return;
    }

    setStep('analyzing');
    setError(null);

    try {
      const result = await analyzeResume(resumeFile.data, resumeFile.type, jobDescription);
      setAnalysisResult(result);
      setStep('results');
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Please ensure your API key is valid and try again.");
      setStep('upload');
    }
  };

  const resetApp = () => {
    setStep('upload');
    setResumeFile(null);
    setJobDescription('');
    setAnalysisResult(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 selection:bg-blue-500/30">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2" onClick={resetApp} role="button">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">ResumeAI</span>
          </div>
          <div className="text-sm text-slate-400 hidden sm:block">
             Powered by Gemini 2.5 Flash
          </div>
        </div>
      </nav>

      <main className="flex flex-col items-center justify-start pt-10 pb-20 min-h-[calc(100vh-64px)]">
        
        {step === 'upload' && (
          <div className="w-full max-w-5xl px-6 animate-fade-in-up">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                Optimize Your Resume for <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                  Your Dream Job
                </span>
              </h1>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                Upload your resume and the job description to get an instant ATS score, skill gap analysis, and actionable feedback.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Resume Upload */}
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl hover:border-slate-600 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-400" />
                    Your Resume
                  </h2>
                  {resumeFile && (
                    <button 
                      onClick={() => {
                        setResumeFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }} 
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {!resumeFile ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-600 rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-700/30 hover:border-blue-500/50 transition-all group"
                  >
                    <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-8 h-8 text-blue-400" />
                    </div>
                    <p className="text-slate-300 font-medium">Click to upload resume</p>
                    <p className="text-slate-500 text-sm mt-2">PDF, TXT, or Image</p>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      className="hidden" 
                      accept=".pdf,.txt,image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                ) : (
                  <div className="border border-slate-600 bg-slate-900/50 rounded-xl h-64 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-500/5 blur-2xl pointer-events-none" />
                    <FileIcon className="w-16 h-16 text-blue-400 mb-4" />
                    <p className="text-white font-medium truncate max-w-[80%]">{resumeFile.name}</p>
                    <span className="text-xs text-blue-400 mt-2 uppercase tracking-wider px-2 py-1 bg-blue-500/10 rounded">
                       Ready for Analysis
                    </span>
                  </div>
                )}
              </div>

              {/* Right Column: Job Description */}
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl hover:border-slate-600 transition-colors flex flex-col">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  Job Description
                </h2>
                <textarea
                  className="flex-1 w-full bg-slate-900/50 border-2 border-slate-700 rounded-xl p-4 text-slate-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none transition-all placeholder:text-slate-600"
                  placeholder="Paste the job description, requirements, and responsibilities here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  style={{ minHeight: '256px' }}
                />
              </div>
            </div>

            {error && (
               <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400">
                 <AlertCircle className="w-5 h-5 flex-shrink-0" />
                 <p>{error}</p>
               </div>
            )}

            <div className="mt-10 flex justify-center">
              <button
                onClick={handleAnalyze}
                disabled={!resumeFile || !jobDescription.trim()}
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white transition-all duration-200 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:from-blue-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
              >
                Analyze Resume
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {step === 'analyzing' && (
          <div className="flex flex-col items-center justify-center h-[60vh] animate-fade-in">
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-blue-500 border-r-purple-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <Sparkles className="absolute inset-0 m-auto text-white w-8 h-8 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Analyzing Profile</h2>
            <p className="text-slate-400">Comparing skills against market requirements...</p>
          </div>
        )}

        {step === 'results' && analysisResult && (
          <div className="w-full animate-fade-in">
            <Dashboard data={analysisResult} onUpdateData={setAnalysisResult} />
            
            <div className="flex justify-center mt-12">
                <button 
                    onClick={resetApp}
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 border-b border-transparent hover:border-white pb-0.5"
                >
                    Analyze another resume
                </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;
