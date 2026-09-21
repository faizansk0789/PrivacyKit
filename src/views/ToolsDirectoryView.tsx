import React from 'react';
import { ClayToolsDirectory } from '../components/home/ClayToolsDirectory';

interface ToolsDirectoryViewProps {
  onNavigate: (path: string) => void;
}

export const ToolsDirectoryView: React.FC<ToolsDirectoryViewProps> = ({ onNavigate }) => {
  return (
    <div className="w-full">
      <ClayToolsDirectory onNavigate={onNavigate} />
    </div>
  );
};

