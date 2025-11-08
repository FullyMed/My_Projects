import { Location, TransportMode, FareResult, ApiResponse } from '@/types';
import { getMockLocations, getMockTransportModes, generateMockFareResult } from './mockData';

const TDX_BASE_URL = 'https://tdx.transportdata.tw/api/basic';

class TDXApiService {
  private token: string | null = null;
  private tokenExpiry: number = 0;

  private async getAuthToken(): Promise<string> {
    // In a real app, implement proper OAuth2 flow
    // For demo purposes, we'll simulate token management
    if (this.token && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    try {
      // Simulate token request - replace with actual TDX OAuth implementation
      this.token = 'demo_token_' + Date.now();
      this.tokenExpiry = Date.now() + (3600 * 1000); // 1 hour
      return this.token;
    } catch (error) {
      throw new Error('Failed to get authentication token');
    }
  }

  async searchLocations(query: string): Promise<ApiResponse<Location[]>> {
    try {
      // For demo purposes, return mock data
      // In production, implement actual TDX API calls
      const locations = getMockLocations().filter(location =>
        location.name.toLowerCase().includes(query.toLowerCase()) ||
        location.nameEn.toLowerCase().includes(query.toLowerCase()) ||
        location.nameZh.includes(query) ||
        location.city.toLowerCase().includes(query.toLowerCase())
      );

      return {
        success: true,
        data: locations.slice(0, 10),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to search locations',
      };
    }
  }

  async getTransportModes(): Promise<ApiResponse<TransportMode[]>> {
    try {
      return {
        success: true,
        data: getMockTransportModes(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get transport modes',
      };
    }
  }

  async searchFares(
    origin: Location,
    destination: Location,
    transportMode: TransportMode
  ): Promise<ApiResponse<FareResult>> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo purposes, generate mock data
      // In production, implement actual TDX API calls
      const result = generateMockFareResult(origin, destination, transportMode);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to search fares',
      };
    }
  }

  async getMultiModalFares(
    origin: Location,
    destination: Location,
    transportModes: TransportMode[]
  ): Promise<ApiResponse<FareResult[]>> {
    try {
      const results: FareResult[] = [];

      for (const mode of transportModes) {
        const response = await this.searchFares(origin, destination, mode);
        if (response.success && response.data) {
          results.push(response.data);
        }
      }

      return {
        success: true,
        data: results,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get multi-modal fares',
      };
    }
  }
}

export const tdxApi = new TDXApiService();