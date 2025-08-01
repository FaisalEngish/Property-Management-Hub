import { useState, useEffect, useCallback } from 'react';

interface ModalState {
  isOpen: boolean;
  type: string | null;
  lastOpenTime: number | null;
}

export function useModalManager() {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    type: null,
    lastOpenTime: null,
  });

  const [isStuck, setIsStuck] = useState(false);

  // Auto-detect stuck UI (background remains dark >1.5s after modal opens)
  useEffect(() => {
    if (modalState.isOpen && modalState.lastOpenTime) {
      const timer = setTimeout(() => {
        const timeSinceOpen = Date.now() - modalState.lastOpenTime!;
        if (timeSinceOpen > 1500) {
          setIsStuck(true);
        }
      }, 1600);

      return () => clearTimeout(timer);
    } else {
      setIsStuck(false);
    }
  }, [modalState.isOpen, modalState.lastOpenTime]);

  // ESC key listener
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && modalState.isOpen) {
        forceCloseAll();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [modalState.isOpen]);

  const openModal = useCallback((type: string) => {
    setModalState({
      isOpen: true,
      type,
      lastOpenTime: Date.now(),
    });
    setIsStuck(false);
  }, []);

  const closeModal = useCallback(() => {
    setModalState({
      isOpen: false,
      type: null,
      lastOpenTime: null,
    });
    setIsStuck(false);
  }, []);

  const forceCloseAll = useCallback(() => {
    // Remove any overlay or backdrop elements
    const overlays = document.querySelectorAll('[data-radix-popper-content-wrapper]');
    overlays.forEach(overlay => overlay.remove());

    // Remove any portal content
    const portals = document.querySelectorAll('[data-radix-portal]');
    portals.forEach(portal => portal.remove());

    // Clear modal state
    setModalState({
      isOpen: false,
      type: null,
      lastOpenTime: null,
    });
    setIsStuck(false);

    // Re-enable body scroll if disabled
    document.body.style.overflow = '';
    document.body.style.pointerEvents = '';

    // Clear any stuck z-index issues
    const body = document.body;
    body.style.position = '';
    body.style.zIndex = '';
  }, []);

  return {
    modalState,
    isStuck,
    openModal,
    closeModal,
    forceCloseAll,
  };
}