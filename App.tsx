
import React, { useState } from 'react';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';

type Page = 'home' | 'game';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const startGame = () => {
    setCurrentPage('game');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'game':
        return <GamePage />;
      case 'home':
      default:
        return <HomePage onStartGame={startGame} />;
    }
  };

  return (
    <Layout>
      {renderPage()}
    </Layout>
  );
};

export default App;