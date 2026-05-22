import express from 'express';
import axios from 'axios';

const router = express.Router();

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const LOCATIONIQ_API_KEY = process.env.LOCATIONIQ_API_KEY;
const PLANT_ID_API_KEY = process.env.PLANT_ID_API_KEY;

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
