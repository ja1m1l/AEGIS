"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Trophy, Clock, CheckCircle, XCircle, Crown, Medal, Award } from 'lucide-react';

const Antigravity = dynamic(() => import('@/components/AntigravityInteractive'), {
    ssr: false,
    loading: () => <div className="absolute inset-0 z-0 bg-transparent" />,
});

// Mock quiz questions
const QUIZ_QUESTIONS = [
    {
        id: 1,
        question: "What is the time complexity of binary search?",
        options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
        correctAnswer: 1,
        timeLimit: 15,
    },
    {
        id: 2,
        question: "Which data structure uses LIFO principle?",
        options: ["Queue", "Stack", "Array", "Tree"],
        correctAnswer: 1,
        timeLimit: 15,
    },
    {
        id: 3,
        question: "What does CSS stand for?",
        options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style Sheets", "Colorful Style Sheets"],
        correctAnswer: 1,
        timeLimit: 15,
    },
    {
        id: 4,
        question: "Which is NOT a JavaScript framework?",
        options: ["React", "Angular", "Django", "Vue"],
        correctAnswer: 2,
        timeLimit: 15,
    },
    {
        id: 5,
        question: "What is the default port for HTTP?",
        options: ["443", "8080", "80", "3000"],
        correctAnswer: 2,
        timeLimit: 15,
    },
];

// Mock participants for leaderboard
const MOCK_PARTICIPANTS = [
    { id: '1', name: 'You', score: 0, avatar: null, answeredQuestions: 0 },
    { id: '2', name: 'Sarah Johnson', score: 0, avatar: null, answeredQuestions: 0 },
    { id: '3', name: 'Alex Chen', score: 0, avatar: null, answeredQuestions: 0 },
    { id: '4', name: 'Maya Patel', score: 0, avatar: null, answeredQuestions: 0 },
    { id: '5', name: 'Jordan Smith', score: 0, avatar: null, answeredQuestions: 0 },
];

