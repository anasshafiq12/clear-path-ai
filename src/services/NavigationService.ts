import axios from 'axios';

const API_BASE = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

export interface NavigationResponse {
  navigation_instruction: string;
  audio_file?: string;
}

export interface VoiceCommandResponse {
  response_text: string;
  audio_file?: string;
}

export interface GPSData {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

const NavigationService = {
  async uploadFrame(base64Data: string): Promise<NavigationResponse> {
    const { data } = await api.post<NavigationResponse>('/upload_frame', {
      image: base64Data,
    });
    return data;
  },

  async sendGPSData(gpsData: GPSData): Promise<void> {
    await api.post('/gps_data', gpsData);
  },

  async sendVoiceCommand(text: string): Promise<VoiceCommandResponse> {
    const { data } = await api.post<VoiceCommandResponse>('/voice_command', {
      query: text,
    });
    return data;
  },

  async checkHealth(): Promise<boolean> {
    try {
      await api.get('/health', { timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  },

  getAudioUrl(audioFile: string): string {
    return `${API_BASE}/audio/${audioFile}`;
  },
};

export default NavigationService;
