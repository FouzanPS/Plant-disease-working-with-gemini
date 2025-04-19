
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Droplets, 
  Sun, 
  ThermometerSun, 
  AlertTriangle, 
  Leaf 
} from 'lucide-react';
import { PlantIdentification } from '@/types/plant';

interface ResultCardProps {
  plant: PlantIdentification;
  isCompact?: boolean;
}

const ResultCard: React.FC<ResultCardProps> = ({ plant, isCompact = false }) => {
  // const confidencePercent = Math.round(plant.confidence * 100);
  
  if (isCompact) {
    return (
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <div className="flex flex-row h-32">
          <div className="w-32 h-full bg-muted">
            <img 
              src={plant.imageUrl} 
              alt={plant.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 p-4">
            <CardTitle className="text-base mb-1">{plant.name}</CardTitle>
          </div>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="overflow-hidden animate-fade-in">
      <div className="aspect-[4/3] bg-muted w-full">
        <img 
          src={plant.imageUrl} 
          alt={plant.name} 
          className="w-full h-full object-cover"
        />
      </div>
     
        
     
     
    </Card>
  );
};

export default ResultCard;