export default function QuizPlayPage() {
    const router = useRouter();
    const [isDark] = useState(true);

    // Quiz state
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [questionTimeRemaining, setQuestionTimeRemaining] = useState(QUIZ_QUESTIONS[0].timeLimit);
    const [leaderboard, setLeaderboard] = useState(MOCK_PARTICIPANTS);
    const [userScore, setUserScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [quizCompleted, setQuizCompleted] = useState(false);

    const currentQuestion = QUIZ_QUESTIONS[currentQuestionIndex];
    const totalQuestions = QUIZ_QUESTIONS.length;
    const questionsRemaining = totalQuestions - currentQuestionIndex;

    // Question timer
    useEffect(() => {
        if (quizCompleted || showResult) return;

        const interval = setInterval(() => {
            setQuestionTimeRemaining(prev => {
                if (prev <= 1) {
                    // Auto-submit when time runs out
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [currentQuestionIndex, showResult, quizCompleted]);

    // Simulate other players answering
    useEffect(() => {
        if (showResult) {
            const timeout = setTimeout(() => {
                updateLeaderboard();
            }, 500);
            return () => clearTimeout(timeout);
        }
    }, [showResult]);

    const updateLeaderboard = () => {
        setLeaderboard(prev => {
            const updated = prev.map(participant => {
                if (participant.id === '1') {
                    return { ...participant, score: userScore, answeredQuestions: currentQuestionIndex + 1 };
                }
                // Simulate other players' scores
                const randomCorrect = Math.random() > 0.3;
                const points = randomCorrect ? Math.floor(Math.random() * 80) + 20 : 0;
                return {
                    ...participant,
                    score: participant.score + points,
                    answeredQuestions: currentQuestionIndex + 1,
                };
            });
            return updated.sort((a, b) => b.score - a.score);
        });
    };

    const handleSubmit = () => {
        if (showResult) return;

        const correct = selectedOption === currentQuestion.correctAnswer;
        setIsCorrect(correct);
        setShowResult(true);

        if (correct) {
            const points = Math.floor((questionTimeRemaining / currentQuestion.timeLimit) * 100);
            setUserScore(prev => prev + points);
        }

        // Auto-advance to next question after 2 seconds
        setTimeout(() => {
            if (currentQuestionIndex < totalQuestions - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
                setSelectedOption(null);
                setShowResult(false);
                setIsCorrect(null);
                setQuestionTimeRemaining(QUIZ_QUESTIONS[currentQuestionIndex + 1].timeLimit);
            } else {
                setQuizCompleted(true);
            }
        }, 2000);
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getRankIcon = (index: number) => {
        if (index === 0) return <Crown className="w-4 h-4 text-amber-500" />;
        if (index === 1) return <Medal className="w-4 h-4 text-gray-400" />;
        if (index === 2) return <Award className="w-4 h-4 text-orange-600" />;
        return null;
    };

    if (quizCompleted) {
        const userRank = leaderboard.findIndex(p => p.id === '1') + 1;

        return (
            <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
                <div className="max-w-2xl w-full bg-white/5 border border-white/10 rounded-3xl p-12 text-center backdrop-blur-3xl">
                    <Trophy className="w-20 h-20 mx-auto mb-6 text-amber-500" />
                    <h1 className="text-5xl font-black mb-4">Quiz Completed!</h1>
                    <p className="text-2xl mb-8">Your Score: <span className="text-amber-500 font-black">{userScore}</span></p>
                    <p className="text-xl mb-8 opacity-60">Rank: #{userRank} out of {leaderboard.length}</p>
                    <button
                        onClick={() => router.push('/quiz')}
                        className="px-8 py-4 bg-amber-500 hover:bg-amber-400 rounded-2xl font-black uppercase tracking-widest text-sm transition-all"
                    >
                        Back to Quizzes
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen relative ${isDark ? 'bg-[#050505] text-white' : 'bg-[#fafafa] text-black'}`}>
            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <Antigravity count={60} magnetRadius={3} ringRadius={3} color="#ffffff" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] blur-[200px] rounded-full opacity-10 bg-amber-900" />
            </div>

            <div className="relative z-10 min-h-screen flex">
                {/* Left Sidebar - Leaderboard */}
                <div className="w-80 p-6 border-r border-white/10 bg-black/20 backdrop-blur-xl">
                    <div className="sticky top-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Trophy className="w-6 h-6 text-amber-500" />
                            <h2 className="text-2xl font-black tracking-tight">Leaderboard</h2>
                        </div>

                        <div className="space-y-3">
                            {leaderboard.map((participant, index) => (
                                <div
                                    key={participant.id}
                                    className={`p-4 rounded-2xl border transition-all duration-300 ${participant.id === '1'
                                            ? 'bg-amber-500/10 border-amber-500/30 shadow-lg'
                                            : 'bg-white/5 border-white/10'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0 w-8 text-center font-black text-lg">
                                            {getRankIcon(index) || `#${index + 1}`}
                                        </div>

                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black ${index === 0 ? 'bg-amber-500/20 text-amber-500' :
                                                index === 1 ? 'bg-gray-500/20 text-gray-400' :
                                                    index === 2 ? 'bg-orange-500/20 text-orange-600' :
                                                        'bg-white/10'
                                            }`}>
                                            {getInitials(participant.name)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm truncate">{participant.name}</p>
                                            <p className="text-xs opacity-50">
                                                {participant.answeredQuestions}/{totalQuestions} answered
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p className="font-black text-lg text-amber-500">{participant.score}</p>
                                            <p className="text-xs opacity-50">pts</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content - Quiz */}
                <div className="flex-1 p-6 md:p-10">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-4">
                                <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                                    <p className="text-sm font-black">
                                        Question {currentQuestionIndex + 1}/{totalQuestions}
                                    </p>
                                </div>
                                <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full">
                                    <p className="text-sm font-black text-amber-500">
                                        {questionsRemaining} remaining
                                    </p>
                                </div>
                            </div>

                            {/* Question Timer */}
                            <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border ${questionTimeRemaining <= 5
                                    ? 'bg-red-500/10 border-red-500/30 animate-pulse'
                                    : 'bg-white/5 border-white/10'
                                }`}>
                                <Clock className={`w-5 h-5 ${questionTimeRemaining <= 5 ? 'text-red-500' : 'text-amber-500'}`} />
                                <span className={`text-2xl font-black ${questionTimeRemaining <= 5 ? 'text-red-500' : ''}`}>
                                    {questionTimeRemaining}s
                                </span>
                            </div>
                        </div>

                        {/* Question Card */}
                        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-12 backdrop-blur-3xl mb-8">
                            <h3 className="text-3xl md:text-4xl font-black mb-8 leading-tight">
                                {currentQuestion.question}
                            </h3>

                            {/* Options */}
                            <div className="space-y-4">
                                {currentQuestion.options.map((option, index) => {
                                    const isSelected = selectedOption === index;
                                    const isCorrectOption = index === currentQuestion.correctAnswer;
                                    const showCorrect = showResult && isCorrectOption;
                                    const showWrong = showResult && isSelected && !isCorrectOption;

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => !showResult && setSelectedOption(index)}
                                            disabled={showResult}
                                            className={`w-full p-6 rounded-2xl border-2 text-left font-bold transition-all duration-300 flex items-center gap-4 ${showCorrect
                                                    ? 'bg-green-500/20 border-green-500 text-green-500'
                                                    : showWrong
                                                        ? 'bg-red-500/20 border-red-500 text-red-500'
                                                        : isSelected
                                                            ? 'bg-amber-500/20 border-amber-500 text-amber-500 scale-[1.02]'
                                                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                                } ${showResult ? 'cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
                                        >
                                            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-black ${showCorrect
                                                    ? 'border-green-500 bg-green-500/20'
                                                    : showWrong
                                                        ? 'border-red-500 bg-red-500/20'
                                                        : isSelected
                                                            ? 'border-amber-500 bg-amber-500/20'
                                                            : 'border-white/20'
                                                }`}>
                                                {String.fromCharCode(65 + index)}
                                            </div>
                                            <span className="flex-1">{option}</span>
                                            {showCorrect && <CheckCircle className="w-6 h-6" />}
                                            {showWrong && <XCircle className="w-6 h-6" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Submit Button */}
                        {!showResult && (
                            <button
                                onClick={handleSubmit}
                                disabled={selectedOption === null}
                                className={`w-full py-6 rounded-2xl font-black uppercase tracking-widest text-sm transition-all ${selectedOption !== null
                                        ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-xl shadow-amber-500/20 active:scale-95'
                                        : 'bg-white/5 text-white/30 cursor-not-allowed'
                                    }`}
                            >
                                Submit Answer
                            </button>
                        )}

                        {/* Result Feedback */}
                        {showResult && (
                            <div className={`p-6 rounded-2xl border text-center animate-in fade-in zoom-in duration-300 ${isCorrect
                                    ? 'bg-green-500/10 border-green-500/30'
                                    : 'bg-red-500/10 border-red-500/30'
                                }`}>
                                <p className={`text-xl font-black ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                                    {isCorrect ? '✓ Correct!' : '✗ Wrong Answer'}
                                </p>
                                {isCorrect && (
                                    <p className="text-sm opacity-70 mt-2">
                                        +{Math.floor((questionTimeRemaining / currentQuestion.timeLimit) * 100)} points
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
