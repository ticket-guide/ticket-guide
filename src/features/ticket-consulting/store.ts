import { create } from 'zustand';

interface ConsultingStore {
    isModalOpen: boolean;
    selectedCompanyId: number | null;
    selectedCompanyName: string;
    openModal: (id: number, name: string) => void;
    closeModal: () => void;
}

export const useConsultingStore = create<ConsultingStore>((set) => ({
    isModalOpen: false,
    selectedCompanyId: null,
    selectedCompanyName: '',
    openModal: (id, name) => set({ isModalOpen: true, selectedCompanyId: id, selectedCompanyName: name }),
    closeModal: () => set({ isModalOpen: false, selectedCompanyId: null, selectedCompanyName: '' }),
}));
