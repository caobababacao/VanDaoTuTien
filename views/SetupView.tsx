import React, { useState } from 'react';
import { Gender } from '../types';

type SetupViewProps = {
    onGameStart: (setupData: { playerName: string; sectName: string; playerGender: Gender }) => void;
};

const SetupView: React.FC<SetupViewProps> = ({ onGameStart }) => {
    const [playerName, setPlayerName] = useState('');
    const [sectName, setSectName] = useState('');
    const [playerGender, setPlayerGender] = useState<Gender>(Gender.Nam);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!playerName.trim() || !sectName.trim()) {
            setError('Tên Tông Chủ và Tên Tông Môn không được để trống.');
            return;
        }
        setError('');
        onGameStart({ playerName, sectName, playerGender });
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg border border-red-500/50">
                <h1 className="text-3xl font-bold text-center text-red-500">Vấn Đạo Trường Sinh</h1>
                <p className="text-center text-gray-400">Trước khi bắt đầu hành trình, hãy định danh cho chính mình.</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="playerName" className="block text-sm font-medium text-gray-300">
                            Tên Tông Chủ
                        </label>
                        <input
                            id="playerName"
                            type="text"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring focus:ring-red-500"
                            placeholder="Ví dụ: Hạo Thiên"
                        />
                    </div>
                    <div>
                        <label htmlFor="sectName" className="block text-sm font-medium text-gray-300">
                            Tên Tông Môn
                        </label>
                        <input
                            id="sectName"
                            type="text"
                            value={sectName}
                            onChange={(e) => setSectName(e.target.value)}
                            className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring focus:ring-red-500"
                            placeholder="Ví dụ: Lạc Vân Tông"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Giới Tính</label>
                        <div className="flex items-center mt-2 space-x-4">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="gender"
                                    value={Gender.Nam}
                                    checked={playerGender === Gender.Nam}
                                    onChange={() => setPlayerGender(Gender.Nam)}
                                    className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 focus:ring-red-500"
                                />
                                <span className="ml-2 text-white">Nam</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="gender"
                                    value={Gender.Nữ}
                                    checked={playerGender === Gender.Nữ}
                                    onChange={() => setPlayerGender(Gender.Nữ)}
                                    className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 focus:ring-red-500"
                                />
                                <span className="ml-2 text-white">Nữ</span>
                            </label>
                        </div>
                    </div>
                    {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                    <div>
                        <button
                            type="submit"
                            className="w-full px-4 py-2 font-bold text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            Bắt Đầu
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SetupView;