
import { PlantIdentification, PlantDetails } from "../types/plant";
import { toast } from "sonner";

// Simulate plant recognition with a delay
export const recognizePlant = async (imageFile: File): Promise<PlantIdentification> => {
  // Display processing toast
  toast.loading("Analyzing your plant...", { id: "plant-recognition" });
  
  try {
    // Create a URL for the uploaded image
    const imageUrl = URL.createObjectURL(imageFile);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Simulate recognition result (in a real app, this would be an API call)
    const mockPlants = [
      {
        name: "Snake Plant",
        scientificName: "Dracaena trifasciata",
        confidence: 0.98,
        details: {
          description: "Snake plants are known for their long, architectural leaves with yellow borders. They're very hardy and can survive in low light and with minimal watering.",
          family: "Asparagaceae",
          careLevel: "Easy",
          waterNeeds: "Low",
          lightNeeds: "Low to Bright Indirect",
          isPoisonous: true
        }
      },
      {
        name: "Monstera Deliciosa",
        scientificName: "Monstera deliciosa",
        confidence: 0.96,
        details: {
          description: "The Swiss cheese plant, known for its unique leaf holes (fenestrations). It's a tropical plant that adds a jungle feel to any space.",
          family: "Araceae",
          careLevel: "Moderate",
          waterNeeds: "Medium",
          lightNeeds: "Bright Indirect",
          isPoisonous: true
        }
      },
      {
        name: "Peace Lily",
        scientificName: "Spathiphyllum",
        confidence: 0.93,
        details: {
          description: "The peace lily is a popular indoor plant known for its glossy leaves and white 'flowers' (actually modified leaves called spathes).",
          family: "Araceae",
          careLevel: "Easy",
          waterNeeds: "Medium",
          lightNeeds: "Low to Bright Indirect",
          isPoisonous: true
        }
      },
      {
        name: "Fiddle Leaf Fig",
        scientificName: "Ficus lyrata",
        confidence: 0.91,
        details: {
          description: "The fiddle leaf fig has large, violin-shaped leaves and can grow quite tall. It's a popular but somewhat finicky houseplant.",
          family: "Moraceae",
          careLevel: "Moderate to Difficult",
          waterNeeds: "Medium",
          lightNeeds: "Bright Indirect",
          isPoisonous: true
        }
      },
      {
        name: "Pothos",
        scientificName: "Epipremnum aureum",
        confidence: 0.97,
        details: {
          description: "Pothos is a trailing vine with heart-shaped leaves, often variegated. It's one of the easiest houseplants to grow and propagate.",
          family: "Araceae",
          careLevel: "Very Easy",
          waterNeeds: "Low to Medium",
          lightNeeds: "Low to Bright Indirect",
          isPoisonous: true
        }
      }
    ];
    
    // Randomly select a plant
    const randomIndex = Math.floor(Math.random() * mockPlants.length);
    const selectedPlant = mockPlants[randomIndex];
    
    // Create a result
    const result: PlantIdentification = {
      id: `plant-${Date.now()}`,
      name: selectedPlant.name,
      scientificName: selectedPlant.scientificName,
      confidence: selectedPlant.confidence,
      imageUrl: imageUrl,
      timestamp: Date.now(),
      details: selectedPlant.details
    };
    
    // Update toast
    toast.success("Plant identified successfully!", { id: "plant-recognition" });
    
    return result;
  } catch (error) {
    // Handle error
    toast.error("Failed to analyze plant", { id: "plant-recognition" });
    throw new Error("Plant recognition failed");
  }
};

// Save plant to local storage history
export const savePlantToHistory = (plant: PlantIdentification): void => {
  try {
    // Get existing history
    const historyString = localStorage.getItem('plantHistory');
    const history: PlantIdentification[] = historyString ? JSON.parse(historyString) : [];
    
    // Add new plant to history (at the beginning)
    history.unshift(plant);
    
    // Limit history to 10 items
    const limitedHistory = history.slice(0, 10);
    
    // Save back to local storage
    localStorage.setItem('plantHistory', JSON.stringify(limitedHistory));
  } catch (error) {
    console.error('Failed to save plant to history', error);
  }
};

// Load plant history from local storage
export const loadPlantHistory = (): PlantIdentification[] => {
  try {
    const historyString = localStorage.getItem('plantHistory');
    return historyString ? JSON.parse(historyString) : [];
  } catch (error) {
    console.error('Failed to load plant history', error);
    return [];
  }
};
