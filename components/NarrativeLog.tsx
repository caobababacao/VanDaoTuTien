import React, { useRef, useEffect } from 'react';
import { NarrativeEvent } from '../types';

type NarrativeLogProps = {
  log: NarrativeEvent[];
};

const NarrativeLog: React.FC<NarrativeLogProps> = ({ log }) => {
    const logEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [log]);

  return (
    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 h-[calc(100vh-120px)] flex flex-col">
      <h2 className="text-xl font-bold mb-3 text-red-500 border-b border-gray-600 pb-2 flex-shrink-0">Nhật Ký</h2>
      <div className="overflow-y-auto flex-grow pr-2">
        <ul className="space-y-3">
          {log.map((event) => (
            <li key={event.id}>
              <p className={`text-sm ${event.isStory ? 'text-yellow-300 italic' : 'text-gray-300'}`}>
                <span className="font-semibold text-gray-500 mr-2">N{event.day}, {event.time}:</span>
                {event.message}
              </p>
            </li>
          ))}
        </ul>
        <div ref={logEndRef} />
      </div>
    </div>
  );
};

export default NarrativeLog;
