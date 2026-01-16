import React from 'react';
import { Question } from '../types';
import { LatexRenderer } from './LatexRenderer';

interface QuestionCardProps {
  question: Question;
  index: number;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, index }) => {
  return (
    <div className="mb-6 font-serif text-slate-900">
      <div className="flex items-baseline gap-2 mb-2">
        <span className="font-bold whitespace-nowrap">Q{index + 1}.</span>
        <div className="leading-relaxed whitespace-pre-wrap">
          <LatexRenderer text={question.text} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 ml-8 mt-2">
        {question.options.map((opt, i) => (
          <div key={i} className="flex gap-2">
            <span className="font-semibold text-slate-700">({opt.label})</span>
            <span>
              <LatexRenderer text={opt.text} />
            </span>
          </div>
        ))}
      </div>
      
      <div className="mt-2 ml-8 text-xs font-sans text-slate-400 font-medium tracking-wide">
        [Difficulty: Level {question.difficulty}]
      </div>
    </div>
  );
};
