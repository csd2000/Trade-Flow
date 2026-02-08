import { Router, Request, Response } from 'express';
import { elevenLabsTTS } from './elevenlabs-tts-service';

const router = Router();

router.post('/synthesize', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (text.length > 5000) {
      return res.status(400).json({ error: 'Text exceeds maximum length of 5000 characters' });
    }

    if (!elevenLabsTTS.isConfigured()) {
      return res.status(503).json({ 
        error: 'Text-to-speech service not configured',
        message: 'ElevenLabs API key not set'
      });
    }

    const result = await elevenLabsTTS.synthesizeSpeech(text);

    if (!result) {
      return res.status(500).json({ error: 'Failed to generate speech' });
    }

    res.set({
      'Content-Type': result.contentType,
      'Content-Length': result.audioBuffer.length.toString(),
      'Cache-Control': 'no-cache',
    });

    return res.send(result.audioBuffer);
  } catch (error) {
    console.error('TTS route error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/status', async (req: Request, res: Response) => {
  const isConfigured = elevenLabsTTS.isConfigured();
  return res.json({ 
    available: isConfigured,
    provider: isConfigured ? 'elevenlabs' : 'none'
  });
});

export default router;
