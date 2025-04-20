import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Stethoscope, PlusCircle } from 'lucide-react';
import { PlantIdentification } from '@/types/plant';
import ResultCard from './ResultCard';
import { Card } from './ui/card';

interface PlantResultProps {
  plant: PlantIdentification;
  onBack: () => void;
}

interface DiseaseResult {
  result: string;
  confidence: number;
}

const PlantResult: React.FC<PlantResultProps> = ({ plant, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [diseaseResult, setDiseaseResult] = useState<DiseaseResult | null>(null);
  const [remedy, setRemedy] = useState<string | null>(null);
  const [heatmapUrl, setHeatmapUrl] = useState<string | null>(null);
  const [remedyLoading, setRemedyLoading] = useState(false);
  const [isRemedyOpen, setIsRemedyOpen] = useState(false);

  const handleDiseaseAnalysis = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:4050/api/analyze-disease', {
        method: 'POST',
      });

      const data = await res.json();

      if (res.ok) {
        setDiseaseResult(data);
        setHeatmapUrl(data.heatmapUrl || null);
      } else {
        alert(data.error || 'Failed to analyze disease.');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleGetRemedy = async () => {
    setRemedyLoading(true);
    try {
      const res = await fetch('http://localhost:3000/remedysearch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          context: `Explain the remedies for ${diseaseResult?.result} in short with bullet points with clear understanding short definition, give at least 6-7 points.` 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setRemedy(data.remedy);
      } else {
        alert(data.error || 'Failed to get remedy.');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong.');
    } finally {
      setRemedyLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={onBack} 
          className="flex items-center gap-2 mb-4"
        >
          <ArrowLeft size={16} />
          Back to Upload
        </Button>
        <h2 className="text-2xl font-bold mb-4">Plant Identification Result</h2>

        <div className="flex flex-col lg:flex-row justify-center items-center gap-6 mt-4">
          {/* Original Image */}
          <div className="w-full lg:w-1/2 flex flex-col items-center">
            <h3 className="text-xl font-bold text-green-700 mb-2 text-center">Original</h3>
            <Card className="overflow-hidden animate-fade-in w-full max-w-[300px]">
              <div className="aspect-[4/3] bg-muted w-full">
                <img
                  src={plant.imageUrl}
                  alt={plant.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </Card>
          </div>

          {/* Heatmap Image (if available) */}
          {heatmapUrl && (
            <div className="w-full lg:w-1/2 flex flex-col items-center mt-6 lg:mt-0">
              <h3 className="text-xl font-bold text-green-700 mb-2 text-center">Heatmap</h3>
              <Card className="overflow-hidden animate-fade-in w-full max-w-[300px]">
                <div className="aspect-[4/3] bg-muted w-full">
                  <img
                    src={heatmapUrl}
                    alt="Disease Heatmap"
                    className="w-full h-full object-cover"
                  />
                </div>
              </Card>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Button 
            onClick={handleDiseaseAnalysis}
            disabled={loading}
            className="flex items-center gap-2 mx-auto"
          >
            <Stethoscope size={18} />
            {loading ? 'Analyzing...' : 'Analyze the Disease of the Plant'}
          </Button>

          {diseaseResult && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xl font-semibold text-gray-800">
                {diseaseResult.result}
              </p>
              <span className="bg-green-600 text-white text-sm font-medium px-3 py-1 rounded-full">
                {diseaseResult.confidence}% match
              </span>
            </div>
          )}
          {diseaseResult && (
            <Button 
              onClick={handleGetRemedy}
              disabled={remedyLoading}
              className="flex items-center gap-2 mt-6 mx-auto"
            >
              <PlusCircle size={18} />
              {remedyLoading ? 'Fetching Remedy...' : 'Get Causes and Remedies'}
            </Button>
          )}

          {/* Toggle Remedy Dropdown */}
          {remedy && (
            <Button 
              onClick={() => setIsRemedyOpen((prev) => !prev)}
              className="mt-4 text-sm text-green-900 bg-green-400 font-bold"
            >
              {isRemedyOpen ? 'Hide remedy' : 'Show remedy'}
            </Button>
          )}

          {/* Remedy Block */}
          {remedy && isRemedyOpen && (
            <div className="bg-green-50 p-6 rounded-2xl shadow-md mt-6 border border-green-200 text-left">
              <h2 className="text-xl font-extrabold text-green-800 mb-4">
                Suggested Remedies for {diseaseResult.result}
              </h2>
              {remedy &&
                remedy
                  .replace(/^Okay.*?:\s*/i, '') // Remove the default genai intro
                  .split(/\n+/)
                  .map((line, index) => {
                    const cleaned = line.replace(/[*\-•]/g, '').trim();
                    const match = cleaned.match(/^([A-Z][^:]{0,50}):\s*(.*)/);

                    if (match) {
                      const [heading, content] = [match[1], match[2]];
                      const icon =
                        heading === 'Definition' ? '📘' :
                        heading === 'Remedy' ? '💊' :
                        heading === 'Explanation' ? '📝' : '📄';

                      if (heading === 'Definition' || heading === 'Explanation' || heading === 'Remedy') {
                        return (
                          <p key={index} className="text-green-900 mb-2 text-left pl-6">
                            <span className="font-semibold">{icon} {heading}:</span> {content}
                          </p>
                        );
                      } else {
                        return (
                          <p key={index} className="text-green-900 mb-2 text-left">
                            <span className="font-semibold">{icon} {heading}:</span> {content}
                          </p>
                        );
                      }
                    }

                    if (cleaned) {
                      return (
                        <p key={index} className="text-lg font-bold text-green-700 mt-6 border-l-4 border-green-400 pl-0 text-left">
                          {cleaned}
                        </p>
                      );
                    }

                    return null;
                  })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlantResult;