export interface Location {
  id: string;
  name: string;
  nameEn: string;
  nameZh: string;
  nameId: string;
  city: string;
  cityEn: string;
  cityZh: string;
  cityId: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface TransportMode {
  id: string;
  name: string;
  nameEn: string;
  nameZh: string;
  nameId: string;
  color: string;
  icon: string;
}

export interface PriceTier {
  type: 'child' | 'adult' | 'senior' | 'student';
  price: number;
  discount?: number;
}

export interface FareResult {
  id: string;
  origin: Location;
  destination: Location;
  transportMode: TransportMode;
  pricing: PriceTier[];
  travelTime: number; // in minutes
  distance?: number; // in km
  transfers?: Transfer[];
  route?: string;
  schedules?: Schedule[];
  createdAt: string;
}

export interface Transfer {
  station: Location;
  waitTime: number; // in minutes
  transportMode: TransportMode;
}

export interface Schedule {
  departureTime: string;
  arrivalTime: string;
  frequency?: number; // in minutes for regular services
}

export interface FavoriteRoute {
  id: string;
  name: string;
  origin: Location;
  destination: Location;
  transportModes: string[];
  createdAt: string;
  lastUsed: string;
}

export interface SearchHistoryItem {
  id: string;
  origin: Location;
  destination: Location;
  transportMode: TransportMode;
  searchDate: string;
  result?: FareResult;
}

export interface AppSettings {
  language: 'en' | 'zh' | 'id';
  currency: 'TWD';
  notifications: boolean;
  offlineMode: boolean;
  theme: 'auto' | 'light' | 'dark';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  cached?: boolean;
}