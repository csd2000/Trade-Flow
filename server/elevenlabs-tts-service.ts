const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '';
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

const VOICE_OPTIONS = {
  nicole: '21m00Tcm4TlvDq8ikWAM',
  bella: 'EXAVITQu4vr4xnSDxMaL',
  elli: 'MF3mGyEYCl7XYWbV9V6O',
  sarah: 'EXAVITQu4vr4xnSDxMaL',
  freya: 'jsCqWAovK2LkecY7zXl4',
  josh: 'TxGEqnHWrfWFTfGW9XjX',
  adam: 'pNInz6obpgDQGcFmaJgB',
  rachel: '21m00Tcm4TlvDq8ikWAM',
};

const SELECTED_VOICE_ID = VOICE_OPTIONS.bella;

export interface TTSRequest {
  text: string;
  voiceId?: string;
}

export interface TTSResponse {
  audioBuffer: Buffer;
  contentType: string;
}

export class ElevenLabsTTSService {
  private apiKey: string;

  constructor() {
    this.apiKey = ELEVENLABS_API_KEY;
  }

  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.length > 0;
  }

  async synthesizeSpeech(text: string, voiceId?: string): Promise<TTSResponse | null> {
    if (!this.isConfigured()) {
      console.warn('ElevenLabs API key not configured');
      return null;
    }

    try {
      const selectedVoice = voiceId || SELECTED_VOICE_ID;
      
      const response = await fetch(
        `${ELEVENLABS_BASE_URL}/text-to-speech/${selectedVoice}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey,
          },
          body: JSON.stringify({
            text: text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.3,
              use_speaker_boost: true,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ElevenLabs TTS error:', response.status, errorText);
        return null;
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = Buffer.from(arrayBuffer);

      return {
        audioBuffer,
        contentType: 'audio/mpeg',
      };
    } catch (error) {
      console.error('Error in ElevenLabs TTS:', error);
      return null;
    }
  }

  async getAvailableVoices(): Promise<any[]> {
    if (!this.isConfigured()) {
      return [];
    }

    try {
      const response = await fetch(`${ELEVENLABS_BASE_URL}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      console.error('Error fetching voices:', error);
      return [];
    }
  }

  async searchVoiceLibrary(query: string): Promise<any[]> {
    if (!this.isConfigured()) {
      return [];
    }

    try {
      const params = new URLSearchParams({
        gender: 'female',
        page_size: '10',
        search: query,
      });

      const response = await fetch(
        `${ELEVENLABS_BASE_URL}/shared-voices?${params}`,
        {
          headers: {
            'xi-api-key': this.apiKey,
          },
        }
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      console.error('Error searching voices:', error);
      return [];
    }
  }
}

export const elevenLabsTTS = new ElevenLabsTTSService();
