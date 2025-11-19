import React, { useState, useEffect } from 'react';
import { Bug, Shield, AlertTriangle, CheckCircle, Camera, Upload, Leaf, Wind, Droplets, Thermometer, MapPin, RefreshCw, HelpCircle } from 'lucide-react';
import { aimlService } from '../../services/aimlService';
import { weatherService } from '../../services/weatherService';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Skeleton } from '../ui/skeleton';
import { PageTransition } from '../ui/page-transition';
import { PullToRefresh } from '../ui/pull-to-refresh';
import { cn } from '@/lib/utils';

// Define types for the pest data
interface PestThreat {
  name: string;
  description?: string;
  riskLevel?: string;
}

interface PestRecommendation {
  title: string;
  description?: string;
  priority?: string;
}

const PestControlPage: React.FC = () => {
  const [pestData, setPestData] = useState<{ riskAssessment?: { overallRisk?: { level: string; score: number }; possibleThreats?: Array<string | { name: string; description?: string; riskLevel?: string }> }; recommendations?: Array<string | { title: string; description?: string; priority?: string }> } | null>(null);
  const [realTimeData, setRealTimeData] = useState<{ temperature?: number; humidity?: number; weatherCondition?: string; lastUpdated?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location] = useState({ lat: -1.2921, lon: 36.8219 }); // Default to Nairobi
  const [image, setImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<Record<string, unknown> | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  // Mock data for pest control
  const mockPestData = {
    riskAssessment: {
      overallRisk: {
        level: 'moderate',
        score: 65
      },
      possibleThreats: [
        {
          name: 'Fall Armyworm',
          description: 'Caterpillar that feeds on maize leaves and can cause significant yield loss',
          riskLevel: 'high'
        },
        {
          name: 'Maize Stalk Borer',
          description: 'Larva that bores into maize stems, causing plant death',
          riskLevel: 'moderate'
        },
        {
          name: 'Ear Rot',
          description: 'Fungal disease affecting maize ears, reducing quality and yield',
          riskLevel: 'low'
        }
      ]
    },
    recommendations: [
      {
        title: 'Biological Control',
        description: 'Introduce natural predators like parasitic wasps to control armyworm populations',
        priority: 'High'
      },
      {
        title: 'Cultural Practices',
        description: 'Practice crop rotation and remove crop residues to reduce pest breeding sites',
        priority: 'Medium'
      },
      {
        title: 'Chemical Control',
        description: 'Apply appropriate insecticides when pest populations exceed economic thresholds',
        priority: 'Low'
      },
      {
        title: 'Monitoring',
        description: 'Regularly scout fields for early pest detection and damage assessment',
        priority: 'High'
      }
    ]
  };
  
  // Mock real-time weather data
  const mockRealTimeData = {
    temperature: 26.5,
    humidity: 72,
    weatherCondition: 'Partly Cloudy',
    lastUpdated: new Date().toISOString()
  };

  const fetchPestData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use mock data instead of API calls
      setTimeout(() => {
        setPestData(mockPestData);
        setRealTimeData(mockRealTimeData);
        setLoading(false);
      }, 800);
    } catch (_error) { // eslint-disable-line @typescript-eslint/no-unused-vars
      setError('Failed to load pest control data. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPestData();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzePestImage = async () => {
    if (!image) return;
    
    setIsAnalyzing(true);
    try {
      const result = await aimlService.analyzePestImage(image);
      setAnalysisResult(result);
    } catch (_error) { // eslint-disable-line @typescript-eslint/no-unused-vars
      setError('Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (level: string): string => {
    switch (level.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'severe': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskIcon = (level: string): JSX.Element => {
    switch (level.toLowerCase()) {
      case 'low': return <CheckCircle className="h-4 w-4" />;
      case 'moderate': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'severe': return <AlertTriangle className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={fetchPestData}>Try Again</Button>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <PullToRefresh onRefresh={fetchPestData}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Pest Control Advisor</h1>
              <p className="text-gray-600 mt-1">AI-powered pest detection and management recommendations</p>
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => setShowHelp(!showHelp)} variant="outline" size="sm">
                <HelpCircle className="h-4 w-4 mr-2" />
                Help
              </Button>
              <Button onClick={fetchPestData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Help Panel */}
          {showHelp && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                  <HelpCircle className="h-5 w-5 mr-2" />
                  Pest Control Help
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-blue-700 text-sm">
                  <li>Risk levels indicate the likelihood of pest damage: Low (0-25%), Moderate (26-50%), High (51-75%), Severe (76-100%)</li>
                  <li>Upload images of affected plants for AI-powered pest identification</li>
                  <li>Follow recommendations in order of priority for best results</li>
                  <li>Regular monitoring helps prevent pest outbreaks</li>
                  <li>Combine multiple control methods for effective pest management</li>
                </ul>
                <p className="mt-2 text-blue-700 text-sm">
                  Weather conditions significantly influence pest activity. High humidity and warm temperatures often increase pest pressure.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Real-time Weather Conditions */}
          {realTimeData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wind className="h-5 w-5 mr-2 text-blue-500" />
                  Current Conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center">
                    <Thermometer className="h-5 w-5 text-red-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Temperature</p>
                      <p className="font-semibold">{realTimeData.temperature ?? 0}°C</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Droplets className="h-5 w-5 text-blue-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Humidity</p>
                      <p className="font-semibold">{realTimeData.humidity ?? 0}%</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="h-5 w-5 text-gray-500 mr-2">
                      <Cloud />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Conditions</p>
                      <p className="font-semibold">{realTimeData.weatherCondition ?? 'Unknown'}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-semibold">Nairobi</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Risk Assessment */}
          {pestData?.riskAssessment && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-orange-500" />
                  Pest Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Overall Risk Score */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Overall Risk</span>
                      {pestData.riskAssessment?.overallRisk && (
                        <Badge className={cn(getRiskColor(pestData.riskAssessment.overallRisk.level), "flex items-center")}>
                          {getRiskIcon(pestData.riskAssessment.overallRisk.level)}
                          <span className="ml-1">{pestData.riskAssessment.overallRisk.level}</span>
                        </Badge>
                      )}
                    </div>
                    {pestData.riskAssessment?.overallRisk && (
                      <Progress value={pestData.riskAssessment.overallRisk.score} className="h-2" />
                    )}
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0%</span>
                      {pestData.riskAssessment?.overallRisk && (
                        <span className="font-medium">{pestData.riskAssessment.overallRisk.score}%</span>
                      )}
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Possible Threats */}
                  {pestData.riskAssessment.possibleThreats && pestData.riskAssessment.possibleThreats.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Identified Threats</h3>
                      <div className="space-y-3">
                        {pestData.riskAssessment.possibleThreats.map((threat: string | PestThreat, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                              <Bug className="h-5 w-5 text-orange-500 mr-3" />
                              <div>
                                <p className="font-medium">
                                  {typeof threat === 'string' ? threat : threat.name}
                                </p>
                                {typeof threat !== 'string' && threat.description && (
                                  <p className="text-sm text-gray-600">{threat.description}</p>
                                )}
                              </div>
                            </div>
                            {typeof threat !== 'string' && threat.riskLevel && (
                              <Badge className={cn(getRiskColor(threat.riskLevel), "flex items-center")}>
                                {getRiskIcon(threat.riskLevel)}
                                <span className="ml-1 capitalize">{threat.riskLevel}</span>
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {pestData?.recommendations && pestData.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Leaf className="h-5 w-5 mr-2 text-green-500" />
                  Management Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pestData.recommendations.map((recommendation: string | PestRecommendation, index: number) => (
                    <div key={index} className="flex items-start p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-shrink-0 mt-1">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">
                          {typeof recommendation === 'string' ? recommendation : recommendation.title}
                        </p>
                        {typeof recommendation !== 'string' && recommendation.description && (
                          <p className="text-sm text-gray-600 mt-1">{recommendation.description}</p>
                        )}
                        {typeof recommendation !== 'string' && recommendation.priority && (
                          <Badge variant="secondary" className="mt-2">
                            {recommendation.priority}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Image Analysis */}
          <Tabs defaultValue="upload">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload Image</TabsTrigger>
              <TabsTrigger value="camera">Camera</TabsTrigger>
            </TabsList>
            <TabsContent value="upload">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Pest Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-10 h-10 mb-3 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>
                    
                    {image && (
                      <div className="space-y-4">
                        <img src={image} alt="Uploaded pest" className="max-w-full h-auto rounded-lg" />
                        <Button 
                          onClick={analyzePestImage} 
                          disabled={isAnalyzing}
                          className="w-full"
                        >
                          {isAnalyzing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Analyzing...
                            </>
                          ) : (
                            'Analyze Image'
                          )}
                        </Button>
                      </div>
                    )}
                    
                    {analysisResult && (
                      <Alert>
                        <AlertDescription>
                          <h3 className="font-semibold mb-2">Analysis Results</h3>
                          <pre className="text-sm whitespace-pre-wrap">
                            {JSON.stringify(analysisResult, null, 2)}
                          </pre>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="camera">
              <Card>
                <CardHeader>
                  <CardTitle>Camera Capture</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Camera functionality coming soon</p>
                    <Button variant="outline">Use Device Camera</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </PullToRefresh>
    </PageTransition>
  );
};

// Add missing Cloud component
const Cloud = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4 4 0 003 15z" />
  </svg>
);

export default PestControlPage;