import React from 'react';
import { ExplorationState } from '../types';

type ExplorationViewProps = {
  exploration: ExplorationState;
  onMakeChoice: (choice: string) => void;
};

const ExplorationView: React.FC<ExplorationViewProps> = ({ exploration, onMakeChoice }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <h2 className="text-2xl font-semibold text-yellow-400 mb-4">Lịch Luyện</h2>
      <p className="text-lg text-gray-300 mb-6 max-w-prose italic">
        {exploration.prompt}
      </p>

      <div className="w-full max-w-md space-y-3">
        {exploration.options.map((option, index) => (
          <button 
            key={index} 
            onClick={() => onMakeChoice(option)}
            className="w-full bg-gray-700 hover:bg-red-800 text-white font-semibold py-3 px-5 rounded-lg transition-colors duration-200"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ExplorationView;
