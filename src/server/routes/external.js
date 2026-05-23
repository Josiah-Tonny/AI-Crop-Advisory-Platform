import express from 'express';
import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const LOCATIONIQ_API_KEY = process.env.LOCATIONIQ_API_KEY;
const PLANT_ID_API_KEY = process.env.PLANT_ID_API_KEY;
const AGROMONITORING_API_KEY = process.env.AGROMONITORING_API_KEY;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

const openWeatherClient = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5',
  timeout: 10000
});

const locationClient = axios.create({
  baseURL: 'https://us1.locationiq.com/v1',
  timeout: 10000
});

const plantIdClient = axios.create({
  baseURL: 'https://plant.id/api/v3',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

const agroClient = axios.create({
  baseURL: 'https://api.agromonitoring.com/agro/1.0',
  timeout: 15000
});

const youtubeClient = axios.create({
  baseURL: 'https://www.googleapis.com/youtube/v3',
  timeout: 15000,
  params: {
    key: YOUTUBE_API_KEY
  }
});

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true
});

const extractCloudinaryPublicId = (url) => {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split('/');
    const uploadIndex = segments.indexOf('upload');
    if (uploadIndex === -1) return null;
    return segments.slice(uploadIndex + 1).join('/');
  } catch {
    return null;
  }
};

const requireParam = (name, value, res) => {
  if (value === undefined || value === null || value === '') {
    res.status(400).json({
      status: 'fail',
      message: `Missing required parameter: ${name}`
    });
    return false;
  }
  return true;
};

router.get('/weather/current', async (req, res) => {
  if (!OPENWEATHER_API_KEY) {
    return res.status(500).json({ status: 'error', message: 'OpenWeather API key is not configured' });
  }

  const { lat, lon } = req.query;
  if (!requireParam('lat', lat, res) || !requireParam('lon', lon, res)) return;

  try {
    const response = await openWeatherClient.get('/weather', {
      params: {
        lat,
        lon,
        appid: OPENWEATHER_API_KEY,
        units: 'metric'
      }
    });

    res.json(response.data);
  } catch (error) {
    const status = axios.isAxiosError(error) && error.response?.status ? error.response.status : 500;
    res.status(status).json({
      status: 'error',
      message: axios.isAxiosError(error) ? error.response?.data?.message || error.message : 'Failed to fetch weather data'
    });
  }
});

router.get('/weather/forecast', async (req, res) => {
  if (!OPENWEATHER_API_KEY) {
    return res.status(500).json({ status: 'error', message: 'OpenWeather API key is not configured' });
  }

  const { lat, lon } = req.query;
  if (!requireParam('lat', lat, res) || !requireParam('lon', lon, res)) return;

  try {
    const response = await openWeatherClient.get('/forecast', {
      params: {
        lat,
        lon,
        appid: OPENWEATHER_API_KEY,
        units: 'metric'
      }
    });

    res.json(response.data);
  } catch (error) {
    const status = axios.isAxiosError(error) && error.response?.status ? error.response.status : 500;
    res.status(status).json({
      status: 'error',
      message: axios.isAxiosError(error) ? error.response?.data?.message || error.message : 'Failed to fetch weather forecast'
    });
  }
});

