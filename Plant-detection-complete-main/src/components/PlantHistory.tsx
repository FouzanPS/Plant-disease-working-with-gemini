
import React from 'react';
import { Clock, ChevronRight } from 'lucide-react';
import { PlantIdentification } from '@/types/plant';
import ResultCard from './ResultCard';

interface PlantHistoryProps {
  history: PlantIdentification[];
  onSelectPlant: (plant: PlantIdentification) => void;
}

const PlantHistory: React.FC<PlantHistoryProps> = ({ history, onSelectPlant }) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto my-16">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="text-primary h-5 w-5" />
        <h2 className="text-2xl font-bold">Recent Plants</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {history.map((plant) => (
          <div 
            key={plant.id}
            onClick={() => onSelectPlant(plant)}
            className="cursor-pointer hover:opacity-90 transition-opacity"
          >
            <ResultCard plant={plant} isCompact={true} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlantHistory;
