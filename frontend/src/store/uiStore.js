import { create } from 'zustand';

const useUIStore = create((set) => ({
    // Theme state
    darkMode: true,
    toggleDarkMode: () => set((state) => {
        const newDarkMode = !state.darkMode;
        if (newDarkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
        return { darkMode: newDarkMode };
    }),
    setDarkMode: (isDark) => set(() => {
        if (isDark) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
        return { darkMode: isDark };
    }),

    // Modal state
    activeModal: null,
    modalData: { email: '', mode: '', otp: '', userName: '', password: '' },
    
    // Actions
    setActiveModal: (modalName) => set({ activeModal: modalName }),
    closeModal: () => set({ activeModal: null, modalData: { email: '', mode: '', otp: '', userName: '', password: '' } }),
    switchModal: (modalName, data = {}) => set((state) => ({
        activeModal: modalName,
        modalData: { ...state.modalData, ...data }
    })),
}));

export default useUIStore;