router.get('/weather/air-quality', async (req, res) => {
  if (!OPENWEATHER_API_KEY) {
    return res.status(500).json({ status: 'error', message: 'OpenWeather API key is not configured' });
  }

  const { lat, lon } = req.query;
  if (!requireParam('lat', lat, res) || !requireParam('lon', lon, res)) return;

  try {
    const response = await openWeatherClient.get('/air_pollution', {
      params: {
        lat,
        lon,
        appid: OPENWEATHER_API_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    const status = axios.isAxiosError(error) && error.response?.status ? error.response.status : 500;
    res.status(status).json({
      status: 'error',
      message: axios.isAxiosError(error) ? error.response?.data?.message || error.message : 'Failed to fetch air quality data'
    });
  }
});

router.get('/geo/search', async (req, res) => {
  if (!LOCATIONIQ_API_KEY) {
    return res.status(500).json({ status: 'error', message: 'LocationIQ API key is not configured' });
  }

  const { q } = req.query;
  if (!requireParam('q', q, res)) return;

  try {
    const response = await locationClient.get('/search.php', {
      params: {
        q,
        key: LOCATIONIQ_API_KEY,
        format: 'json',
        limit: 5
      }
    });
    res.json(response.data);
  } catch (error) {
    const status = axios.isAxiosError(error) && error.response?.status ? error.response.status : 500;
    res.status(status).json({
      status: 'error',
      message: axios.isAxiosError(error) ? error.response?.data?.error || error.message : 'Failed to search geographic locations'
    });
  }
});

router.get('/geo/reverse', async (req, res) => {
  if (!LOCATIONIQ_API_KEY) {
    return res.status(500).json({ status: 'error', message: 'LocationIQ API key is not configured' });
  }

  const { lat, lon } = req.query;
  if (!requireParam('lat', lat, res) || !requireParam('lon', lon, res)) return;

  try {
    const response = await locationClient.get('/reverse.php', {
      params: {
        lat,
        lon,
        key: LOCATIONIQ_API_KEY,
        format: 'json'
      }
    });
    res.json(response.data);
  } catch (error) {
    const status = axios.isAxiosError(error) && error.response?.status ? error.response.status : 500;
    res.status(status).json({
      status: 'error',
      message: axios.isAxiosError(error) ? error.response?.data?.error || error.message : 'Failed to reverse geocode coordinates'
    });
  }
});

router.get('/agromonitoring/fields/:fieldId', async (req, res) => {
  if (!AGROMONITORING_API_KEY) {
    return res.status(500).json({ status: 'error', message: 'AgroMonitoring API key is not configured' });
  }

  const { fieldId } = req.params;
  if (!fieldId) {
    return res.status(400).json({ status: 'fail', message: 'Field ID is required' });
  }

  try {
    const response = await agroClient.get(`/polygons/${fieldId}`, {
      params: {
        appid: AGROMONITORING_API_KEY
      }
    });
    res.json(response.data);
  } catch (error) {
    const status = axios.isAxiosError(error) && error.response?.status ? error.response.status : 500;
    res.status(status).json({
      status: 'error',
      message: axios.isAxiosError(error) ? error.response?.data?.message || error.message : 'Failed to fetch field information'
    });
  }
});

router.get('/agromonitoring/soil', async (req, res) => {
  if (!AGROMONITORING_API_KEY) {
    return res.status(500).json({ status: 'error', message: 'AgroMonitoring API key is not configured' });
  }

  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ status: 'fail', message: 'Latitude and longitude are required' });
  }

  try {
    const polygon = {
      name: 'temporary_soil_polygon',
      geo_json: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [Number(lon) - 0.01, Number(lat) - 0.01],
            [Number(lon) + 0.01, Number(lat) - 0.01],
            [Number(lon) + 0.01, Number(lat) + 0.01],
            [Number(lon) - 0.01, Number(lat) + 0.01],
            [Number(lon) - 0.01, Number(lat) - 0.01]
          ]]
        }
      }
    };

    const createResponse = await agroClient.post('/polygons', polygon, {
      params: {
        appid: AGROMONITORING_API_KEY
      }
    });

    const polyId = createResponse.data.id || createResponse.data._id || createResponse.data.polyid;
    if (!polyId) {
      throw new Error('Unable to create AgroMonitoring polygon');
    }

    const soilResponse = await agroClient.get('/soil', {
      params: {
        appid: AGROMONITORING_API_KEY,
        polyid: polyId
      }
    });

    await agroClient.delete(`/polygons/${polyId}`, {
      params: {
        appid: AGROMONITORING_API_KEY
      }
    }).catch(() => {
      // best-effort cleanup
    });

    res.json(soilResponse.data);
  } catch (error) {
    const status = axios.isAxiosError(error) && error.response?.status ? error.response.status : 500;
    res.status(status).json({
      status: 'error',
      message: axios.isAxiosError(error) ? error.response?.data?.message || error.message : 'Failed to fetch agro monitoring soil data'
    });
  }
});

