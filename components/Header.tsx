
import React from 'react';
import VisitorCounter from './VisitorCounter';
import Button from './ui/Button';

interface HeaderProps {
  onOpenModal: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenModal }) => {
  const handleDoubleClick = () => {
    window.dispatchEvent(new CustomEvent('toggleGodMode'));
  };

  return (
    <header
      className="bg-gray-900 bg-opacity-50 shadow-lg shadow-cyan-500/10"
      onDoubleClick={handleDoubleClick}
      title="Double-click to toggle AI ship visibility"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-3xl font-extrabold text-cyan-400">
              Battleship
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <VisitorCounter />
            <Button variant="secondary" size="small" onClick={onOpenModal}>
              로그인
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
