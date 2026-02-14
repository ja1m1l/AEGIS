"use client";

import React from 'react';
import Header from './ui/Header';
import SlidingNavbar from './ui/SlidingNavbar';
import { useAppContext } from './AppProvider';
import { usePathname } from 'next/navigation';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const { isDark } = useAppContext();
    const pathname = usePathname();
    const isAuthPage = pathname === '/login' || pathname === '/signup';
    const isAdminPage = pathname.startsWith('/admin');

    return (
        <div className={`min-h-screen selection:bg-indigo-500/30 overflow-x-hidden transition-all duration-700 ease-in-out ${isDark ? 'bg-[#050505] text-white' : 'bg-[#fafafa] text-black'
            }`}>
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div
                    className={`absolute top-[-20%] left-[-10%] w-[80%] h-[80%] blur-[200px] rounded-full transition-all duration-1000 ${isDark
                        ? 'bg-white/5 opacity-100'
                        : 'bg-black/5 opacity-60'
                        }`}
                />

                <div
                    className={`absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] blur-[200px] rounded-full transition-all duration-1000 ${isDark
                        ? 'bg-white/5 opacity-100'
                        : 'bg-black/5 opacity-40'
                        }`}
                />

                <div
                    className={`absolute top-0 right-[-5%] w-[50%] h-full transition-all duration-1000 z-0 ${isDark
                        ? 'bg-gradient-to-l from-white/10 to-transparent'
                        : 'bg-gradient-to-l from-black/5 to-transparent'
                        }`}
                />
            </div>

            {!isAuthPage && !isAdminPage && <Header />}
            {!isAuthPage && !isAdminPage && <SlidingNavbar isDark={isDark} />}

            <main className="relative z-10">
                {children}
            </main>

            {/* Footer / Aegis Guard Core Badge */}
            {/* Footer / Aegis Guard Core Badge */}
            {/* Footer / Aegis Guard Core Badge */}
            {!isAuthPage && !isAdminPage && (
                <div className={`fixed bottom-6 left-6 z-50 hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl border backdrop-blur-2xl transition-all duration-500 hover:scale-100 scale-90 origin-bottom-left ${isDark ? 'bg-black/40 border-white/10 shadow-2xl shadow-indigo-500/20' : 'bg-white/80 border-black/10 shadow-xl'
                    }`}>
                    <div className="relative">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]" />
                        <div className="absolute inset-[-4px] rounded-full bg-emerald-500/20 animate-ping" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase tracking-[0.25em] leading-none mb-1">Aegis Guard Core</span>
                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest transition-opacity opacity-60">Protocol 15.0 Active</span>
                    </div>
                </div>
            )}
        </div>
    );
}
