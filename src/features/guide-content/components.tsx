'use client';

import React from 'react';
import { getGuideSections, getGuideSteps } from './logic';
import { AlertCircle, CheckCircle2, Info, Scale } from 'lucide-react';

export const GuideContentSection = () => {
    const sections = getGuideSections();
    const steps = getGuideSteps();

    const getIcon = (type: string) => {
        switch (type) {
            case 'info': return <Info className="text-blue-500 w-8 h-8" />;
            case 'warning': return <AlertCircle className="text-amber-500 w-8 h-8" />;
            case 'legal': return <Scale className="text-red-500 w-8 h-8" />;
            case 'check': return <CheckCircle2 className="text-green-500 w-8 h-8" />;
            default: return null;
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-12 mt-16 animate-slide-up">
            {/* 1. 예약판매란? (도식화 추가) */}
            <section className="glass-effect bg-white/60 dark:bg-zinc-900/60 p-8 rounded-3xl shadow-md border border-gray-200 dark:border-zinc-800 transition-transform hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-6">
                    {getIcon('info')}
                    <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                        상품권 예약판매란?
                    </h2>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg mb-8">
                    판매자가 발송 가능날에 맞춰 상품권을 확보할 수 있다면, 상품권 매매업체로부터 <strong>판매대금을 선입금 받은 후</strong>, 약속된 날짜에 상품권을 발송하는 거래방식입니다.
                </p>

                <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-blue-100 dark:border-blue-800/30">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-4 sm:mb-6 flex items-center gap-2">
                        <CheckCircle2 size={20} /> 예약판매 거래 과정 예시
                    </h3>
                    <div className="flex flex-col gap-6 bg-[#b2c7d9]/20 dark:bg-black/20 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-inner border border-[#b2c7d9]/30 dark:border-zinc-800">
                        {steps.map((s) => {
                            const isMe = s.actor.includes('나');
                            return (
                                <div key={s.step} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    {/* 상대방 프로필 추가 영역 (왼쪽) */}
                                    {!isMe && (
                                        <div className="mr-2 sm:mr-3 mt-4 shrink-0">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[40%] bg-white dark:bg-zinc-700 flex items-center justify-center shadow-sm border border-gray-200 dark:border-zinc-600">
                                                <span className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200">업체</span>
                                            </div>
                                        </div>
                                    )}
                                    <div className={`flex flex-col max-w-[90%] sm:max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                                        <div className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1 px-1 font-medium">{s.actor}</div>
                                        <div className="relative">
                                            {/* 말풍선 꼬리 (SVG) */}
                                            {isMe ? (
                                                <svg className="absolute text-primary w-3 h-4 right-[-7px] top-[10px]" viewBox="0 0 10 14" fill="currentColor">
                                                    <path d="M0 0 H10 L0 14 Z" />
                                                </svg>
                                            ) : (
                                                <svg className="absolute text-white dark:text-zinc-800 w-3 h-4 left-[-7px] top-[10px]" viewBox="0 0 10 14" fill="currentColor">
                                                    <path d="M10 0 H0 L10 14 Z" />
                                                </svg>
                                            )}

                                            <div className={`relative z-10 p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-sm text-sm sm:text-base leading-snug break-words animate-fade-in ${isMe
                                                    ? 'bg-primary text-white rounded-tr-sm'
                                                    : 'bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-200 rounded-tl-sm border border-gray-100 dark:border-zinc-700'
                                                }`}>
                                                {s.description}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* 2. 주의사항 및 리스크 */}
            <section className="glass-effect bg-white/60 dark:bg-zinc-900/60 p-8 rounded-3xl shadow-md border border-gray-200 dark:border-zinc-800 transition-transform hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-6">
                    {getIcon('warning')}
                    <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400">
                        주의사항 및 리스크
                    </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-amber-50/50 dark:bg-amber-900/10 p-6 rounded-2xl border border-amber-100 dark:border-amber-800/30">
                        <h3 className="font-bold text-amber-800 dark:text-amber-400 mb-4 text-lg border-b border-amber-200 dark:border-amber-800/50 pb-2">판매자 주의사항</h3>
                        <ul className="space-y-3">
                            {(sections.find(s => s.id === 'warning')?.content as any).seller.map((text: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                                    <span className="text-amber-500 mt-1">•</span> {text}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-amber-50/50 dark:bg-amber-900/10 p-6 rounded-2xl border border-amber-100 dark:border-amber-800/30">
                        <h3 className="font-bold text-amber-800 dark:text-amber-400 mb-4 text-lg border-b border-amber-200 dark:border-amber-800/50 pb-2">구매자 주의사항</h3>
                        <ul className="space-y-3">
                            {(sections.find(s => s.id === 'warning')?.content as any).buyer.map((text: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                                    <span className="text-amber-500 mt-1">•</span> {text}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* 3. 미발송 시 법적 처벌 */}
            <section className="glass-effect bg-red-50/30 dark:bg-red-900/10 p-8 rounded-3xl shadow-md border border-red-200 dark:border-red-900/30 transition-transform hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-6">
                    {getIcon('legal')}
                    <h2 className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400">
                        미발송 시 형사/민사상 법적 처벌
                    </h2>
                </div>
                <p className="text-red-800 dark:text-red-200 font-medium text-lg mb-6 bg-red-100/50 dark:bg-red-900/30 p-4 rounded-xl">
                    ⚠️ 상품권을 발송하지 못하면 사기죄로 처벌받습니다!
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { tag: '💰', title: '형사 처벌', desc: '최대 10년 징역 또는 2천만원 벌금' },
                        { tag: '⚖️', title: '전과 기록', desc: '평생 범죄 경력 남음' },
                        { tag: '🚫', title: '취업 제한', desc: '공공기관, 금융권 취업 불가' },
                        { tag: '📝', title: '신용 불량', desc: '대출, 카드 발급 제한' },
                    ].map((item, idx) => (
                        <div key={idx} className="bg-white dark:bg-zinc-800 p-4 rounded-2xl text-center border border-red-100 dark:border-red-900/50 shadow-sm">
                            <div className="text-3xl mb-2">{item.tag}</div>
                            <div className="font-bold text-gray-900 dark:text-white mb-1">{item.title}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">{item.desc}</div>
                        </div>
                    ))}
                </div>
                <p className="text-center mt-6 text-red-600 dark:text-red-400 font-bold">
                    발송할 수 없는 날짜는 절대 약정하지 마세요. 약속은 반드시 지켜야 합니다!
                </p>
            </section>

            {/* 4. 결론 */}
            <section className="glass-effect bg-green-50/50 dark:bg-green-900/10 p-8 rounded-3xl shadow-md border border-green-200 dark:border-green-900/30 transition-transform hover:-translate-y-1 text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                    {getIcon('check')}
                    <h2 className="text-2xl sm:text-3xl font-bold text-green-700 dark:text-green-400">
                        신뢰와 약속이 가장 중요합니다
                    </h2>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-lg max-w-2xl mx-auto">
                    모든 거래 조건을 명확히 하고, 약정을 반드시 지키는 것이 장기적으로 성공적인 거래를 이어갈 수 있는 핵심입니다.
                </p>
            </section>
        </div>
    );
};
