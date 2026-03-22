import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Dosha } from "../types";
import { ChevronLeft, ChevronRight, CheckCircle2, LayoutGrid } from "lucide-react";
import { getQuestionnaire, submitAssessment } from "../services/api";

export const QuestionnairePage = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Dosha>>({});
  const navigate = useNavigate();

  // 🔥 FETCH FROM BACKEND
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await getQuestionnaire();

        if (!data?.sections) return;

        const allQuestions: any[] = [];
        const formattedSections: any[] = [];

        data.sections.forEach((sec: any) => {
          const questionIds: number[] = [];

          sec.questions.forEach((q: any) => {
            allQuestions.push({
              id: q.id,
              text: q.question,
              options: q.options.map((opt: any) => ({
                label: opt.text,
                value: opt.key,
              })),
            });

            questionIds.push(q.id);
          });

          formattedSections.push({
            id: sec.section_id,
            title: sec.section_title,
            questionIds,
          });
        });

        setQuestions(allQuestions);
        setSections(formattedSections);
      } catch (err) {
        console.error("Failed to load questionnaire", err);
      }
    };

    fetchQuestions();
  }, []);

  // ✅ SAFE CURRENT QUESTION
  const currentQuestion = questions[currentQuestionIndex] || null;

  // ✅ SAFE CURRENT SECTION
  const currentSectionIndex =
    currentQuestion && sections.length
      ? sections.findIndex((s) => s.questionIds.includes(currentQuestion.id))
      : 0;

  const currentSection = sections[currentSectionIndex] || null;

  // ✅ QUESTIONS IN CURRENT SECTION
  const sectionQuestions = useMemo(() => {
    if (!currentSection) return [];

    return questions.filter((q) =>
      currentSection.questionIds.includes(q.id)
    );
  }, [currentSection, questions]);

  // ✅ SAFE PROGRESS CALCULATIONS
  const questionIndexInSection =
    currentQuestion && sectionQuestions.length
      ? sectionQuestions.findIndex((q) => q.id === currentQuestion.id)
      : 0;

  const overallProgress =
    questions.length > 0
      ? ((currentQuestionIndex + 1) / questions.length) * 100
      : 0;

  const sectionProgress =
    sectionQuestions.length > 0
      ? ((questionIndexInSection + 1) / sectionQuestions.length) * 100
      : 0;

  const handleOptionSelect = (questionId: number, value: Dosha) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleNext = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      if (Object.keys(answers).length !== questions.length) {
        alert("Please answer all questions before submitting.");
        return;
      }
      try {
        const formattedAnswers = Object.entries(answers).map(
          ([question_id, selected_option]) => ({
            question_id: Number(question_id),
            selected_option,
          })
        );

        const response = await submitAssessment({
          answers: formattedAnswers,
        });

        localStorage.setItem(
          "lastAssessment",
          JSON.stringify(response.result)
        );

        navigate("/dashboard");
      } catch (error) {
        console.error("Assessment submission failed:", error);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const isAnswered = currentQuestion
    ? !!answers[currentQuestion.id]
    : false;

  // ⭐⭐⭐ LOADING UI (SAFE — NO HOOK BREAK)
  if (!currentQuestion || !currentSection) {
    return (
      <div className="text-center mt-20">
        Loading questionnaire...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Progress Section */}
      <div className="mb-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider mb-1">
              <LayoutGrid className="h-4 w-4" />
              Section {currentSectionIndex + 1} of {sections.length}
            </div>
            <h1 className="text-3xl font-bold text-slate-900">
              {currentSection.title}
            </h1>
          </div>

          <div className="text-right">
            <span className="text-sm font-semibold text-slate-500">
              Question {questionIndexInSection + 1} of {sectionQuestions.length}
            </span>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section Progress */}
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

          {/* Overall Progress */}
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

      {/* Question Card */}
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

          {/* Options */}
          <div className="grid grid-cols-1 gap-4">
            {currentQuestion.options.map((option: any, idx: number) => (
              <button
                key={idx}
                onClick={() =>
                  handleOptionSelect(currentQuestion.id, option.value)
                }
                className={`w-full text-left p-6 rounded-2xl border-2 transition-all flex items-center justify-between ${answers[currentQuestion.id] === option.value
                    ? "border-primary bg-primary/5"
                    : "border-slate-100 hover:border-primary/30"
                  }`}
              >
                <span className="text-lg">{option.label}</span>

                {answers[currentQuestion.id] === option.value && (
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                )}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-12">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="text-slate-600"
            >
              <ChevronLeft /> Previous
            </button>

            <button
              onClick={handleNext}
              disabled={!isAnswered}
              className="bg-primary text-white px-6 py-3 rounded-xl"
            >
              {currentQuestionIndex === questions.length - 1
                ? "Submit Assessment"
                : "Next Question"}
              <ChevronRight />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};