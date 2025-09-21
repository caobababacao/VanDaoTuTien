import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex flex-col justify-center items-center z-50">
      <div className="w-16 h-16 border-4 border-t-red-500 border-gray-600 rounded-full animate-spin"></div>
      <p className="text-white text-lg mt-4">AI đang suy nghĩ...</p>
    </div>
  );
};

export default LoadingSpinner;