router.get('/youtube/search', async (req, res) => {
  if (!YOUTUBE_API_KEY) {
    return res.status(500).json({ status: 'error', message: 'YouTube API key is not configured' });
  }

  const { q, maxResults = 10 } = req.query;
  if (!q) {
    return res.status(400).json({ status: 'fail', message: 'Search query is required' });
  }

  try {
    const response = await youtubeClient.get('/search', {
      params: {
        part: 'snippet',
        q,
        type: 'video',
        maxResults,
        relevanceLanguage: 'en',
        videoCategoryId: '28',
        videoEmbeddable: 'true',
        safeSearch: 'strict'
      }
    });
    res.json(response.data);
  } catch (error) {
    const status = axios.isAxiosError(error) && error.response?.status ? error.response.status : 500;
    res.status(status).json({
      status: 'error',
      message: axios.isAxiosError(error) ? error.response?.data?.error || error.message : 'Failed to search YouTube videos'
    });
  }
});

router.get('/youtube/videos', async (req, res) => {
  if (!YOUTUBE_API_KEY) {
    return res.status(500).json({ status: 'error', message: 'YouTube API key is not configured' });
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ status: 'fail', message: 'Video ID is required' });
  }

  try {
    const response = await youtubeClient.get('/videos', {
      params: {
        part: 'snippet,contentDetails,statistics',
        id
      }
    });
    res.json(response.data);
  } catch (error) {
    const status = axios.isAxiosError(error) && error.response?.status ? error.response.status : 500;
    res.status(status).json({
      status: 'error',
      message: axios.isAxiosError(error) ? error.response?.data?.error || error.message : 'Failed to fetch YouTube video details'
    });
  }
});

router.post('/cloudinary/upload', async (req, res) => {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return res.status(500).json({ status: 'error', message: 'Cloudinary credentials are not configured' });
  }

  const { file, options = {} } = req.body;
  if (!file) {
    return res.status(400).json({ status: 'fail', message: 'Image file is required' });
  }

  try {
    const response = await cloudinary.uploader.upload(file, {
      folder: options.folder || 'agri-advisor',
      tags: options.tags || [],
      context: options.context || {}
    });
    res.json(response);
  } catch (error) {
    const status = axios.isAxiosError(error) && error.response?.status ? error.response.status : 500;
    res.status(status).json({
      status: 'error',
      message: axios.isAxiosError(error) ? error.response?.data?.error || error.message : 'Failed to upload image to Cloudinary'
    });
  }
});

router.post('/cloudinary/analyze', async (req, res) => {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return res.status(500).json({ status: 'error', message: 'Cloudinary credentials are not configured' });
  }

  const { imageUrl } = req.body;
  if (!imageUrl) {
    return res.status(400).json({ status: 'fail', message: 'Image URL is required' });
  }

  const publicId = extractCloudinaryPublicId(imageUrl);
  if (!publicId) {
    return res.status(400).json({ status: 'fail', message: 'Invalid Cloudinary image URL' });
  }

  try {
    const resource = await cloudinary.api.resource(publicId, {
      colors: true,
      image_metadata: true
    });
    res.json({
      ...resource,
      analysis: {
        tags: resource.tags || [],
        colors: resource.colors,
        metadata: resource.metadata || {}
      }
    });
  } catch (error) {
    const status = axios.isAxiosError(error) && error.response?.status ? error.response.status : 500;
    res.status(status).json({
      status: 'error',
      message: axios.isAxiosError(error) ? error.response?.data?.error || error.message : 'Failed to analyze Cloudinary image'
    });
  }
});

router.get('/cloudinary/timeline', async (req, res) => {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return res.status(500).json({ status: 'error', message: 'Cloudinary credentials are not configured' });
  }

  const { cropId } = req.query;
  try {
    const expression = cropId
      ? `metadata.crop_id=${cropId}`
      : 'resource_type:image';

    const result = await cloudinary.search
      .expression(expression)
      .sort_by('uploaded_at', 'desc')
      .max_results(50)
      .execute();

    const entries = result.resources.map((resource) => ({
      id: resource.public_id,
      date: resource.created_at,
      imageUrl: resource.secure_url,
      thumbnailUrl: resource.secure_url,
      metadata: resource.metadata,
      measurements: {
        height: resource.height,
        width: resource.width
      }
    }));

    res.json(entries);
  } catch (error) {
    const status = axios.isAxiosError(error) && error.response?.status ? error.response.status : 500;
    res.status(status).json({
      status: 'error',
      message: axios.isAxiosError(error) ? error.response?.data?.error || error.message : 'Failed to fetch Cloudinary timeline'
    });
  }
});

