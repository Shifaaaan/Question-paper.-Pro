import React, { useState } from 'react';
import { FileUploader } from './components/FileUploader';
import { ExamPaper } from './components/ExamPaper';
import { analyzeImage } from './services/geminiService';
import { Question, ProcessingStatus } from './types';
import { BrainCircuit, Loader2, AlertCircle, FileText } from 'lucide-react';

export default function App() {
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [progress, setProgress] = useState<{current: number, total: number} | null>(null);

  const handleFilesSelect = async (files: File[]) => {
    if (files.length === 0) return;

    setStatus('analyzing');
    setErrorMsg(null);
    setQuestions([]); // Reset previous results
    setProgress({ current: 0, total: files.length });

    try {
      const allQuestions: Question[] = [];
      
      // Process files in parallel, but you might want to sequentialize if concerned about rate limits.
      // For UX, showing progress implies we wait for each.
      // Let's use Promise.all but track completion for progress updates? 
      // Actually simpler to just map and wait. 
      // To update progress effectively, we need to increment counter as promises resolve.
      
      let completedCount = 0;
      
      const filePromises = files.map(async (file) => {
        try {
          const result = await analyzeImage(file);
          completedCount++;
          setProgress(prev => prev ? { ...prev, current: completedCount } : null);
          return result;
        } catch (e) {
          console.error(`Failed to process file ${file.name}`, e);
          // Return empty array on failure for a single file to allow others to succeed
          return []; 
        }
      });

      const results = await Promise.all(filePromises);
      
      // Flatten results
      results.forEach(qArr => allQuestions.push(...qArr));

      if (allQuestions.length === 0 && files.length > 0) {
        throw new Error("No questions could be extracted from the uploaded images.");
      }

      setQuestions(allQuestions);
      setStatus('success');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err.message || "Failed to process the images. Please try again.");
    } finally {
      setProgress(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* App Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">ExamForge AI</h1>
          </div>
          <div className="text-sm text-slate-500 hidden sm:block">
            Academic Content Processing Engine
          </div>
        </div>
      </header>

      <main className="flex-grow bg-slate-50/50 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: Controls */}
          <div className="lg:col-span-4 space-y-6 print:hidden">
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                Input Source
              </h2>
              <FileUploader 
                onFilesSelect={handleFilesSelect} 
                disabled={status === 'analyzing'} 
              />
              
              <div className="mt-6 text-xs text-slate-400 leading-relaxed">
                <strong className="text-slate-600">Instructions:</strong>
                <ul className="list-disc pl-4 mt-2 space-y-1">
                  <li>Upload clear images of question papers (Multi-select allowed).</li>
                  <li>AI extracts text, LaTeX math, and options.</li>
                  <li>Content is auto-grouped by Topic.</li>
                  <li>Questions are sorted by Difficulty (1-5).</li>
                </ul>
              </div>
            </div>

            {/* Status Indicators */}
            {status === 'analyzing' && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 flex flex-col items-center justify-center text-center animate-pulse">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
                <h3 className="font-semibold text-indigo-900">Processing Documents</h3>
                <p className="text-sm text-indigo-700 mt-1">
                  {progress ? `Analyzing image ${progress.current} of ${progress.total}...` : 'Initializing...'}
                </p>
                <div className="w-full bg-indigo-200 rounded-full h-1.5 mt-4">
                  <div 
                    className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300" 
                    style={{ width: progress ? `${(progress.current / progress.total) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-6 flex flex-col items-center text-center">
                <AlertCircle className="w-8 h-8 text-red-600 mb-3" />
                <h3 className="font-semibold text-red-900">Processing Failed</h3>
                <p className="text-sm text-red-700 mt-1">{errorMsg}</p>
                <button 
                  onClick={() => setStatus('idle')}
                  className="mt-4 text-sm font-medium text-red-700 hover:underline"
                >
                  Try Again
                </button>
              </div>
            )}

            {status === 'success' && (
               <div className="bg-green-50 border border-green-100 rounded-xl p-6">
                 <h3 className="font-semibold text-green-900 flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500" />
                   Processing Complete
                 </h3>
                 <p className="text-sm text-green-700 mt-2">
                   Successfully extracted {questions.length} questions.
                 </p>
               </div>
            )}
          </div>

          {/* Right Panel: Output */}
          <div className="lg:col-span-8">
            {questions.length > 0 ? (
              <ExamPaper questions={questions} />
            ) : (
              <div className="h-full min-h-[400px] border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 print:hidden">
                <div className="text-center">
                  <p>No document processed yet.</p>
                  <p className="text-sm mt-2">Upload files to generate the exam paper.</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
