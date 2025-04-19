
export interface PlantIdentification {
  id: string;
  name: string;
  scientificName: string;
  confidence: number;
  imageUrl: string;
  timestamp: number;
  details?: PlantDetails;
}

export interface PlantDetails {
  description: string;
  family: string;
  careLevel: string;
  waterNeeds: string;
  lightNeeds: string;
  isPoisonous: boolean;
}
