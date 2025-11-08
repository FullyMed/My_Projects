import { Location, TransportMode, FareResult, PriceTier } from '@/types';

export const getMockLocations = (): Location[] => [
  {
    id: 'taipei-main',
    name: 'Taipei Main Station',
    nameEn: 'Taipei Main Station',
    nameZh: '台北車站',
    nameId: 'Stasiun Utama Taipei',
    city: 'Taipei',
    cityEn: 'Taipei',
    cityZh: '台北',
    cityId: 'Taipei',
    coordinates: { lat: 25.0478, lng: 121.5174 }
  },
  {
    id: 'taichung',
    name: 'Taichung Station',
    nameEn: 'Taichung Station',
    nameZh: '台中車站',
    nameId: 'Stasiun Taichung',
    city: 'Taichung',
    cityEn: 'Taichung',
    cityZh: '台中',
    cityId: 'Taichung',
    coordinates: { lat: 24.1369, lng: 120.6839 }
  },
  {
    id: 'kaohsiung',
    name: 'Kaohsiung Station',
    nameEn: 'Kaohsiung Station',
    nameZh: '高雄車站',
    nameId: 'Stasiun Kaohsiung',
    city: 'Kaohsiung',
    cityEn: 'Kaohsiung',
    cityZh: '高雄',
    cityId: 'Kaohsiung',
    coordinates: { lat: 22.6273, lng: 120.3014 }
  },
  {
    id: 'tainan',
    name: 'Tainan Station',
    nameEn: 'Tainan Station',
    nameZh: '台南車站',
    nameId: 'Stasiun Tainan',
    city: 'Tainan',
    cityEn: 'Tainan',
    cityZh: '台南',
    cityId: 'Tainan',
    coordinates: { lat: 22.9975, lng: 120.2134 }
  },
  {
    id: 'hsinchu',
    name: 'Hsinchu Station',
    nameEn: 'Hsinchu Station',
    nameZh: '新竹車站',
    nameId: 'Stasiun Hsinchu',
    city: 'Hsinchu',
    cityEn: 'Hsinchu',
    cityZh: '新竹',
    cityId: 'Hsinchu',
    coordinates: { lat: 24.8016, lng: 120.9719 }
  },
  {
    id: 'banqiao',
    name: 'Banqiao Station',
    nameEn: 'Banqiao Station',
    nameZh: '板橋車站',
    nameId: 'Stasiun Banqiao',
    city: 'New Taipei',
    cityEn: 'New Taipei',
    cityZh: '新北',
    cityId: 'New Taipei',
    coordinates: { lat: 25.0138, lng: 121.4627 }
  }
];

export const getMockTransportModes = (): TransportMode[] => [
  {
    id: 'hsr',
    name: 'High-Speed Rail',
    nameEn: 'High-Speed Rail',
    nameZh: '高鐵',
    nameId: 'Kereta Cepat',
    color: '#ff6b35',
    icon: 'train'
  },
  {
    id: 'tra',
    name: 'Taiwan Railway',
    nameEn: 'Taiwan Railway',
    nameZh: '台鐵',
    nameId: 'Kereta Taiwan',
    color: '#2563eb',
    icon: 'train'
  },
  {
    id: 'mrt',
    name: 'MRT/Metro',
    nameEn: 'MRT/Metro',
    nameZh: '捷運',
    nameId: 'MRT/Metro',
    color: '#10b981',
    icon: 'subway'
  },
  {
    id: 'bus',
    name: 'City Bus',
    nameEn: 'City Bus',
    nameZh: '市區公車',
    nameId: 'Bus Kota',
    color: '#f59e0b',
    icon: 'bus'
  },
  {
    id: 'youbike',
    name: 'YouBike',
    nameEn: 'YouBike',
    nameZh: 'YouBike',
    nameId: 'YouBike',
    color: '#8b5cf6',
    icon: 'bike'
  }
];

export const generateMockFareResult = (
  origin: Location,
  destination: Location,
  transportMode: TransportMode
): FareResult => {
  const distance = Math.random() * 300 + 10; // 10-310 km
  const basePrice = calculateMockPrice(distance, transportMode.id);
  
  const pricing: PriceTier[] = [
    { type: 'adult', price: basePrice },
    { type: 'child', price: Math.round(basePrice * 0.5), discount: 50 },
    { type: 'senior', price: Math.round(basePrice * 0.7), discount: 30 },
    { type: 'student', price: Math.round(basePrice * 0.8), discount: 20 }
  ];

  const travelTime = calculateMockTravelTime(distance, transportMode.id);

  return {
    id: `${origin.id}-${destination.id}-${transportMode.id}-${Date.now()}`,
    origin,
    destination,
    transportMode,
    pricing,
    travelTime,
    distance,
    route: `${origin.name} → ${destination.name}`,
    createdAt: new Date().toISOString(),
  };
};

const calculateMockPrice = (distance: number, transportMode: string): number => {
  const basePrices = {
    hsr: 15, // NT$/km
    tra: 8,  // NT$/km
    mrt: 25, // Base fare
    bus: 15, // Base fare
    youbike: 5, // Base fare for 30 min
  };

  const basePrice = basePrices[transportMode as keyof typeof basePrices] || 10;
  
  if (transportMode === 'hsr') {
    return Math.round(distance * basePrice);
  } else if (transportMode === 'tra') {
    return Math.round(distance * basePrice * 0.8);
  } else if (transportMode === 'mrt') {
    return Math.min(65, Math.max(20, Math.round(distance * 2.5)));
  } else if (transportMode === 'bus') {
    return 15; // Flat fare
  } else if (transportMode === 'youbike') {
    return Math.round(Math.max(5, distance * 0.5));
  }
  
  return Math.round(distance * basePrice);
};

const calculateMockTravelTime = (distance: number, transportMode: string): number => {
  const speeds = {
    hsr: 200, // km/h
    tra: 80,  // km/h
    mrt: 35,  // km/h
    bus: 25,  // km/h
    youbike: 15, // km/h
  };

  const speed = speeds[transportMode as keyof typeof speeds] || 50;
  return Math.round((distance / speed) * 60); // Convert to minutes
};