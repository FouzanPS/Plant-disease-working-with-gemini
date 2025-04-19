
import React, { useState, useEffect } from 'react';
import Hero from '@/components/Hero';
import FileUpload from '@/components/FileUpload';
import PlantResult from '@/components/PlantResult';
import PlantHistory from '@/components/PlantHistory';
import { PlantIdentification } from '@/types/plant';
import { loadPlantHistory } from '@/utils/plantRecognition';
import { Toaster } from "@/components/ui/sonner";

const Index = () => {
  const [currentPlant, setCurrentPlant] = useState<PlantIdentification | null>(null);
  const [history, setHistory] = useState<PlantIdentification[]>([]);
  const [showResult, setShowResult] = useState(false);

  // Load history on component mount
  useEffect(() => {
    setHistory(loadPlantHistory());
  }, []);

  // Update history when a new plant is recognized
  useEffect(() => {
    if (currentPlant) {
      // Check if the plant is already in history
      if (!history.some(p => p.id === currentPlant.id)) {
        setHistory([currentPlant, ...history]);
      }
    }
  }, [currentPlant]);

  const handleRecognitionComplete = (result: PlantIdentification) => {
    setCurrentPlant(result);
    setShowResult(true);
    // Scroll to top when showing results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectFromHistory = (plant: PlantIdentification) => {
    setCurrentPlant(plant);
    setShowResult(true);
    // Scroll to top when showing results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToUpload = () => {
    setShowResult(false);
  };

  return (
    <div className="min-h-screen">
      <Toaster />
      
      <header className="border-b py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-primary/20 p-1.5 rounded-full">
                <div className="text-primary font-bold text-lg">🌱</div>
              </div>
              <h1 className="text-xl font-bold">FloraVision</h1>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {!showResult && (
          <>
            <Hero />
            <FileUpload onRecognitionComplete={handleRecognitionComplete} />
            <PlantHistory 
              history={history} 
              onSelectPlant={handleSelectFromHistory} 
            />
          </>
        )}
        
        {showResult && currentPlant && (
          <PlantResult 
            plant={currentPlant} 
            onBack={handleBackToUpload} 
          />
        )}
      </main>
      
      <footer className="bg-secondary py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>FloraVision &copy; {new Date().getFullYear()} - Plant identification Application</p>
          <p className="mt-2">Application for realtime Plant disease detection</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
