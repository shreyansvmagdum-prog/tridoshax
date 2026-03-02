import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { QUESTIONS } from '../constants';
import { Dosha } from '../types';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

export const QuestionnairePage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Dosha>>({});
  const navigate = useNavigate();

  const totalQuestions = QUESTIONS.length;
  const progress = ((currentStep + 1) / totalQuestions) * 100;

  const handleOptionSelect = (questionId: number, value: Dosha) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleNext = () => {
    if (currentStep < totalQuestions - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Calculate results and navigate
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
      
      // In a real app, we'd save this to a database
      localStorage.setItem('lastAssessment', JSON.stringify(result));
      navigate('/dashboard');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentQuestion = QUESTIONS[currentStep];
  const isAnswered = !!answers[currentQuestion.id];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-semibold text-primary">Question {currentStep + 1} of {totalQuestions}</span>
          <span className="text-sm font-medium text-slate-500">{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="bg-primary h-full"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="glass-card p-8 md:p-12"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-8 leading-tight">
            {currentQuestion.text}
          </h2>

          <div className="space-y-4">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleOptionSelect(currentQuestion.id, option.value)}
                className={`w-full text-left p-5 rounded-xl border-2 transition-all flex items-center justify-between group ${
                  answers[currentQuestion.id] === option.value
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-slate-100 hover:border-primary/30 hover:bg-slate-50'
                }`}
              >
                <span className={`text-lg ${answers[currentQuestion.id] === option.value ? 'text-primary font-semibold' : 'text-slate-700'}`}>
                  {option.label}
                </span>
                {answers[currentQuestion.id] === option.value && (
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                )}
              </button>
            ))}
          </div>

          <div className="flex justify-between mt-12">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all ${
                currentStep === 0 
                  ? 'text-slate-300 cursor-not-allowed' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ChevronLeft className="mr-2 h-5 w-5" /> Previous
            </button>
            <button
              onClick={handleNext}
              disabled={!isAnswered}
              className={`flex items-center px-8 py-3 rounded-xl font-semibold transition-all ${
                !isAnswered
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-primary text-white shadow-lg hover:shadow-primary/20 hover:scale-[1.02]'
              }`}
            >
              {currentStep === totalQuestions - 1 ? 'Finish Assessment' : 'Next Question'}
              <ChevronRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
