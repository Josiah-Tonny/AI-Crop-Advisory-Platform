import express from 'express';
import axios from 'axios';
import { analyzePestImage } from '../utils/aimlApiClient.js';

const router = express.Router();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

router.post('/chat', async (req, res) => {
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ status: 'error', message: 'OpenAI API key is not configured' });
  }

  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ status: 'fail', message: 'Chat query is required' });
  }

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert agricultural advisor providing concise, practical farming advice. Keep responses under 200 words.'
        },
        {
          role: 'user',
          content: query
        }
      ],
      temperature: 0.7,
      max_tokens: 300
    }, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`
      }
    });

    return res.status(200).json({
      content: response.data?.choices?.[0]?.message?.content || ''
    });
  } catch (error) {
    const status = axios.isAxiosError(error) && error.response?.status ? error.response.status : 500;
    return res.status(status).json({
      status: 'error',
      message: axios.isAxiosError(error) ? error.response?.data?.error || error.message : 'Failed to generate farming advice'
    });
  }
});

router.post('/detect-plant-disease', async (req, res) => {
  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ status: 'fail', message: 'Image data is required' });
  }

  try {
    const result = await analyzePestImage(image);
    return res.status(200).json(result);
  } catch (error) {
    const status = axios.isAxiosError(error) && error.response?.status ? error.response.status : 500;
    return res.status(status).json({
      status: 'error',
      message: axios.isAxiosError(error) ? error.response?.data?.error || error.message : 'Failed to detect plant disease'
    });
  }
});

export default router;
