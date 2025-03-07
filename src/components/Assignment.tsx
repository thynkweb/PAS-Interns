import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Assignment as AssignmentType,
  AssignmentQuestion,
  UserProgress,
  getAssignment,
  getAssignmentQuestions,
  getUserProgress,
  createUserProgress,
  updateUserProgress
} from '../lib/api';

interface Props {
  assignmentId: string;
}

export default function Assignment({ assignmentId }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<AssignmentType | null>(null);
  const [questions, setQuestions] = useState<AssignmentQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTest, setShowTest] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [showResults, setShowResults] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);

  useEffect(() => {
    async function fetchAssignmentData() {
      if (!user) return;

      try {
        const [assignmentData, questionsData, progressData] = await Promise.all([
          getAssignment(assignmentId),
          getAssignmentQuestions(assignmentId),
          getUserProgress(user.id, assignmentId)
        ]);

        setAssignment(assignmentData);
        setQuestions(questionsData);
        
        if (progressData) {
          setProgress(progressData);
          if (progressData.completed) {
            setShowResults(true);
          } else {
            setCurrentQuestionIndex(progressData.current_question - 1);
          }
        } else {
          const newProgress = await createUserProgress(user.id, assignmentId);
          setProgress(newProgress);
        }
      } catch (err) {
        console.error('Error fetching assignment:', err);
        setError('Failed to load assignment');
      } finally {
        setLoading(false);
      }
    }

    fetchAssignmentData();
  }, [user, assignmentId]);

  const handleOptionSelect = (optionLabel: string) => {
    setSelectedOption(optionLabel);
    setIsCorrect(null);
    setShowNextButton(false);
  };

  const handleSubmit = async () => {
    if (!selectedOption || !progress || isSubmitting) return;

    setIsSubmitting(true);
    const currentQuestion = questions[currentQuestionIndex];
    const isAnswerCorrect = selectedOption === currentQuestion.correct_option;
    setIsCorrect(isAnswerCorrect);

    if (isAnswerCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }

    const isLastQuestion = currentQuestionIndex === questions.length - 1;
      
    try {
      await updateUserProgress(
        progress.id,
        currentQuestionIndex + 2,
        isLastQuestion
      );

      if (isLastQuestion) {
        setTimeout(() => {
          setShowResults(true);
        }, 1500);
      } else {
        setShowNextButton(true);
      }
    } catch (err) {
      console.error('Error updating progress:', err);
      setError('Failed to update progress');
    }

    setIsSubmitting(false);
  };

  const handleNext = () => {
    setCurrentQuestionIndex(prev => prev + 1);
    setSelectedOption(null);
    setIsCorrect(null);
    setShowNextButton(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (showResults) {
    const score = correctAnswers;
    const totalQuestions = questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);
    
    return (
      <div className="bg-orange-300 rounded-xl p-8 text-white">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-2">Assignment Complete! 🎉</h2>
          <p className="text-xl opacity-90">Let's see how you did</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8">
          <div className="text-center">
            <div className="text-6xl font-bold mb-4">
              {score} <span className="text-3xl opacity-75">/ {totalQuestions}</span>
            </div>
            <div className="text-2xl font-medium mb-2">
              {percentage}% Score
            </div>
            <p className="text-lg opacity-75">
              {percentage >= 70 
                ? "Great job! You've mastered this material." 
                : "Keep learning! You'll do better next time."}
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-1000 ease-out"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => {
              setShowResults(false);
              setCorrectAnswers(0);
              setCurrentQuestionIndex(0);
              setSelectedOption(null);
              setShowTest(false);
            }}
            className="w-full bg-white text-orange-500 py-3 rounded-full font-semibold hover:bg-orange-50 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-white/10 backdrop-blur-sm text-white py-3 rounded-full font-semibold hover:bg-white/20 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!showTest) {
    return (
      <div className="bg-orange-300 rounded-xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-4">{assignment?.title}</h2>
          <p className="text-lg mb-8">Note: Make sure to finish the modules before taking this assignment</p>
          <button
            onClick={() => setShowTest(true)}
            className="bg-white text-orange-500 px-8 py-3 rounded-full font-semibold hover:bg-orange-50 transition-colors"
          >
            BEGIN TEST
          </button>
        </div>
        <img
          src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1000&auto=format&fit=crop"
          alt="Student studying"
          className="absolute bottom-0 right-0 w-64 h-64 object-cover opacity-20"
        />
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="bg-orange-300 rounded-xl p-6 text-white">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <div className="h-2 flex-1 mx-4 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`
              }}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 text-gray-900">
        <h3 className="text-xl font-bold mb-6">{currentQuestion?.question_text}</h3>
        
        <div className="space-y-3">
          {currentQuestion?.options.map((option) => {
            const isSelected = selectedOption === option.option_label;
            const isCorrectOption = currentQuestion.correct_option === option.option_label;
            let buttonStyle = 'bg-gray-50 hover:bg-gray-100';
            
            if (isCorrect !== null) {
              if (isCorrectOption) {
                buttonStyle = 'bg-green-100 border-2 border-green-500';
              } else if (isSelected && !isCorrectOption) {
                buttonStyle = 'bg-red-100 border-2 border-red-500';
              }
            } else if (isSelected) {
              buttonStyle = 'bg-indigo-100 border-2 border-indigo-500';
            }

            return (
              <button
                key={option.id}
                onClick={() => handleOptionSelect(option.option_label)}
                className={`w-full text-left p-4 rounded-xl transition-all ${buttonStyle}`}
                disabled={isSubmitting || isCorrect !== null}
              >
                {option.option_text}
              </button>
            );
          })}
        </div>

        <div className="flex justify-between mt-6">
          {!showNextButton ? (
            <button
              onClick={handleSubmit}
              disabled={!selectedOption || isSubmitting || isCorrect !== null}
              className={`px-6 py-2 rounded-full font-medium ${
                !selectedOption || isSubmitting || isCorrect !== null
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isSubmitting ? 'Checking...' : 'Submit'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-2 rounded-full font-medium bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Next Question
            </button>
          )}
        </div>
      </div>
    </div>
  );
}