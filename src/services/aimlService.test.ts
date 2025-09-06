import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { aimlService } from './aimlService';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('aimlService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getPestControl', () => {
    it('should fetch pest control data successfully', async () => {
      const mockResponse = {
        data: {
          detectedPests: [
            { 
              name: 'Fall Armyworm', 
              scientificName: 'Spodoptera frugiperda', 
              confidence: 0.92,
              treatment: ['Apply neem oil', 'Use pheromone traps']
            }
          ],
          recommendations: ['Monitor fields regularly']
        }
      };
      
      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await aimlService.getPestControl({
        cropType: 'maize',
        location: { lat: 0, lon: 0 }
      });

      expect(result).toEqual(mockResponse);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/pest/detect',
        { cropType: 'maize', location: { lat: 0, lon: 0 } }
      );
    });

    it('should handle API errors properly', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('API error'));

      await expect(aimlService.getPestControl({
        cropType: 'maize',
        location: { lat: 0, lon: 0 }
      })).rejects.toThrow('API error');
    });
  });

  describe('analyzePestImage', () => {
    it('should analyze pest image successfully', async () => {
      const mockResponse = {
        detectedPests: [
          { 
            name: 'Aphids', 
            scientificName: 'Aphidoidea',
            confidence: 0.85,
            treatment: ['Introduce ladybugs', 'Apply insecticidal soap']
          }
        ],
        recommendations: ['Treat immediately to prevent spread']
      };
      
      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await aimlService.analyzePestImage('base64image');

      expect(result).toEqual(mockResponse);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/pest/analyze-image',
        { image: 'base64image' }
      );
    });
  });

  describe('getSoilAnalysis', () => {
    it('should fetch soil analysis data successfully', async () => {
      const mockResponse = {
        pH: 6.5,
        nutrients: {
          nitrogen: 45,
          phosphorus: 30,
          potassium: 200,
          organicMatter: 3.5
        },
        moisture: 0.42,
        temperature: 23,
        recommendations: [
          'Apply organic matter to improve soil structure',
          'Monitor soil pH levels and adjust if needed'
        ]
      };
      
      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await aimlService.getSoilAnalysis(
        { lat: 0, lon: 0 }, 
        { cropType: 'maize', soilType: 'clay' }
      );

      expect(result).toEqual(mockResponse);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/soil/analyze',
        { 
          location: { lat: 0, lon: 0 }, 
          cropType: 'maize', 
          soilType: 'clay' 
        }
      );
    });
  });

  describe('getIrrigationRecommendations', () => {
    it('should fetch irrigation recommendations successfully', async () => {
      const mockResponse = {
        recommendedWaterAmount: 25, // mm
        schedule: [
          { day: 'Monday', amount: 8 },
          { day: 'Thursday', amount: 8 },
          { day: 'Saturday', amount: 9 }
        ],
        recommendations: [
          'Water early in the morning to reduce evaporation',
          'Consider installing drip irrigation for more efficient water use'
        ]
      };
      
      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await aimlService.getIrrigationRecommendations({
        location: { lat: 0, lon: 0 },
        cropType: 'maize',
        soilType: 'loam',
        fieldSize: 2
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('getEducationalContent', () => {
    it('should fetch educational content successfully', async () => {
      const mockResponse = {
        courses: [
          {
            id: '1',
            title: 'Soil Health Management',
            description: 'Learn about maintaining healthy soil for optimal crop growth',
            skillLevel: 'beginner',
            duration: '30 minutes',
            topics: ['soil', 'nutrients', 'organic farming'],
            url: 'https://example.com/courses/soil-health',
            thumbnail: 'https://example.com/thumbnails/soil-health.jpg'
          }
        ],
        totalCount: 1
      };
      
      // Mock async delay
      const mockDelay = vi.fn().mockImplementation(() => new Promise(resolve => {
        setTimeout(resolve, 10);
      }));
      
      global.setTimeout = vi.fn() as any;
      
      await mockDelay();
      
      const result = await aimlService.getEducationalContent({
        topic: 'soil',
        skillLevel: 'beginner'
      });

      expect(result).toHaveProperty('courses');
      expect(result.courses.length).toBeGreaterThan(0);
      expect(result.courses[0]).toHaveProperty('title');
      expect(result.courses[0].skillLevel).toBe('beginner');
    });
  });
});
