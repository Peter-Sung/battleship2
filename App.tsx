
import React, { useState } from 'react';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import Modal from './components/ui/Modal';
import Button from './components/ui/Button';

type Page = 'home' | 'game';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const startGame = () => {
    setCurrentPage('game');
  };

  const goHome = () => {
    setCurrentPage('home');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'game':
        return <GamePage onGoHome={goHome} />;
      case 'home':
      default:
        return <HomePage onStartGame={startGame} onOpenModal={handleOpenModal} />;
    }
  };

  return (
    <>
      <Layout onOpenModal={handleOpenModal}>
        {renderPage()}
      </Layout>
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title="안내"
      >
        <p className="mb-6">열심히 만들고 있어요! 곧 찾아올게요.</p>
        <div className="flex justify-center">
          <Button onClick={handleCloseModal} variant="primary" size="medium">
            확인
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default App;
