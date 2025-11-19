import axios from 'axios';
import plantIdService from '../plantIdService';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('plantIdService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock axios.create to return a mocked instance
    mockedAxios.create.mockReturnValue({
      post: vi.fn()
    } as any);
  });

  describe('identifyPlant', () => {
    it('should correctly process plant identification response', async () => {
      // Mock the API response
      const mockResponse = {
        data: {
          id: 'test-id',
          suggestions: [
            {
              id: 1,
              name: 'Monstera deliciosa',
              probability: 0.95,
              similar_images: [
                {
                  id: 'img-1',
                  url: 'https://example.com/image.jpg',
                  url_small: 'https://example.com/image-small.jpg',
                  similarity: 0.9,
                  license_name: 'CC',
                  license_url: 'https://example.com/license'
                }
              ],
              details: {
                common_names: ['Swiss Cheese Plant'],
                wiki_description: {
                  value: 'Monstera deliciosa is a species of flowering plant.',
                  citation: 'Wikipedia',
                  license_name: 'CC',
                  license_url: 'https://example.com/license'
                }
              }
            }
          ]
        }
      };

      // Setup axios post to return mock response
      const postMock = vi.fn().mockResolvedValue(mockResponse);
      (mockedAxios.create as any).mockReturnValue({
        post: postMock
      });

      // Call the service method
      const results = await plantIdService.identifyPlant(['base64image']);

      // Verify correct API endpoint and data was called
      expect(postMock).toHaveBeenCalledWith('/identification', {
        images: ['base64image'],
        similar_images: true,
        plant_details: ["common_names", "taxonomy", "url", "description", "wiki_description", "watering", "images"]
      });

      // Verify the response was correctly processed
      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        plantName: 'Monstera deliciosa',
        scientificName: 'Monstera deliciosa',
        probability: 0.95,
        details: {
          common_names: ['Swiss Cheese Plant'],
          wiki_description: {
            value: 'Monstera deliciosa is a species of flowering plant.',
            citation: 'Wikipedia',
            license_name: 'CC',
            license_url: 'https://example.com/license'
          }
        },
        imageUrl: 'https://example.com/image-small.jpg'
      });
    });

    it('should handle errors when identifying plants', async () => {
      // Setup axios post to throw error
      const postMock = vi.fn().mockRejectedValue(new Error('API error'));
      (mockedAxios.create as any).mockReturnValue({
        post: postMock
      });

      // Call the service method and expect it to throw
      await expect(plantIdService.identifyPlant(['base64image']))
        .rejects
        .toThrow('Failed to identify plant');
    });
  });

  describe('detectDisease', () => {
    it('should correctly process disease detection response', async () => {
      // Mock the API response
      const mockResponse = {
        data: {
          id: 'test-id',
          suggestions: [
            {
              id: 1,
              name: 'Powdery Mildew',
              probability: 0.85,
              similar_images: [
                {
                  id: 'img-1',
                  url: 'https://example.com/disease.jpg',
                  url_small: 'https://example.com/disease-small.jpg',
                  similarity: 0.9,
                  license_name: 'CC',
                  license_url: 'https://example.com/license'
                }
              ],
              details: {
                description: {
                  value: 'Powdery mildew is a fungal disease. Treatment includes fungicides.',
                  citation: 'Source',
                  license_name: 'CC',
                  license_url: 'https://example.com/license'
                }
              }
            }
          ]
        }
      };

      // Setup axios post to return mock response
      const postMock = vi.fn().mockResolvedValue(mockResponse);
      (mockedAxios.create as any).mockReturnValue({
        post: postMock
      });

      // Call the service method
      const results = await plantIdService.detectDisease(['base64image']);

      // Verify correct API endpoint and data was called
      expect(postMock).toHaveBeenCalledWith('/health_assessment', {
        images: ['base64image'],
        disease_details: ["description", "treatment", "classification", "common_names"],
        modifiers: ["disease_similar_images"]
      });

      // Verify the response was correctly processed
      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        disease: 'Powdery Mildew',
        probability: 0.85,
        scientificName: 'Powdery Mildew',
        description: 'Powdery mildew is a fungal disease. Treatment includes fungicides.',
        treatment: ['Powdery mildew is a fungal disease.']
      });
    });

    it('should handle errors when detecting diseases', async () => {
      // Setup axios post to throw error
      const postMock = vi.fn().mockRejectedValue(new Error('API error'));
      (mockedAxios.create as any).mockReturnValue({
        post: postMock
      });

      // Call the service method and expect it to throw
      await expect(plantIdService.detectDisease(['base64image']))
        .rejects
        .toThrow('Failed to detect plant disease');
    });
  });

  describe('fileToBase64', () => {
    it('should convert a file to base64', async () => {
      // Create a mock File object
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      // Mock FileReader
      const originalFileReader = global.FileReader;
      const mockFileReader = {
        readAsDataURL: vi.fn(),
        onload: null as any,
        onerror: null as any,
        result: 'data:image/jpeg;base64,dGVzdA==' // 'test' in base64
      };
      
      global.FileReader = vi.fn(() => mockFileReader) as any;
      
      // When readAsDataURL is called, trigger onload
      mockFileReader.readAsDataURL = vi.fn(() => {
        setTimeout(() => {
          if (mockFileReader.onload) {
            mockFileReader.onload({} as any);
          }
        }, 0);
      });

      // Call the method
      const promise = plantIdService.fileToBase64(mockFile);
      
      // Verify FileReader was used correctly
      expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(mockFile);
      
      // Wait for the promise to resolve
      const base64 = await promise;
      
      // Verify the result
      expect(base64).toBe('dGVzdA==');
      
      // Restore original FileReader
      global.FileReader = originalFileReader;
    });
    
    it('should reject if FileReader errors', async () => {
      // Create a mock File object
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      // Mock FileReader
      const originalFileReader = global.FileReader;
      const mockFileReader = {
        readAsDataURL: vi.fn(),
        onload: null as any,
        onerror: null as any
      };
      
      global.FileReader = vi.fn(() => mockFileReader) as any;
      
      // When readAsDataURL is called, trigger onerror
      mockFileReader.readAsDataURL = vi.fn(() => {
        setTimeout(() => {
          if (mockFileReader.onerror) {
            mockFileReader.onerror(new Error('File read error'));
          }
        }, 0);
      });

      // Call the method
      const promise = plantIdService.fileToBase64(mockFile);
      
      // Wait for the promise to reject
      await expect(promise).rejects.toEqual(new Error('File read error'));
      
      // Restore original FileReader
      global.FileReader = originalFileReader;
    });
  });
});
