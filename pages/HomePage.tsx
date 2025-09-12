
import React from 'react';
import Button from '../components/ui/Button';
import InformationCircleIcon from '../components/icons/InformationCircleIcon';

interface HomePageProps {
  onStartGame: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onStartGame }) => {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center relative rounded-lg overflow-hidden shadow-2xl shadow-cyan-500/20">
        <img
          src="https://picsum.photos/1200/500?grayscale&blur=2&random=1"
          alt="Naval battle background"
          className="w-full h-80 object-cover"
        />
        <div className="absolute inset-0 bg-gray-900 bg-opacity-70 flex flex-col justify-center items-center p-8">
          <h2 className="text-5xl font-black text-white uppercase tracking-widest">
            전장의 지배자
          </h2>
          <p className="mt-4 text-lg text-cyan-300 max-w-2xl">
            전략을 세워 함대를 배치하고, 적의 위치를 정확히 예측하여 승리를 쟁취하세요. 지금 바로 장대한 해상 전투에 참여하세요!
          </p>
          <div className="mt-8">
            <Button variant="primary" size="large" onClick={onStartGame}>
              게임하기
            </Button>
          </div>
        </div>
      </section>

      {/* How to Play Section */}
      <section className="bg-gray-800 bg-opacity-50 p-8 rounded-lg shadow-lg">
        <h3 className="text-3xl font-bold text-center text-cyan-400 mb-6 flex items-center justify-center gap-3">
          <InformationCircleIcon className="w-8 h-8" />
          게임 방법
        </h3>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="border border-cyan-700 p-6 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors">
            <div className="text-cyan-400 text-3xl font-black mb-2">1단계</div>
            <h4 className="text-xl font-bold mb-2">함대 배치</h4>
            <p className="text-gray-400">
              자신의 격자판에 5척의 함선을 전략적으로 배치하세요. 함선은 가로 또는 세로로만 배치할 수 있으며, 서로 겹칠 수 없습니다.
            </p>
          </div>
          <div className="border border-cyan-700 p-6 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors">
            <div className="text-cyan-400 text-3xl font-black mb-2">2단계</div>
            <h4 className="text-xl font-bold mb-2">좌표 공격</h4>
            <p className="text-gray-400">
              상대방의 격자판에서 좌표를 선택하여 공격합니다. 상대방의 함선을 맞추면 한 번 더 공격할 기회가 주어집니다.
            </p>
          </div>
          <div className="border border-cyan-700 p-6 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors">
            <div className="text-cyan-400 text-3xl font-black mb-2">3단계</div>
            <h4 className="text-xl font-bold mb-2">함대 격침</h4>
            <p className="text-gray-400">
              상대방의 모든 함선을 먼저 격침시키는 플레이어가 최종 승리합니다. 정확한 추리와 전략이 승리의 열쇠입니다.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;