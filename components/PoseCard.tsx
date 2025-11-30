import React, { useState } from 'react';
import { Pose } from '../types';
import StickFigure from './StickFigure';
import { RefreshCw, Edit } from 'lucide-react';

interface PoseCardProps {
  pose: Pose;
  isEditor?: boolean;
  onEdit?: (pose: Pose) => void;
}

const PoseCard: React.FC<PoseCardProps> = ({ pose, isEditor, onEdit }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = (e: React.MouseEvent) => {
    // Don't flip if clicking the edit button
    if ((e.target as HTMLElement).closest('.edit-btn')) return;
    setIsFlipped(!isFlipped);
  };

  return (
    <div 
      className="group perspective-1000 w-full h-[340px] cursor-pointer"
      onClick={handleFlip}
    >
      <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        
        {/* Front Face */}
        <div className="absolute w-full h-full backface-hidden bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col items-center justify-center z-10">
          {isEditor && (
            <button 
              className="edit-btn absolute top-3 right-3 p-2 bg-gray-100 rounded-full hover:bg-yoga-accent hover:text-white transition-colors z-20"
              onClick={(e) => { e.stopPropagation(); onEdit && onEdit(pose); }}
            >
              <Edit className="w-4 h-4" />
            </button>
          )}

          <StickFigure poseName={pose.name_zh} />
          
          <h3 className="text-2xl font-bold text-yoga-text mt-4">{pose.name_zh}</h3>
          <p className="text-sm text-gray-500 italic mb-3">{pose.name_en}</p>
          
          <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
            {pose.category || '未分類'}
          </span>
          
          <div className="absolute bottom-4 right-4 text-yoga-accent text-xs font-bold bg-indigo-50 px-3 py-1 rounded-full flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> 點擊翻面
          </div>
        </div>

        {/* Back Face */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-yellow-50 rounded-2xl shadow-lg border-2 border-yoga-text p-6 overflow-y-auto">
          <h4 className="font-bold text-yoga-accent mb-3 flex items-center gap-2">
            🧘 老師教學口令 (Cues)
          </h4>
          
          {pose.cues && pose.cues.length > 0 ? (
            <ul className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
              {pose.cues
                .sort((a, b) => a.sequence - b.sequence)
                .map((cue, idx) => (
                <li key={idx} className="leading-relaxed">
                  <span className="font-semibold text-yoga-blue text-xs mr-1">[{cue.type}]</span>
                  {cue.content}
                </li>
              ))}
            </ul>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm text-center">
              <p>⚠️ 尚未有老師提供口令</p>
              {isEditor && <p className="mt-2 text-yoga-accent">點擊編輯新增口令</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PoseCard;