router.post('/cloudinary/compare', async (req, res) => {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return res.status(500).json({ status: 'error', message: 'Cloudinary credentials are not configured' });
  }

  const { beforeImageId, afterImageId } = req.body;
  if (!beforeImageId || !afterImageId) {
    return res.status(400).json({ status: 'fail', message: 'Both beforeImageId and afterImageId are required' });
  }

  try {
    const beforeResource = await cloudinary.api.resource(beforeImageId);
    const afterResource = await cloudinary.api.resource(afterImageId);
    const compareUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/c_fill,h_400,w_400/${afterImageId}/fl_layer_apply,g_east,h_400,w_400,x_400/c_fill,h_400,w_400/${beforeImageId}`;

    res.json({
      comparisonUrl: compareUrl,
      beforeImageUrl: beforeResource.secure_url,
      afterImageUrl: afterResource.secure_url,
      beforeDate: beforeResource.created_at,
      afterDate: afterResource.created_at,
      growthMetrics: {
        heightChange: (afterResource.height || 0) - (beforeResource.height || 0),
        widthChange: (afterResource.width || 0) - (beforeResource.width || 0),
        colorIntensity: 75,
        estimatedGrowthRate: 0,
        healthChangeScore: 0
      },
      analysis: 'Comparison generated from Cloudinary resource metadata.'
    });
  } catch (error) {
    const status = axios.isAxiosError(error) && error.response?.status ? error.response.status : 500;
    res.status(status).json({
      status: 'error',
      message: axios.isAxiosError(error) ? error.response?.data?.error || error.message : 'Failed to compare Cloudinary images'
    });
  }
});

router.post('/plant-id/identify', async (req, res) => {
  if (!PLANT_ID_API_KEY) {
    return res.status(500).json({ status: 'error', message: 'Plant ID API key is not configured' });
  }

  const { images, modifiers, plant_details } = req.body;
  if (!Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ status: 'fail', message: 'Request must include an array of images' });
  }

  try {
    const response = await plantIdClient.post('/identification', {
      images,
      modifiers: modifiers || ['crops_fast', 'similar_images'],
      plant_language: 'en',
      plant_details: plant_details || ['common_names', 'url', 'description', 'taxonomy', 'rank', 'scientific_name']
    }, {
      headers: {
        'Api-Key': PLANT_ID_API_KEY
      }
    });
    res.json(response.data);
  } catch (error) {
    const status = axios.isAxiosError(error) && error.response?.status ? error.response.status : 500;
    res.status(status).json({
      status: 'error',
      message: axios.isAxiosError(error) ? error.response?.data?.error || error.message : 'Failed to identify plant'
    });
  }
});

router.post('/plant-id/health-assessment', async (req, res) => {
  if (!PLANT_ID_API_KEY) {
    return res.status(500).json({ status: 'error', message: 'Plant ID API key is not configured' });
  }

  const { images, modifiers, disease_details } = req.body;
  if (!Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ status: 'fail', message: 'Request must include an array of images' });
  }

  try {
    const response = await plantIdClient.post('/health_assessment', {
      images,
      modifiers: modifiers || ['disease_similar_images'],
      disease_details: disease_details || ['description', 'treatment', 'classification', 'common_names']
    }, {
      headers: {
        'Api-Key': PLANT_ID_API_KEY
      }
    });
    res.json(response.data);
  } catch (error) {
    const status = axios.isAxiosError(error) && error.response?.status ? error.response.status : 500;
    res.status(status).json({
      status: 'error',
      message: axios.isAxiosError(error) ? error.response?.data?.error || error.message : 'Failed to run health assessment'
    });
  }
});

export default router;
