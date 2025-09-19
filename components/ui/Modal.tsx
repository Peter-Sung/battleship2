
import React, { useEffect } from 'react';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-gray-800 border-2 border-cyan-700 rounded-lg shadow-lg p-8 w-full max-w-md text-center transform animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-2xl font-bold text-cyan-400 mb-4">{title}</h3>
        <div className="text-gray-300 text-lg">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;