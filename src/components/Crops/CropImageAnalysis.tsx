import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import {
  Loader2, Upload, Leaf, BarChart2, Clock,
  ArrowRight, AlertTriangle, Calendar as CalendarIcon
} from 'lucide-react';
import { cn } from '../../lib/utils';

import { ImageAnalysisResult, ImageTimelineEntry, GrowthComparison } from '../../types/crops';
import imageService from '../../services/cropImageService';

interface CropImageAnalysisProps {
  cropId?: string;
  cropType?: string;
  fieldName?: string;
  onImageAnalyzed?: (result: ImageAnalysisResult) => void;
}

const CropImageAnalysis: React.FC<CropImageAnalysisProps> = ({ cropId, cropType, fieldName, onImageAnalyzed }) => {
  const [cropTypeValue, setCropTypeValue] = useState(cropType || '');
  const [fieldNameValue, setFieldNameValue] = useState(fieldName || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [timelineEntries, setTimelineEntries] = useState<ImageTimelineEntry[]>([]);
  const [timelineError, setTimelineError] = useState<string | null>(null); // Uncommented as it's being used
  
  // Comparison state
  const [beforeImage, setBeforeImage] = useState<ImageTimelineEntry | null>(null);
  const [afterImage, setAfterImage] = useState<ImageTimelineEntry | null>(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<GrowthComparison | null>(null);
  const [comparisonError, setComparisonError] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState('upload'); // Uncommented as it's being used
  
  useEffect(() => {
    if (cropId) {
      // Load the crop's timeline when a crop ID is provided
      const fetchTimeline = async () => {
        setTimelineLoading(true);
        try {
          const timeline = await imageService.getCropImageTimeline(cropId);
          setTimelineEntries(timeline);
        } catch {
          // Error handling for fetching crop timeline
          setTimelineError('Failed to load crop timeline');
        } finally {
          setTimelineLoading(false);
        }
      };
      
      fetchTimeline();
    }
  }, [cropId]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file');
      return;
    }
    
    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploadLoading(true);
    setUploadError(null);
    
    try {
      const result = await imageService.analyzeCropImage({
        file: selectedFile,
        cropType: cropTypeValue,
        fieldName: fieldNameValue,
        cropId: cropId
      });
      
      setAnalysisResult(result);
      
      if (onImageAnalyzed) {
        onImageAnalyzed(result);
      }
      
      // Refresh timeline if we have a cropId
      if (cropId) {
        const timeline = await imageService.getCropImageTimeline(cropId);
        setTimelineEntries(timeline);
      }
      
    } catch {
      // Error handling for image analysis
      setUploadError('Failed to analyze image. Please try again.');
    } finally {
      setUploadLoading(false);
    }
  };
  
  const handleCompareImages = async () => {
    if (!beforeImage || !afterImage) return;
    
    setComparisonLoading(true);
    setComparisonError(null);
    
    try {
      const comparison = await imageService.compareGrowth(beforeImage.id, afterImage.id);
      setComparisonResult(comparison);
      
    } catch {
      // Error handling for image comparison
      setComparisonError('Failed to compare images. Please try again.');
    } finally {
      setComparisonLoading(false);
    }
  };
  
  const selectImageForComparison = (image: ImageTimelineEntry, type: 'before' | 'after') => {
    if (type === 'before') {
      setBeforeImage(image);
    } else {
      setAfterImage(image);
    }
  };
  
  return (
    <div className="space-y-6">
      <Tabs 
        defaultValue="upload" 
        className="w-full"
        onValueChange={(value: string) => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">
            <Upload className="w-4 h-4 mr-2" />
            Image Upload & Analysis
          </TabsTrigger>
          <TabsTrigger value="timeline">
            <Clock className="w-4 h-4 mr-2" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="comparison">
            <BarChart2 className="w-4 h-4 mr-2" />
            Comparison
          </TabsTrigger>
        </TabsList>
        
        {/* Image Upload and Analysis Tab */}
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Crop Image</CardTitle>
              <CardDescription>
                Upload an image of your crops for disease detection and health analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Field Name</label>
                    <input 
                      type="text" 
                      value={fieldNameValue}
                      onChange={(e) => setFieldNameValue(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Enter field name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Crop Type</label>
                    <input 
                      type="text"
                      value={cropTypeValue}
                      onChange={(e) => setCropTypeValue(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="E.g., Corn, Wheat, Soybean"
                    />
                  </div>
                </div>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {!preview ? (
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <div className="space-y-2">
                        <div className="mx-auto h-12 w-12 text-gray-400">
                          <Upload className="h-12 w-12 mx-auto" />
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    </label>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative mx-auto max-w-xs">
                        <img 
                          src={preview} 
                          alt="Preview" 
                          className="mx-auto max-h-48 object-contain" 
                        />
                        <button
                          onClick={() => {
                            setSelectedFile(null);
                            setPreview(null);
                            setAnalysisResult(null);
                          }}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                        >
                          <span className="sr-only">Remove</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 truncate">
                          {selectedFile?.name}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                {uploadError && (
                  <div className="text-red-500 text-sm">
                    <AlertTriangle className="inline-block w-4 h-4 mr-1" />
                    {uploadError}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <div className="w-full flex justify-end">
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploadLoading}
                >
                  {uploadLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Analyze Image
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
          
          {/* Analysis Results */}
          {analysisResult && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Health Score */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="text-sm font-medium">Crop Health Score</h3>
                        <span className="text-sm font-semibold">
                          {analysisResult.healthScore}%
                        </span>
                      </div>
                      <Progress
                        value={analysisResult.healthScore}
                        className="h-2"
                        indicatorClassName={cn(
                          (analysisResult.healthScore || 0) > 70 
                            ? "bg-green-500" 
                            : (analysisResult.healthScore || 0) > 40 
                              ? "bg-yellow-500" 
                              : "bg-red-500"
                        )}
                      />
                    </div>
                    
                    {/* Growth Stage */}
                    <div>
                      <h3 className="text-sm font-medium mb-1">Estimated Growth Stage</h3>
                      <div className="flex items-center">
                        <Leaf className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm">{analysisResult.growthStage}</span>
                      </div>
                    </div>
                    
                    {/* Disease Detection */}
                    <div>
                      <h3 className="text-sm font-medium mb-1">Disease Detection</h3>
                      {(analysisResult.diseases || []).length > 0 ? (
                        <div className="space-y-2">
                          {(analysisResult.diseases || []).map((disease: NonNullable<ImageAnalysisResult['diseases']>[number], index: number) => (
                            <div key={index} className="bg-red-50 border-l-4 border-red-500 p-2">
                              <div className="flex items-start">
                                <AlertTriangle className="h-4 w-4 text-red-500 mr-1 mt-0.5" />
                                <div>
                                  <h4 className="text-sm font-medium text-red-800">
                                    {disease.name} 
                                    <span className="ml-2 text-xs font-normal text-red-700">
                                      ({(disease.confidence * 100).toFixed(1)}% confidence)
                                    </span>
                                  </h4>
                                  <p className="text-xs text-red-700 mt-0.5">{disease.description}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-green-50 border-l-4 border-green-500 p-2">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <svg className="h-4 w-4 text-green-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-2">
                              <p className="text-sm font-medium text-green-800">No diseases detected</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Recommendations */}
                    <div>
                      <h3 className="text-sm font-medium mb-1">Recommendations</h3>
                      <ul className="text-sm space-y-1 list-disc pl-4">
                        {(analysisResult.recommendations || []).map((rec: string, idx: number) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
        
        {/* Growth Timeline Tab */}
        <TabsContent value="timeline">
          {activeTab === 'timeline' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Growth Timeline
                </CardTitle>
                <CardDescription>
                  View the growth history of your crops over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {timelineLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">Loading timeline...</p>
                    </div>
                  </div>
                ) : timelineError ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="text-center">
                      <AlertTriangle className="h-12 w-12 mx-auto text-red-500" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Error Loading Timeline</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {timelineError}
                      </p>
                    </div>
                  </div>
                ) : timelineEntries.length === 0 ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="text-center">
                      <Clock className="h-12 w-12 mx-auto text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No timeline entries</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Upload images in the Image Upload tab to start tracking crop growth
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {timelineEntries.map((entry, index) => (
                      <div key={entry.id} className="relative">
                        {index !== timelineEntries.length - 1 && (
                          <div className="absolute top-12 bottom-0 left-7 border-l-2 border-gray-200 h-full"></div>
                        )}
                        <div className="flex gap-4">
                          <div className="relative z-10 flex-shrink-0 h-14 w-14 flex items-center justify-center rounded-full bg-blue-50 border-2 border-blue-100">
                            <CalendarIcon className="h-6 w-6 text-blue-500" />
                          </div>
                          <div className="flex-grow">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="text-lg font-medium">
                                {entry.metadata?.growthStage || "Growth Record"}
                              </h3>
                              <div className="text-sm text-gray-500">
                                {new Date(entry.timestamp).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="mb-3 flex flex-wrap gap-2">
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Health: {entry.metadata?.healthScore || 0}%
                              </Badge>
                              {entry.metadata?.fieldName && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  Field: {entry.metadata?.fieldName}
                                </Badge>
                              )}
                            </div>
                            <div className="relative aspect-video w-full sm:w-96 overflow-hidden rounded-lg border">
                              <img 
                                src={entry.imageUrl}
                                alt={`Growth on ${new Date(entry.timestamp).toLocaleDateString()}`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                                <div className="flex justify-between">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="text-xs h-7 bg-white hover:bg-white/90"
                                    onClick={() => selectImageForComparison(entry, 'before')}
                                  >
                                    Set as Before
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="text-xs h-7 bg-white hover:bg-white/90"
                                    onClick={() => selectImageForComparison(entry, 'after')}
                                  >
                                    Set as After
                                  </Button>
                                </div>
                              </div>
                            </div>
                            {entry.metadata?.diseases && entry.metadata?.diseases.length > 0 && (
                              <div className="mt-3">
                                <h4 className="text-sm font-medium text-red-600 mb-1">Detected Issues:</h4>
                                <div className="space-y-1">
                                  {(entry.metadata?.diseases || []).map((disease: NonNullable<NonNullable<ImageTimelineEntry['metadata']>['diseases']>[number], idx: number) => (
                                    <div key={idx} className="text-xs text-red-600 flex items-center">
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      {disease.name}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Comparison Tab */}
        <TabsContent value="comparison">
          {activeTab === 'comparison' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-purple-600" />
                  Growth Comparison
                </CardTitle>
                <CardDescription>
                  Compare two images to analyze growth differences
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!beforeImage || !afterImage ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="border-2 border-dashed rounded-lg p-4 text-center aspect-video flex flex-col items-center justify-center">
                        {beforeImage ? (
                          <div className="relative w-full h-full">
                            <img 
                              src={beforeImage.imageUrl} 
                              alt="Before" 
                              className="w-full h-full object-cover rounded"
                            />
                            <Button 
                              size="sm" 
                              variant="destructive"
                              className="absolute top-2 right-2"
                              onClick={() => setBeforeImage(null)}
                            >
                              Clear
                            </Button>
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-sm">
                              {new Date(beforeImage.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="mx-auto h-12 w-12 text-gray-400">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <p className="mt-2 text-sm text-gray-600 font-medium">Before Image</p>
                            <p className="mt-1 text-xs text-gray-500">
                              Select "Set as Before" on an image in the Timeline tab
                            </p>
                          </>
                        )}
                      </div>
                      
                      <div className="border-2 border-dashed rounded-lg p-4 text-center aspect-video flex flex-col items-center justify-center">
                        {afterImage ? (
                          <div className="relative w-full h-full">
                            <img 
                              src={afterImage.imageUrl} 
                              alt="After" 
                              className="w-full h-full object-cover rounded"
                            />
                            <Button 
                              size="sm" 
                              variant="destructive"
                              className="absolute top-2 right-2"
                              onClick={() => setAfterImage(null)}
                            >
                              Clear
                            </Button>
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-sm">
                              {new Date(afterImage.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="mx-auto h-12 w-12 text-gray-400">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <p className="mt-2 text-sm text-gray-600 font-medium">After Image</p>
                            <p className="mt-1 text-xs text-gray-500">
                              Select "Set as After" on an image in the Timeline tab
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-center">
                      <Button
                        onClick={handleCompareImages}
                        disabled={comparisonLoading || !beforeImage || !afterImage}
                      >
                        {comparisonLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Comparing...
                          </>
                        ) : (
                          <>
                            Compare Images
                            <BarChart2 className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {comparisonError && (
                      <div className="text-red-500 text-sm text-center">
                        <AlertTriangle className="inline-block w-4 h-4 mr-1" />
                        {comparisonError}
                      </div>
                    )}
                  </div>
                ) : comparisonResult ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-base font-medium mb-3">Growth Metrics</h3>
                        <div className="space-y-4">
                          {/* Height Change */}
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <div className="text-sm font-medium">Height Change</div>
                              <div 
                                className={cn(
                                  "text-sm font-bold",
                                  comparisonResult.growthMetrics.heightChange >= 0 
                                    ? "text-green-600" 
                                    : "text-red-600"
                                )}
                              >
                                {comparisonResult.growthMetrics.heightChange > 0 ? '+' : ''}
                                {comparisonResult.growthMetrics.heightChange}%
                              </div>
                            </div>
                            <Progress 
                              value={Math.abs(comparisonResult.growthMetrics.heightChange)}
                              className="h-2"
                              style={{
                                background: comparisonResult.growthMetrics.heightChange >= 0 
                                  ? "#dcfce7" : "#fee2e2",
                                backgroundColor: comparisonResult.growthMetrics.heightChange >= 0 
                                  ? "#dcfce7" : "#fee2e2"
                              }}
                              indicatorClassName={cn(
                                comparisonResult.growthMetrics.heightChange >= 0 
                                  ? "bg-green-600" : "bg-red-600"
                              )}
                            />
                          </div>
                          
                          {/* Estimated Growth Rate */}
                          <div className="flex justify-between items-center">
                            <div className="text-sm font-medium">Estimated Growth Rate</div>
                            <div className="text-sm font-bold text-blue-600">
                              {comparisonResult.growthMetrics.estimatedGrowthRate.toFixed(2)}% per day
                            </div>
                          </div>
                          
                          {/* Health Score Change */}
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <div className="text-sm font-medium">Health Score Change</div>
                              <div 
                                className={cn(
                                  "text-sm font-bold",
                                  comparisonResult.growthMetrics.healthChangeScore >= 0 
                                    ? "text-green-600" 
                                    : "text-red-600"
                                )}
                              >
                                {comparisonResult.growthMetrics.healthChangeScore > 0 ? '+' : ''}
                                {comparisonResult.growthMetrics.healthChangeScore}
                              </div>
                            </div>
                            <Progress 
                              value={Math.min(100, Math.abs(comparisonResult.growthMetrics.healthChangeScore))}
                              className="h-2"
                              style={{
                                background: comparisonResult.growthMetrics.healthChangeScore >= 0 
                                  ? "#dcfce7" : "#fee2e2",
                                backgroundColor: comparisonResult.growthMetrics.healthChangeScore >= 0 
                                  ? "#dcfce7" : "#fee2e2"
                              }}
                              indicatorClassName={cn(
                                comparisonResult.growthMetrics.healthChangeScore >= 0 
                                  ? "bg-green-600" : "bg-red-600"
                              )}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-base font-medium mb-3">Analysis</h3>
                        <div className="bg-gray-50 border rounded-md p-4 text-sm">
                          {comparisonResult.analysis}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="relative border rounded-md overflow-hidden">
                        <img 
                          src={beforeImage.imageUrl} 
                          alt="Before" 
                          className="w-full aspect-video object-cover"
                        />
                        <div className="absolute top-0 left-0 bg-black/60 text-white px-3 py-1 text-sm">
                          Before: {new Date(beforeImage.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="relative border rounded-md overflow-hidden">
                        <img 
                          src={afterImage.imageUrl} 
                          alt="After" 
                          className="w-full aspect-video object-cover"
                        />
                        <div className="absolute top-0 left-0 bg-black/60 text-white px-3 py-1 text-sm">
                          After: {new Date(afterImage.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-center">
                      <Button 
                        variant="outline"
                        onClick={() => setComparisonResult(null)}
                      >
                        Compare Different Images
                      </Button>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CropImageAnalysis;
