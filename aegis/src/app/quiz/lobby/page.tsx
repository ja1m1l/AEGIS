"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowLeft, Trophy, Clock, Users, Play } from 'lucide-react';

const Antigravity = dynamic(() => import('@/components/AntigravityInteractive'), {
    ssr: false,
    loading: () => <div className="absolute inset-0 z-0 bg-transparent" />,
});

// Mock participants data
const MOCK_PARTICIPANTS = [
    { id: '1', name: 'Sarah Johnson', handle: 'sarahj', avatar: null },
    { id: '2', name: 'Alex Chen', handle: 'alexc', avatar: null },
    { id: '3', name: 'Maya Patel', handle: 'mayap', avatar: null },
    { id: '4', name: 'Jordan Smith', handle: 'jsmith', avatar: null },
    { id: '5', name: 'Chris Lee', handle: 'chrisl', avatar: null },
];

function QuizLobbyContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const startTimeParam = searchParams.get('start');

    const [isDark] = useState(true);
    const [participants, setParticipants] = useState([MOCK_PARTICIPANTS[0]]);
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

    // Initialize and maintain timer
    useEffect(() => {
        const updateTimer = () => {
            if (startTimeParam) {
                const target = new Date(startTimeParam).getTime();
                const now = new Date().getTime();
                const diff = Math.max(0, Math.floor((target - now) / 1000));
                setTimeRemaining(diff);
                return diff;
            } else {
                // Fallback demo mode: simple countdown if no start time
                setTimeRemaining(prev => {
                    if (prev === null) return 60;
                    return Math.max(0, prev - 1);
                });
                return null;
            }
        };

        const initialDiff = updateTimer(); // Initial call

        const interval = setInterval(() => {
            const remaining = updateTimer();
            if (startTimeParam && remaining !== null && remaining <= 0) {
                // Timer ends logic handled in effect below
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [startTimeParam]);

    // Handle navigation when timer ends
    useEffect(() => {
        if (timeRemaining === 0) {
            router.push('/quiz/play');
        }
    }, [timeRemaining, router]);

    // Simulate participants joining
    useEffect(() => {
        const timeouts = [
            setTimeout(() => setParticipants(prev => [...prev, MOCK_PARTICIPANTS[1]]), 3000),
            setTimeout(() => setParticipants(prev => [...prev, MOCK_PARTICIPANTS[2]]), 8000),
            setTimeout(() => setParticipants(prev => [...prev, MOCK_PARTICIPANTS[3]]), 15000),
            setTimeout(() => setParticipants(prev => [...prev, MOCK_PARTICIPANTS[4]]), 25000),
        ];
        return () => timeouts.forEach(clearTimeout);
    }, []);

    const formatTime = (seconds: number | null) => {
        if (seconds === null) return "--:--";
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const getGradientColor = (index: number) => {
        const gradients = [
            'from-amber-500/20 to-orange-500/20 border-amber-500/30',
            'from-purple-500/20 to-pink-500/20 border-purple-500/30',
            'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
            'from-green-500/20 to-emerald-500/20 border-green-500/30',
            'from-red-500/20 to-rose-500/20 border-red-500/30',
        ];
        return gradients[index % gradients.length];
    };

    return (
        <div className={`min-h-screen relative transition-colors duration-700 flex flex-col items-center justify-center p-6 ${isDark ? 'bg-[#050505] text-white' : 'bg-[#fafafa] text-black'}`}>
            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <Antigravity count={80} magnetRadius={4} ringRadius={4} color={isDark ? "#ffffff" : "#F59E0B"} />
                <div className={`absolute bottom-[-20%] left-[-10%] w-[80%] h-[80%] blur-[200px] rounded-full opacity-20 ${isDark ? 'bg-amber-900' : 'bg-amber-200'}`} />
            </div>

            <div className="relative z-10 w-full max-w-4xl">
                <button
                    onClick={() => router.push('/quiz')}
                    className={`absolute top-0 left-0 p-3 rounded-full transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-black/5 hover:bg-black/10 text-black'}`}
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>

                <div className={`mt-16 p-8 md:p-12 rounded-[3rem] border backdrop-blur-3xl relative overflow-hidden ${isDark ? 'bg-white/5 border-white/10 shadow-2xl' : 'bg-white border-black/5 shadow-xl'}`}>
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="flex justify-center mb-6">
                            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center ${isDark ? 'bg-amber-500/10 text-amber-500' : 'bg-amber-50 text-amber-600'}`}>
                                <Trophy className="w-10 h-10 drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]" />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight italic uppercase">Quiz Lobby</h1>

                        {startTimeParam && (
                            <div className="mb-2 px-6 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 inline-flex items-center gap-2 text-amber-500 font-bold uppercase tracking-widest text-xs animate-in slide-in-from-bottom-2 fade-in duration-700">
                                <Clock className="w-4 h-4" />
                                Starts at {new Date(startTimeParam).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        )}

                        <p className="text-lg opacity-60 font-bold mt-2">Waiting for quiz to start...</p>
                    </div>

                    {/* Timer */}
                    <div className="flex justify-center mb-12">
                        <div className={`relative w-48 h-48 rounded-full border-8 flex items-center justify-center transition-all duration-300 ${(timeRemaining !== null && timeRemaining <= 10)
                            ? 'border-red-500 animate-pulse shadow-[0_0_40px_rgba(239,68,68,0.5)]'
                            : 'border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.3)]'
                            }`}>
                            <div className="text-center">
                                <Clock className={`w-8 h-8 mx-auto mb-2 opacity-50 ${(timeRemaining !== null && timeRemaining <= 10) ? 'animate-bounce' : ''}`} />
                                <div className={`text-5xl font-black transition-colors ${(timeRemaining !== null && timeRemaining <= 10) ? 'text-red-500' : ''}`}>
                                    {formatTime(timeRemaining)}
                                </div>
                                <div className="text-xs uppercase font-bold tracking-widest opacity-40 mt-2">
                                    {(timeRemaining !== null && timeRemaining <= 10) ? 'Starting Soon!' : 'Time Remaining'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Participants Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-center gap-3 mb-8">
                            <Users className="w-5 h-5 opacity-50" />
                            <h2 className="text-2xl font-black tracking-tight">Participants ({participants.length})</h2>
                        </div>
                        <div className="flex flex-wrap justify-center gap-6 min-h-[120px]">
                            {participants.map((participant, index) => (
                                <div key={participant.id} className="flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-500" style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}>
                                    <div className={`relative w-20 h-20 rounded-full border-4 flex items-center justify-center overflow-hidden bg-gradient-to-br ${getGradientColor(index)} transition-all duration-300 hover:scale-110 hover:shadow-xl cursor-pointer`}>
                                        {participant.avatar ? <img src={participant.avatar} alt={participant.name} className="w-full h-full object-cover" /> : <span className="text-2xl font-black">{getInitials(participant.name)}</span>}
                                        <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-4 border-[#050505]"><div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75" /></div>
                                    </div>
                                    <div className="text-center"><p className="text-sm font-bold">{participant.name}</p><p className="text-xs opacity-50 font-bold">@{participant.handle}</p></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className={`mb-8 p-4 rounded-2xl border ${isDark ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-black/5'}`}>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-black uppercase tracking-widest opacity-50">Quiz Progress</span>
                            <span className="text-xs font-black">{timeRemaining !== null ? 'Waiting...' : '0%'}</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 w-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                        </div>
                    </div>

                    {/* Info */}
                    <div className={`p-6 rounded-2xl border text-center ${isDark ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-black/5'}`}>
                        <p className="text-sm opacity-70 flex items-center justify-center gap-2 font-bold"><Play className="w-4 h-4" /> The quiz will start automatically when the timer reaches zero</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function QuizLobbyPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">Loading...</div>}>
            <QuizLobbyContent />
        </Suspense>
    );
}
