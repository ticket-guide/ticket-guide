import { create } from 'zustand';
import { ConsultingType, ConsultingState } from './types';

interface ConsultingStore extends ConsultingState {
    openModal: (type: ConsultingType) => void;
    closeModal: () => void;
}

export const useConsultingStore = create<ConsultingStore>((set) => ({
    isModalOpen: false,
    selectedType: null,
    openModal: (type) => set({ isModalOpen: true, selectedType: type }),
    closeModal: () => set({ isModalOpen: false, selectedType: null }),
}));
