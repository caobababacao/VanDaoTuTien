import React, { useState } from 'react';
import { GameState, InteractionStage, Item, Character } from '../types';

type InteractionViewProps = {
  gameState: GameState;
  onSelectInteractionType: (type: InteractionStage) => void;
  onGiftItem: (itemId: string) => void;
  onStartExploreTogether: () => void;
  onMakeChoice: (choice: string) => void;
  onEndInteraction: () => void;
};

const InteractionView: React.FC<InteractionViewProps> = ({ 
    gameState, 
    onSelectInteractionType, 
    onGiftItem,
    onStartExploreTogether,
    onMakeChoice, 
    onEndInteraction 
}) => {
    const { interaction, characters, inventory } = gameState;
    const [customAction, setCustomAction] = useState('');

    if (!interaction || !interaction.active || !interaction.characterId) return null;

    const character = characters.find(c => c.id === interaction.characterId);
    if (!character) return null;

    const genderColor = character.gender === 'Nữ' ? 'text-pink-300' : 'text-blue-300';

    const handleCustomActionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (customAction.trim()) {
            onMakeChoice(customAction.trim());
            setCustomAction('');
        }
    };
    
    const renderSelection = () => (
        <div className="w-full max-w-sm mx-auto space-y-4">
             <button 
              onClick={() => onSelectInteractionType('chatting')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-5 rounded-lg transition-colors text-lg"
            >
              Trò Chuyện
            </button>
            <button 
              onClick={() => onSelectInteractionType('gifting')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-5 rounded-lg transition-colors text-lg"
            >
              Tặng Quà
            </button>
             <button 
              onClick={onStartExploreTogether}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-5 rounded-lg transition-colors text-lg"
            >
              Cùng Lịch Luyện
            </button>
             <button 
              onClick={onEndInteraction}
              className="mt-6 text-gray-400 hover:text-white transition-colors"
            >
              (Rời đi)
            </button>
        </div>
    );

    const renderGifting = () => (
        <div className="w-full max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-center text-blue-300 mb-4">Chọn một vật phẩm để tặng</h3>
            {inventory.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-2">
                    {inventory.map(item => (
                        <button 
                            key={item.id}
                            onClick={() => onGiftItem(item.id)}
                            className="text-left bg-gray-700 hover:bg-blue-800 p-3 rounded-lg transition-colors"
                        >
                            <p className="font-bold text-yellow-300">{item.name}</p>
                            <p className="text-xs text-gray-400 italic">{item.description}</p>
                        </button>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 italic">Túi đồ của ngươi trống rỗng.</p>
            )}
            <button 
              onClick={onEndInteraction}
              className="mt-6 mx-auto block text-gray-400 hover:text-white transition-colors"
            >
              (Quay lại)
            </button>
        </div>
    );

    const renderChatting = () => {
        const { scene, options, outcome } = interaction;
        if (outcome) {
             return (
                 <div>
                    <div className="bg-black/30 p-4 rounded-lg flex-grow mb-6 overflow-y-auto max-h-[50vh]">
                        <p className="text-lg text-gray-200 whitespace-pre-wrap italic leading-relaxed">
                            {`${scene}\n\n${outcome}`}
                        </p>
                    </div>
                    <button 
                        onClick={onEndInteraction}
                        className="w-full max-w-sm mx-auto bg-gray-600 hover:bg-gray-500 text-white font-semibold py-3 px-5 rounded-lg transition-colors duration-200"
                    >
                        Kết thúc
                    </button>
                </div>
             );
        }

        return (
            <div className="w-full max-w-2xl mx-auto">
                <div className="bg-black/30 p-4 rounded-lg flex-grow mb-6 overflow-y-auto max-h-[50vh]">
                    <p className="text-lg text-gray-200 whitespace-pre-wrap italic leading-relaxed">
                        {scene}
                    </p>
                </div>
                <div className="space-y-3">
                    {options?.map((option, index) => (
                    <button 
                        key={index} 
                        onClick={() => onMakeChoice(option)}
                        className="w-full bg-gray-700 hover:bg-green-800 text-white font-semibold py-3 px-5 rounded-lg transition-colors duration-200"
                    >
                        {option}
                    </button>
                    ))}
                </div>
                
                <form onSubmit={handleCustomActionSubmit} className="mt-6">
                    <label htmlFor="custom-interaction-action" className="block text-sm font-medium text-gray-300 mb-2">Hoặc, nhập hành động của bạn:</label>
                    <div className="flex space-x-2">
                        <input
                            id="custom-interaction-action"
                            type="text"
                            value={customAction}
                            onChange={(e) => setCustomAction(e.target.value)}
                            placeholder="Ví dụ: 'Hỏi về quá khứ của nàng' hoặc 'Tặng nàng một viên đan dược'"
                            className="flex-grow bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:ring-green-500 focus:border-green-500"
                        />
                        <button
                            type="submit"
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-gray-500"
                            disabled={!customAction.trim()}
                        >
                            Gửi
                        </button>
                    </div>
                </form>
                 <button 
                  onClick={onEndInteraction}
                  className="mt-6 text-gray-400 hover:text-white transition-colors"
                >
                  (Rời đi)
                </button>
            </div>
        );
    };

    const renderContent = () => {
        switch (interaction.stage) {
            case 'selection': return renderSelection();
            case 'gifting': return renderGifting();
            case 'chatting': return renderChatting();
            default: return renderSelection();
        }
    }

    return (
        <div className="bg-gray-800/50 p-6 rounded-lg border-2 border-green-500 flex flex-col h-full text-center">
            <div className="flex flex-col items-center mb-6">
                <img src={character.avatar} alt={character.name} className="w-24 h-24 rounded-full mb-4 border-4 border-green-500 object-cover"/>
                <h2 className="text-3xl font-bold text-green-400">
                    Tương tác với <span className={genderColor}>{character.name}</span>
                </h2>
            </div>
            {renderContent()}
        </div>
    );
};

export default InteractionView;