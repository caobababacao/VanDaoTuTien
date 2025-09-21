// Fix: Provide full content for ResourcePanel.tsx.
import React from 'react';
import { Resources, ResourceType } from '../types';

type ResourcePanelProps = {
  resources: Resources;
};

const ResourceItem: React.FC<{ name: ResourceType; amount: number; capacity: number }> = ({ name, amount, capacity }) => {
    const isFinite = Number.isFinite(capacity);
    const percentage = isFinite && capacity > 0 ? (amount / capacity) * 100 : 0;
    
    let barColor = 'bg-red-500';
    if (name === ResourceType.TànHồnYêuThú) {
        barColor = 'bg-purple-500';
    } else if (percentage > 80) {
        barColor = 'bg-green-500';
    } else if (percentage > 30) {
        barColor = 'bg-yellow-500';
    }

    return (
        <div className="bg-gray-800 p-2 rounded-lg">
            <div className="flex justify-between items-baseline">
                <span className="font-bold text-gray-300 text-sm md:text-base">{name}</span>
                <span className="font-mono text-white text-sm md:text-base">
                    {amount}
                    {isFinite && ` / ${capacity}`}
                </span>
            </div>
            {isFinite && (
                <div className="w-full bg-gray-600 rounded-full h-1.5 mt-1">
                    <div
                        className={`${barColor} h-1.5 rounded-full transition-all duration-300`}
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
            )}
        </div>
    );
};

const ResourcePanel: React.FC<ResourcePanelProps> = ({ resources }) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-3 text-red-500">Tài Nguyên</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.values(resources).map(res => (
          <ResourceItem key={res.type} name={res.type} amount={res.amount} capacity={res.capacity} />
        ))}
      </div>
    </div>
  );
};

export default ResourcePanel;