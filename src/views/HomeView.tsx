import React from 'react';
import { ClayToolsDirectory } from '../components/home/ClayToolsDirectory';

interface HomeViewProps {
  onNavigate: (path: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  return (
    <div className="w-full">
      <ClayToolsDirectory onNavigate={onNavigate} />
    </div>
  );
};

