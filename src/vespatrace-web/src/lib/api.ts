import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

// lib/api.ts - API client for VespaTrace backend
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5028';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// SignalR connection for real-time updates
export class SignalRService {
  private connection: HubConnection | null = null;

  async connect() {
    this.connection = new HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/hubs/hornet`)
      .build();

    try {
      await this.connection.start();
      console.log('SignalR connected');
    } catch (error) {
      console.error('SignalR connection failed:', error);
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.stop();
    }
  }

  onSightingReported(callback: (sighting: unknown) => void) {
    if (this.connection) {
      this.connection.on('SightingReported', callback);
    }
  }

  onCommunityAlert(callback: (alert: unknown) => void) {
    if (this.connection) {
      this.connection.on('CommunityAlert', callback);
    }
  }
}

// API endpoints
export const sightingsApi = {
  getAll: () => apiClient.get('/sightings'),
  getById: (id: string) => apiClient.get(`/sightings/${id}`),
  getStats: () => apiClient.get('/sightings/stats'),
};

export const identificationApi = {
  identify: (imageData: string) => apiClient.post('/identification/identify', { imageData }),
  getHistory: () => apiClient.get('/identification/history'),
};

export const analyticsApi = {
  getRiskAssessment: () => apiClient.get('/analytics/risk-assessment'),
  getHotspots: () => apiClient.get('/analytics/hotspots'),
  getCommunityStats: () => apiClient.get('/analytics/community-stats'),
};