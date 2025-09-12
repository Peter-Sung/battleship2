import React from 'react';

const Header: React.FC = () => {
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
        </div>
      </div>
    </header>
  );
};

export default Header;
