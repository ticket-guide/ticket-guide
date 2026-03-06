'use client';

import React, { useState } from 'react';
import { useConsultingStore } from './store';
import { getCompanies, getQrCodeUrlForType, getModalTitleForType } from './logic';
import { X, MessageCircle, BadgeCheck, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

const getThemeClasses = (key?: string) => {
    switch (key) {
        // 배경을 다크 톤 중심(zinc-800/90, 테두리 추가 등)으로 변경
        case 'blue': return 'bg-zinc-800 border-t-4 border-blue-500 shadow-md shadow-blue-500/10 text-gray-200';
        case 'purple': return 'bg-zinc-800 border-t-4 border-purple-500 shadow-md shadow-purple-500/10 text-gray-200';
        case 'emerald': return 'bg-zinc-800 border-t-4 border-emerald-500 shadow-md shadow-emerald-500/10 text-gray-200';
        case 'rose': return 'bg-zinc-800 border-t-4 border-rose-500 shadow-md shadow-rose-500/10 text-gray-200';
        case 'amber': return 'bg-zinc-800 border-t-4 border-amber-500 shadow-md shadow-amber-500/10 text-gray-200';
        default: return 'bg-zinc-800 border-t-4 border-gray-500 shadow-md text-gray-200';
    }
};

export const CompanyListSection = () => {
    const openModal = useConsultingStore((state) => state.openModal);
    const companies = getCompanies();
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div id="company-list-section" className="w-full mt-4 scroll-mt-24">

            {/* 펼치기 / 접기 토글 헤더 */}
            <div className="w-full max-w-[100rem] mx-auto flex items-center justify-between bg-zinc-900 text-white p-4 sm:p-5 rounded-2xl shadow-md cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center gap-3">
                    <BadgeCheck className="text-blue-400 w-6 h-6" />
                    <h2 className="text-lg sm:text-xl font-bold">인증된 검증 업체 목록</h2>
                </div>
                <button aria-label="Toggle Company List" className="p-2 bg-zinc-800 rounded-full hover:bg-zinc-700 transition">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
            </div>

            {/* 업체 리스트 그리드 (모바일 1열, 태블릿 2열, 큰 화면 최대 4열) - 아코디언 애니메이션 추가 */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 w-full max-w-[100rem] mx-auto transition-all duration-500 overflow-hidden ${isExpanded ? 'opacity-100 max-h-[8000px] mt-6' : 'opacity-0 max-h-0'}`}>
                {companies.map((company, index) => (
                    <div
                        key={company.id}
                        className={`group relative rounded-2xl p-4 sm:p-6 transition-all duration-300 flex flex-col h-full animate-fade-in ${getThemeClasses(company.themeKey)}`}
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        {/* 상단: 업체명 */}
                        <div className="flex flex-col mb-2">
                            <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 flex items-center gap-2 leading-tight">
                                {company.iconUrl && (
                                    <img src={company.iconUrl} alt="Crown Icon" className="w-6 h-6 sm:w-8 sm:h-8 object-contain shrink-0 drop-shadow-md" />
                                )}
                                {company.name}
                                <BadgeCheck className="text-blue-400 w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                            </h3>
                        </div>

                        {/* 중단: 설명 텍스트 (flex-grow를 통해 높이를 모두 채워 하단 영역을 밀어냄) */}
                        <p className="text-zinc-400 mb-4 text-sm sm:text-base leading-relaxed flex-grow">
                            {company.description}
                        </p>

                        {/* 하단: 상담 버튼 (항상 박스 아래 쪽에 위치) */}
                        <div className="mt-auto">
                            <button
                                onClick={() => openModal(company.id)}
                                className="w-full py-3 rounded-xl bg-white text-zinc-900 font-bold text-base sm:text-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden relative"
                            >
                                <MessageCircle className="w-5 h-5 shrink-0" /> 실시간 상담 연결
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const ConsultingQrModal = () => {
    const { isModalOpen, selectedType, closeModal } = useConsultingStore();

    if (!isModalOpen || !selectedType) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* 백그라운드 블러 오버레이 */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={closeModal}
            />

            {/* 모달 컨텐츠 */}
            <div className="relative glass-effect bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-slide-up z-10 flex flex-col items-center border border-white/20">
                <button
                    onClick={closeModal}
                    className="absolute right-5 top-5 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors bg-gray-100 dark:bg-zinc-800 rounded-full p-1.5"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl sm:text-2xl font-extrabold mb-2 text-primary text-center">
                    {getModalTitleForType(selectedType)}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mb-8 text-center px-4">
                    QR 코드를 스캔하여 24시간 실시간 상담을 시작하세요.
                </p>

                <div className="w-48 h-48 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-primary/20 p-2 shadow-inner">
                    {/* 실제 이미지 연결 전에 보여줄 더미 상태 */}
                    <div className="w-full h-full bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center text-gray-400 border border-dashed border-gray-300 dark:border-zinc-600">
                        <div className="text-center">
                            <MessageCircle className="mx-auto mb-2 opacity-50 text-primary" size={32} />
                            <span className="text-xs font-semibold">업체 상담 QR</span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center bg-gray-50 dark:bg-zinc-800/30 w-full rounded-2xl py-4 border border-gray-100 dark:border-zinc-800">
                    <p className="font-semibold text-gray-700 dark:text-gray-200 text-sm">또는 아래 메신저 검색창 활용</p>
                    <p className="text-sm font-bold text-primary mt-1">@티켓가이드상담</p>
                </div>
            </div>
        </div>
    );
};
