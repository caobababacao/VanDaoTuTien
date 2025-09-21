import React from 'react';

type GameOverViewProps = {
  reason: string;
  onRestart: () => void;
};

const GameOverView: React.FC<GameOverViewProps> = ({ reason, onRestart }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-black bg-opacity-75 rounded-lg border-2 border-red-500">
      <h2 className="text-6xl font-bold text-red-600 mb-4">KẾT THÚC</h2>
      <p className="text-xl text-gray-300 mb-8 max-w-prose">
        {reason}
      </p>
      <button 
        onClick={onRestart}
        className="bg-gray-200 hover:bg-white text-black font-bold py-3 px-8 rounded-lg text-lg transition-colors"
      >
        Chơi Lại
      </button>
    </div>
  );
};

export default GameOverView;
