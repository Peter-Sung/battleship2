
import React from 'react';
import Button from '../components/ui/Button';
import InformationCircleIcon from '../components/icons/InformationCircleIcon';
import ShipSelectIcon from '../components/icons/ShipSelectIcon';
import PlayIcon from '../components/icons/PlayIcon';

interface HomePageProps {
  onStartGame: () => void;
  onOpenModal: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onStartGame, onOpenModal }) => {
  const handleComingSoon = () => {
    onOpenModal();
  };
  
  return (
    <div className="space-y-16">
      <section className="bg-gray-800 bg-opacity-50 p-8 rounded-lg shadow-lg">
        <h3 className="text-4xl font-bold text-center text-cyan-400 mb-10 flex items-center justify-center gap-3">
          <InformationCircleIcon className="w-9 h-9" />
          게임 방법
        </h3>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {/* Step 1 */}
          <div className="flex flex-col items-center gap-4 border border-cyan-700 p-6 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors">
            <ShipSelectIcon className="w-20 h-20 text-cyan-400 mb-3"/>
            <div className="text-cyan-400 text-4xl font-black mb-2">1단계</div>
            <h4 className="text-2xl font-bold mb-2">함선 선택하기</h4>
            <p className="text-gray-300 text-lg flex-grow">
              오른쪽 함선 목록에서 배치할 함선을 클릭하여 선택하세요.
            </p>
          </div>
          {/* Step 2 */}
          <div className="flex flex-col items-center gap-4 border border-cyan-700 p-6 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors">
            <div className="flex items-center justify-center gap-2 text-cyan-400 mb-3 h-20">
              <div className="flex items-center justify-center w-14 h-14 border-2 border-cyan-600 rounded-md bg-gray-900">
                  <span className="text-2xl font-bold">R</span>
              </div>
              <span className="text-xl font-bold">또는</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="6" y="3" width="12" height="18" rx="3" stroke="currentColor"/>
                  <path d="M12 3v8" stroke="currentColor"/>
                  <rect x="12" y="3" width="6" height="8" fill="rgba(34, 211, 238, 0.2)"/>
              </svg>
            </div>
            <div className="text-cyan-400 text-4xl font-black mb-2">2단계</div>
            <h4 className="text-2xl font-bold mb-2">나의 함대에 배치하기</h4>
            <p className="text-gray-300 text-lg flex-grow">
              선택한 함선을 왼쪽 나의 함대에 배치하세요. <br/> <span className="font-bold text-cyan-200">[R] 키</span> 또는 <span className="font-bold text-cyan-200">마우스 우클릭</span>으로 함선 방향을 회전할 수 있습니다.
            </p>
          </div>
          {/* Step 3 */}
          <div className="flex flex-col items-center gap-4 border border-cyan-700 p-6 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors">
            <PlayIcon className="w-20 h-20 text-cyan-400 mb-3"/>
            <div className="text-cyan-400 text-4xl font-black mb-2">3단계</div>
            <h4 className="text-2xl font-bold mb-2">전투 시작하기</h4>
            <p className="text-gray-300 text-lg flex-grow">
              5척의 함선을 모두 배치했다면 '게임 시작' 버튼을 눌러 전투를 시작하세요! '자동 배치'로 한번에 배치하거나 '초기화'로 다시 시작할 수도 있습니다.
            </p>
          </div>
        </div>
      </section>
      
      {/* Call to Action Section */}
      <section className="text-center">
        <div className="flex justify-center gap-6">
          <Button variant="primary" size="large" onClick={onStartGame}>
            혼자하기
          </Button>
          <Button variant="secondary" size="large" onClick={handleComingSoon}>
            함께하기
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
