import React, { useState } from 'react';
import { SectStoryState, Character } from '../types';

type SectStoryViewProps = {
  storyState: SectStoryState;
  player: Character;
  onMakeChoice: (choice: string) => void;
  onEndStory: () => void;
};

const SectStoryView: React.FC<SectStoryViewProps> = ({ storyState, player, onMakeChoice, onEndStory }) => {
  const [customAction, setCustomAction] = useState('');

  const handleCustomActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customAction.trim()) {
      onMakeChoice(customAction.trim());
      setCustomAction('');
    }
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-lg border-2 border-green-500 flex flex-col h-full">
      <div className="flex justify-between items-center border-b border-gray-600 pb-3 mb-4">
        <h2 className="text-3xl font-bold text-green-400">Diễn Biến Tông Môn</h2>
        <button
            onClick={onEndStory}
            className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
            Tạm Dừng Quan Sát
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow overflow-hidden">
        {/* Main Narrative & Choices */}
        <div className="md:col-span-2 flex flex-col">
            <div className="bg-black/30 p-4 rounded-lg flex-grow mb-6 overflow-y-auto max-h-[60vh]">
                <p className="text-lg text-gray-200 whitespace-pre-wrap italic leading-relaxed">
                    {storyState.narrative}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {storyState.options.map((option, index) => (
                <button 
                    key={index} 
                    onClick={() => onMakeChoice(option)}
                    className="w-full text-left bg-gray-700 hover:bg-green-800 text-white font-semibold py-3 px-5 rounded-lg transition-colors duration-200"
                >
                    {option}
                </button>
                ))}
            </div>

            {/* Custom Action Input */}
            <form onSubmit={handleCustomActionSubmit} className="mt-6">
                <label htmlFor="custom-action" className="block text-sm font-medium text-gray-300 mb-2">Hoặc, mô tả hành động của bạn:</label>
                <div className="flex space-x-2">
                    <input
                        id="custom-action"
                        type="text"
                        value={customAction}
                        onChange={(e) => setCustomAction(e.target.value)}
                        placeholder="Ví dụ: 'Can thiệp vào cuộc cãi vã' hoặc 'Lặng lẽ lắng nghe'"
                        className="flex-grow bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:ring-green-500 focus:border-green-500"
                    />
                    <button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-gray-500"
                        disabled={!customAction.trim()}
                    >
                        Hành Động
                    </button>
                </div>
            </form>
        </div>

        {/* Log */}
        <div className="bg-gray-900/50 p-3 rounded-lg flex flex-col overflow-hidden">
             <h3 className="text-xl font-bold mb-3 text-green-400 flex-shrink-0">Nhật Ký Tông Môn</h3>
             <div className="overflow-y-auto flex-grow pr-2">
                <ul className="space-y-3 text-sm">
                    {[...storyState.log].reverse().map((entry) => (
                        <li key={entry.id} className={`${entry.message.startsWith('>') ? 'text-yellow-400' : 'text-gray-400'}`}>
                           {entry.message}
                        </li>
                    ))}
                </ul>
             </div>
        </div>
      </div>
    </div>
  );
};

export default SectStoryView;