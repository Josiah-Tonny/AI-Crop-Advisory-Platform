import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { aimlService } from './aimlService';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as any;

describe('aimlService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getPestControl', () => {
    it('should fetch pest control data successfully', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: {} });

      const result = await aimlService.getPestControl({
        cropType: 'maize',
        location: { lat: 0, lon: 0 }
      });

      expect(result).toEqual({});
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/pest/detect',
        expect.objectContaining({
          cropType: 'maize',
          location: { lat: 0, lon: 0 }
        })
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
      mockedAxios.post.mockResolvedValueOnce({ data: {} });

      const result = await aimlService.analyzePestImage('base64image');

      expect(result).toEqual({});
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/pest/analyze-image',
        { image: 'base64image' }
      );
    });
  });

  describe('getCropRecommendations', () => {
    it('should fetch crop recommendations successfully', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: {} });

      const result = await aimlService.getCropRecommendations({
        location: { lat: 0, lon: 0 },
        soilType: 'loam'
      });

      expect(result).toEqual({});
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/crop/recommendations',
        {
          location: { lat: 0, lon: 0 },
          soilType: 'loam'
        }
      );
    });
  });

  describe('getSoilAnalysis', () => {
    it('should fetch soil analysis data successfully', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: {} });

      const result = await aimlService.getSoilAnalysis(
        { lat: 0, lon: 0 }, 
        { cropType: 'maize', soilType: 'clay' }
      );

      expect(result).toEqual({});
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/soil/analysis',
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
      mockedAxios.post.mockResolvedValueOnce({ data: {} });

      const result = await aimlService.getIrrigationRecommendations({
        location: { lat: 0, lon: 0 },
        cropType: 'maize',
        soilType: 'loam',
        fieldSize: 2
      });

      expect(result).toEqual({});
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/irrigation/recommendations',
        {
          location: { lat: 0, lon: 0 },
          cropType: 'maize',
          soilType: 'loam',
          fieldSize: 2
        }
      );
    });
  });
});
