import React from 'react';

interface CodeViewerProps {
  code: string;
  isVisible: boolean;
  onHide: () => void;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ code, isVisible, onHide }) => {
  if (!isVisible) return null;

  return (
    <div className="bg-gray-900 text-green-400 flex-shrink-0 max-h-80 overflow-y-auto">
      {/* Code Header */}
      <div className="flex justify-between items-center p-4 bg-gray-800 border-b border-gray-600">
        <h4 className="text-gray-200 text-sm font-semibold">
          Generated JavaScript Code
        </h4>
        <button
          onClick={onHide}
          className="btn btn-small bg-gray-600 hover:bg-gray-500 text-gray-200"
        >
          Hide Code
        </button>
      </div>

      {/* Code Display */}
      <pre className="p-5 font-mono text-sm leading-relaxed bg-gray-900 text-green-400 whitespace-pre-wrap">
        {code || '// Drag blocks to see code here'}
      </pre>
    </div>
  );
};