import React from 'react';
import { useHistoryStore } from '../../store/historySlice';
import { HistoryAction } from '../../types/history';

const HistoryPanel: React.FC = () => {
  const { past, present, future, undo, redo, canUndo, canRedo } = useHistoryStore();

  // Format timestamp to readable time
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Render a history item
  const renderHistoryItem = (action: HistoryAction, index: number, type: 'past' | 'present' | 'future') => {
    const time = formatTime(action.timestamp);
    
    return (
      <div 
        key={`${type}-${index}`}
        className={`
          flex items-center justify-between p-2 mb-1 rounded
          ${type === 'present' ? 'bg-blue-100 border-l-4 border-blue-500' : 'bg-gray-50 hover:bg-gray-100'}
          cursor-pointer transition-colors
        `}
        onClick={() => {
          if (type === 'past') {
            // Undo multiple steps to reach this past action
            const stepsToUndo = past.length - index;
            for (let i = 0; i < stepsToUndo; i++) {
              undo();
            }
          } else if (type === 'future') {
            // Redo multiple steps to reach this future action
            const stepsToRedo = index + 1;
            for (let i = 0; i < stepsToRedo; i++) {
              redo();
            }
          }
        }}
      >
        <div className="flex flex-col">
          <span className="text-sm font-medium">{action.description}</span>
          <span className="text-xs text-gray-500">{time}</span>
        </div>
        {type === 'present' && (
          <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">Current</span>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 w-full max-w-xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">History</h3>
        <div className="flex space-x-2">
          <button
            onClick={undo}
            disabled={!canUndo()}
            className={`p-2 rounded ${
              canUndo() ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            title="Undo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"/>
              <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z"/>
            </svg>
          </button>
          <button
            onClick={redo}
            disabled={!canRedo()}
            className={`p-2 rounded ${
              canRedo() ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            title="Redo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
              <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966a.25.25 0 0 1 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="overflow-y-auto max-h-80">
        {/* Display past actions */}
        {past.length > 0 && (
          <div className="mb-3">
            <h4 className="text-xs uppercase text-gray-500 font-semibold mb-1">Past</h4>
            {past.map((action, index) => renderHistoryItem(action, index, 'past'))}
          </div>
        )}

        {/* Display current action */}
        {present && (
          <div className="mb-3">
            <h4 className="text-xs uppercase text-gray-500 font-semibold mb-1">Current</h4>
            {renderHistoryItem(present, 0, 'present')}
          </div>
        )}

        {/* Display future actions */}
        {future.length > 0 && (
          <div>
            <h4 className="text-xs uppercase text-gray-500 font-semibold mb-1">Future</h4>
            {future.map((action, index) => renderHistoryItem(action, index, 'future'))}
          </div>
        )}

        {/* Empty state */}
        {past.length === 0 && !present && future.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No history yet. Start editing to create history.
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;
