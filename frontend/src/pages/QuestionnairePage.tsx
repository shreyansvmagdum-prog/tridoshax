import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { QUESTIONS, SECTIONS } from '../constants';
import { Dosha } from '../types';
import { ChevronLeft, ChevronRight, CheckCircle2, LayoutGrid } from 'lucide-react';

export const QuestionnairePage = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Dosha>>({});
  const navigate = useNavigate();

  // Find current section and its progress
  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const currentSectionIndex = SECTIONS.findIndex(s => s.questionIds.includes(currentQuestion.id));
  const currentSection = SECTIONS[currentSectionIndex];
  
  const sectionQuestions = useMemo(() => 
    QUESTIONS.filter(q => currentSection.questionIds.includes(q.id)),
    [currentSection]
  );
  
  const questionIndexInSection = sectionQuestions.findIndex(q => q.id === currentQuestion.id);
  
  const overallProgress = ((currentQuestionIndex + 1) / QUESTIONS.length) * 100;
  const sectionProgress = ((questionIndexInSection + 1) / sectionQuestions.length) * 100;

  const handleOptionSelect = (questionId: number, value: Dosha) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleNext = () => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Calculate results
      const counts: Record<Dosha, number> = { Vata: 0, Pitta: 0, Kapha: 0 };
      (Object.values(answers) as Dosha[]).forEach((val) => {
        counts[val]++;
      });
      
      const total = Object.values(answers).length;
      const result = {
        scores: {
          Vata: Math.round((counts.Vata / total) * 100),
          Pitta: Math.round((counts.Pitta / total) * 100),
          Kapha: Math.round((counts.Kapha / total) * 100),
        }
      };
      
      localStorage.setItem('lastAssessment', JSON.stringify(result));
      navigate('/dashboard');
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const isAnswered = !!answers[currentQuestion.id];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Progress Section */}
      <div className="mb-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider mb-1">
              <LayoutGrid className="h-4 w-4" />
              Section {currentSectionIndex + 1} of {SECTIONS.length}
            </div>
            <h1 className="text-3xl font-bold text-slate-900">{currentSection.title}</h1>
          </div>
          <div className="text-right">
            <span className="text-sm font-semibold text-slate-500">
              Question {questionIndexInSection + 1} of {sectionQuestions.length}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
              <span>Section Progress</span>
              <span>{Math.round(sectionProgress)}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${sectionProgress}%` }}
                className="bg-primary h-full"
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
              <span>Overall Progress</span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                className="bg-primary/40 h-full"
              />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="glass-card p-8 md:p-12"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-10 leading-tight">
            {currentQuestion.text}
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleOptionSelect(currentQuestion.id, option.value)}
                className={`w-full text-left p-6 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                  answers[currentQuestion.id] === option.value
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-slate-100 hover:border-primary/30 hover:bg-slate-50'
                }`}
              >
                <span className={`text-lg ${answers[currentQuestion.id] === option.value ? 'text-primary font-bold' : 'text-slate-700 font-medium'}`}>
                  {option.label}
                </span>
                {answers[currentQuestion.id] === option.value && (
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                )}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-between mt-12 gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className={`flex items-center justify-center px-8 py-4 rounded-xl font-bold transition-all ${
                currentQuestionIndex === 0 
                  ? 'text-slate-300 cursor-not-allowed' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ChevronLeft className="mr-2 h-5 w-5" /> Previous
            </button>
            <button
              onClick={handleNext}
              disabled={!isAnswered}
              className={`flex items-center justify-center px-10 py-4 rounded-xl font-bold transition-all ${
                !isAnswered
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02]'
              }`}
            >
              {currentQuestionIndex === QUESTIONS.length - 1 ? 'Submit Assessment' : 'Next Question'}
              <ChevronRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
