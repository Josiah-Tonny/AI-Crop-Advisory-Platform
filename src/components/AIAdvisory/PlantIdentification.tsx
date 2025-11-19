import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Loader2, Upload, Leaf, AlertCircle } from 'lucide-react';
import plantIdService from '../../services/plantIdService';

// Define types for identification results
interface PlantIdentificationResult {
  plantName: string;
  scientificName: string;
  probability: number;
  details?: {
    common_names?: string[];
    taxonomy?: {
      class: string;
      family: string;
      genus: string;
      kingdom: string;
      order: string;
      phylum: string;
    };
    url?: string;
    description?: {
      value: string;
      citation: string;
      license_name: string;
      license_url: string;
    };
    wiki_description?: {
      value: string;
      citation: string;
      license_name: string;
      license_url: string;
    };
  };
  imageUrl?: string;
}

interface DiseaseDetectionResult {
  disease: string;
  probability: number;
  scientificName?: string;
  description?: string;
  treatment?: string[];
}

interface PlantIdentificationProps {
  onIdentificationResult?: (result: PlantIdentificationResult[]) => void;
}

const PlantIdentification: React.FC<PlantIdentificationProps> = ({ onIdentificationResult }) => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [identificationResults, setIdentificationResults] = useState<PlantIdentificationResult[] | null>(null);
  const [diseaseResults, setDiseaseResults] = useState<DiseaseDetectionResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImage(file);
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
      
      // Reset results when new image is selected
      setIdentificationResults(null);
      setDiseaseResults(null);
      setError(null);
    }
  };

  const handleIdentifyPlant = async () => {
    if (!image) return;
    
    try {
      setIsIdentifying(true);
      setError(null);
      
      // Convert image to base64
      const base64Image = await plantIdService.fileToBase64(image);
      
      // Identify plant
      const results = await plantIdService.identifyPlant([base64Image]);
      setIdentificationResults(results);
      
      if (onIdentificationResult) {
        onIdentificationResult(results);
      }
    } catch {
      // Error handling for plant identification
      setError('Failed to identify the plant. Please try again.');
      // Let calling component handle the error
      throw error;
    } finally {
      setIsIdentifying(false);
    }
  };

  const handleDetectDisease = async () => {
    if (!image) return;
    
    try {
      setIsIdentifying(true);
      setError(null);
      
      // Convert image to base64
      const base64Image = await plantIdService.fileToBase64(image);
      
      // Detect disease
      const results = await plantIdService.detectDisease([base64Image]);
      setDiseaseResults(results);
    } catch {
      // Error handling for disease detection
      setError('Failed to detect disease. Please try again.');
      // Let calling component handle the error
      throw error;
    } finally {
      setIsIdentifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-600" />
            Plant Identification & Disease Detection
          </CardTitle>
          <CardDescription>
            Upload a photo of a plant to identify it or detect diseases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
              {preview ? (
                <div className="relative w-full max-w-md">
                  <img 
                    src={preview} 
                    alt="Plant preview" 
                    className="w-full h-auto rounded-lg shadow-sm"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="absolute top-2 right-2 bg-white opacity-80 hover:opacity-100"
                    onClick={() => {
                      setImage(null);
                      setPreview(null);
                      setIdentificationResults(null);
                      setDiseaseResults(null);
                    }}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer w-full h-40">
                  <Upload className="h-10 w-10 text-gray-400 mb-2" />
                  <span className="text-gray-600 font-medium">Click to upload or drag and drop</span>
                  <span className="text-gray-400 text-sm mt-1">JPG, PNG or GIF (max 10MB)</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                  />
                </label>
              )}
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}

            {preview && (
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={handleIdentifyPlant}
                  className="flex items-center gap-2"
                  disabled={isIdentifying || !image}
                >
                  {isIdentifying && !identificationResults ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Identifying...
                    </>
                  ) : (
                    <>
                      <Leaf className="h-4 w-4" />
                      Identify Plant
                    </>
                  )}
                </Button>

                <Button 
                  onClick={handleDetectDisease}
                  variant="outline"
                  className="flex items-center gap-2"
                  disabled={isIdentifying || !image}
                >
                  {isIdentifying && !diseaseResults ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Detecting...
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4" />
                      Detect Disease
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Identification Results */}
      {identificationResults && identificationResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Plant Identification Results</CardTitle>
            <CardDescription>
              We found the following matches for your plant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {identificationResults.slice(0, 3).map((result, idx) => (
                <div 
                  key={idx} 
                  className="flex items-start gap-4 p-3 rounded-lg border border-gray-200 bg-white"
                >
                  {result.imageUrl && (
                    <img 
                      src={result.imageUrl} 
                      alt={result.plantName}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                  )}
                  <div>
                    <h4 className="font-medium text-lg">
                      {result.plantName}
                      <span className="ml-2 text-sm text-gray-500 font-normal">
                        {Math.round(result.probability * 100)}% match
                      </span>
                    </h4>
                    <p className="text-sm text-gray-600 italic">
                      {result.scientificName}
                    </p>
                    {result.details?.wiki_description && (
                      <p className="text-sm mt-2">
                        {result.details.wiki_description.value.split('.')[0]}.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disease Detection Results */}
      {diseaseResults && diseaseResults.length > 0 && (
        <Card className={diseaseResults[0]?.probability > 0.5 ? "border-amber-200" : "border-green-200"}>
          <CardHeader className={diseaseResults[0]?.probability > 0.5 ? "bg-amber-50" : "bg-green-50"}>
            <CardTitle className="flex items-center gap-2">
              {diseaseResults[0]?.probability > 0.5 ? (
                <AlertCircle className="h-5 w-5 text-amber-600" />
              ) : (
                <Leaf className="h-5 w-5 text-green-600" />
              )}
              Plant Health Assessment
            </CardTitle>
            <CardDescription>
              {diseaseResults[0]?.probability > 0.5 
                ? "We detected potential issues with your plant" 
                : "Your plant appears to be healthy"}
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-2">
            {diseaseResults[0]?.probability > 0.5 ? (
              <div className="space-y-4">
                {diseaseResults.slice(0, 2).map((result, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">
                        {result.disease}
                      </h4>
                      <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800">
                        {Math.round(result.probability * 100)}% confidence
                      </span>
                    </div>
                    
                    {result.description && (
                      <p className="text-sm text-gray-700">
                        {result.description}
                      </p>
                    )}
                    
                    {result.treatment && result.treatment.length > 0 && (
                      <div className="mt-2">
                        <h5 className="text-sm font-medium">Recommended Treatment:</h5>
                        <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
                          {result.treatment.map((t, i) => (
                            <li key={i}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-green-50 rounded-lg text-green-700">
                <p>
                  No significant diseases or pests detected. Your plant appears to be healthy.
                  Continue with regular care and maintenance.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PlantIdentification;
