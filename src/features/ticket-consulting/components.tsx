'use client';

import React from 'react';
import { useConsultingStore } from './store';
import { getConsultingOptions, getQrCodeUrlForType, getModalTitleForType } from './logic';
import { ConsultingType } from './types';
import { X, MessageCircle } from 'lucide-react';

export const ConsultingButtons = () => {
    const openModal = useConsultingStore((state) => state.openModal);
    const options = getConsultingOptions();

    return (
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-8">
            {options.map((option) => (
                <button
                    key={option.id}
                    onClick={() => openModal(option.id)}
                    className="flex-1 min-w-[200px] text-white bg-primary hover:bg-primary-dark transition-all duration-300 py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 flex flex-col items-center justify-center gap-2"
                >
                    <MessageCircle size={28} />
                    <span className="font-bold text-lg">{option.label}</span>
                    <span className="text-sm opacity-80 whitespace-nowrap">{option.description}</span>
                </button>
            ))}
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
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={closeModal}
            />

            {/* 모달 컨텐츠 */}
            <div className="relative glass-effect bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-slide-up z-10 flex flex-col items-center">
                <button
                    onClick={closeModal}
                    className="absolute right-6 top-6 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-extrabold mb-2 text-primary">
                    {getModalTitleForType(selectedType)}
                </h2>
                <p className="text-sm text-gray-500 mb-8 text-center">
                    QR 코드를 스캔하여 24시간 실시간 상담을 시작하세요.
                </p>

                <div className="w-48 h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-primary/20 p-2">
                    {/* 실제 이미지 연결 전에 보여줄 더미 상태 */}
                    <div className="w-full h-full bg-white rounded-xl flex items-center justify-center text-gray-400 border border-dashed border-gray-300">
                        <div className="text-center">
                            <MessageCircle className="mx-auto mb-2 opacity-50" size={32} />
                            <span className="text-xs">{selectedType} QR</span>
                        </div>
                        {/* 
              // TODO: 실제 QR 이미지 에셋 준비 시 대체
              // <img src={getQrCodeUrlForType(selectedType)} alt="QR Code" className="w-full h-full object-contain" />
            */}
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="font-medium">또는 아래 메신저 검색창 활용</p>
                    <p className="text-sm text-gray-500 mt-1">@티켓가이드상담</p>
                </div>
            </div>
        </div>
    );
};
