export interface Coordinate {
  lat: number;
  lng: number;
}

export interface DestinationOption {
  id: string;
  name: string;
  address: string;
  coordinate: Coordinate;
  baseConfidence: number; // base real-time predictive confidence percentage
  etaTrafficMin: number;
  trafficDelayMin: number;
  congestionStreet: string;
}

export const DESTINATION_OPTIONS: DestinationOption[] = [
  {
    id: 'tsimiski_104',
    name: 'Tsimiski Street 104 (Retail & Commercial)',
    address: 'Tsimiski Street 104, Thessaloniki',
    coordinate: { lat: 40.6305, lng: 22.9465 },
    baseConfidence: 12,
    etaTrafficMin: 14,
    trafficDelayMin: 6,
    congestionStreet: 'Egnatia Avenue'
  },
  {
    id: 'egnatia_45',
    name: 'Egnatia Avenue 45 (Transit Corridor)',
    address: 'Egnatia Avenue 45, Thessaloniki',
    coordinate: { lat: 40.6358, lng: 22.9431 },
    baseConfidence: 8,
    etaTrafficMin: 19,
    trafficDelayMin: 9,
    congestionStreet: 'Nikis Avenue'
  },
  {
    id: 'nikis_12',
    name: 'Nikis Waterfront 12 (Leisure & Harbor)',
    address: 'Leoforos Nikis 12, Thessaloniki',
    coordinate: { lat: 40.6309, lng: 22.9392 },
    baseConfidence: 22,
    etaTrafficMin: 11,
    trafficDelayMin: 3,
    congestionStreet: 'Kountouriotou Street'
  },
  {
    id: 'agiou_dimitriou_90',
    name: 'Agiou Dimitriou 90 (Historic & Admin)',
    address: 'Agiou Dimitriou 90, Thessaloniki',
    coordinate: { lat: 40.6385, lng: 22.9458 },
    baseConfidence: 38,
    etaTrafficMin: 15,
    trafficDelayMin: 4,
    congestionStreet: 'Kassandrou Street'
  }
];

export interface ParkingHub {
  id: string;
  name: string;
  coordinate: Coordinate;
  vacantSpaces: number;
  totalSpaces: number;
  pricePerHour: number;
  probabilityScore: number; // likelihood score of getting spot by arrival
  distanceMeters: number;
  walkingTimeMin: number;
  features: string[];
  accessibilityRating: 'Outstanding' | 'High' | 'Standard';
  routePath: Coordinate[];
  walkingPath: Coordinate[];
}

export const THESSALONIKI_CENTER: Coordinate = {
  lat: 40.6315,
  lng: 22.9445,
};

export const ORIGIN_COORD: Coordinate = {
  lat: 40.6322,
  lng: 22.9406, // Aristotelous Square area
};

export const DESTINATION_COORD: Coordinate = {
  lat: 40.6305,
  lng: 22.9465, // Tsimiski Street 104
};

export const PORT_GARAGE_COORD: Coordinate = {
  lat: 40.6345,
  lng: 22.9360, // Port Underground Garage
};

export const PARKING_HUBS: ParkingHub[] = [
  {
    id: 'port_garage',
    name: 'Port Underground Garage',
    coordinate: { lat: 40.6345, lng: 22.9360 },
    vacantSpaces: 32,
    totalSpaces: 150,
    pricePerHour: 1.50,
    probabilityScore: 94,
    distanceMeters: 240,
    walkingTimeMin: 3,
    features: ['Step-free lift', 'Wide bays', 'Ramped curbs to Tsimiski'],
    accessibilityRating: 'Outstanding',
    routePath: [
      { lat: 40.6322, lng: 22.9406 },
      { lat: 40.6310, lng: 22.9412 },
      { lat: 40.6320, lng: 22.9390 },
      { lat: 40.6335, lng: 22.9365 },
      { lat: 40.6345, lng: 22.9360 },
    ],
    walkingPath: [
      { lat: 40.6345, lng: 22.9360 },
      { lat: 40.6335, lng: 22.9365 },
      { lat: 40.6315, lng: 22.9400 },
      { lat: 40.6310, lng: 22.9412 },
      { lat: 40.6302, lng: 22.9440 },
      { lat: 40.6305, lng: 22.9465 },
    ]
  },
  {
    id: 'ymca_parking',
    name: 'YMCA Municipal Deck',
    coordinate: { lat: 40.6278, lng: 22.9495 },
    vacantSpaces: 18,
    totalSpaces: 200,
    pricePerHour: 2.00,
    probabilityScore: 81,
    distanceMeters: 450,
    walkingTimeMin: 6,
    features: ['Ramp entry', 'Automated pay', 'Tactile pavings'],
    accessibilityRating: 'High',
    routePath: [
      { lat: 40.6322, lng: 22.9406 },
      { lat: 40.6310, lng: 22.9412 },
      { lat: 40.6295, lng: 22.9448 },
      { lat: 40.6278, lng: 22.9495 },
    ],
    walkingPath: [
      { lat: 40.6278, lng: 22.9495 },
      { lat: 40.6285, lng: 22.9482 },
      { lat: 40.6305, lng: 22.9465 },
    ]
  },
  {
    id: 'tsimiski_plaza',
    name: 'Tsimiski-Karolou Dil Hub',
    coordinate: { lat: 40.6321, lng: 22.9432 },
    vacantSpaces: 3,
    totalSpaces: 80,
    pricePerHour: 3.50,
    probabilityScore: 19,
    distanceMeters: 90,
    walkingTimeMin: 1,
    features: ['Elevator', 'Close proximity', 'Valet service'],
    accessibilityRating: 'Standard',
    routePath: [
      { lat: 40.6322, lng: 22.9406 },
      { lat: 40.6321, lng: 22.9432 },
    ],
    walkingPath: [
      { lat: 40.6321, lng: 22.9432 },
      { lat: 40.6305, lng: 22.9465 },
    ]
  }
];

// State 2 Congestion Path: Aristotelous Square -> Egnatia Avenue -> Destination
export const CONGESTION_PATH: Coordinate[] = [
  { lat: 40.6322, lng: 22.9406 }, // Origin: Aristotelous Square
  { lat: 40.6355, lng: 22.9418 }, // Up Aristotelous to Egnatia Junction
  { lat: 40.6342, lng: 22.9455 }, // East along Egnatia Avenue
  { lat: 40.6331, lng: 22.9490 }, // East along Egnatia Avenue
  { lat: 40.6305, lng: 22.9465 }, // Down to Tsimiski 104
];

// State 3 Detour Path: Aristotelous Square -> Nikis Ave -> Port Garage
export const INTERCEPT_PATH: Coordinate[] = [
  { lat: 40.6322, lng: 22.9406 }, // Origin: Aristotelous Square
  { lat: 40.6310, lng: 22.9412 }, // South to coastal Nikis Avenue
  { lat: 40.6320, lng: 22.9390 }, // West along Nikis / Kountouriotou
  { lat: 40.6335, lng: 22.9365 }, // Towards Limani (Port) area
  { lat: 40.6345, lng: 22.9360 }, // Port Garage
];

// Accessibility Pedestrian Corridor: Port Garage -> Tsimiski Street 104
export const PEDESTRIAN_ACCESSIBILITY_PATH: Coordinate[] = [
  { lat: 40.6345, lng: 22.9360 }, // Port Garage
  { lat: 40.6335, lng: 22.9365 }, // Port exit
  { lat: 40.6315, lng: 22.9400 }, // Kountouriotou walking path
  { lat: 40.6310, lng: 22.9412 }, // Aristotelous corner
  { lat: 40.6302, lng: 22.9440 }, // Start of Tsimiski Street (ramp accessible)
  { lat: 40.6305, lng: 22.9465 }, // Destination: Tsimiski 104
];

export const MAP_DARK_STYLES = [
  {
    elementType: "geometry",
    stylers: [{ color: "#111827" }], // Charcoal dark background
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#111827" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca3af" }], // Crisp stark light text label fill
  },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ color: "#374151" }],
  },
  {
    featureType: "administrative.country",
    elementType: "labels.text.fill",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#1f2937" }], // Solid gray landscape
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#111827" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#10b981" }, { opacity: 0.15 }], // Mint Green for open spaces / parks
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#10b981" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1f2937" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#111827" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#374151" }], // Major corridors
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#111827" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#1f2937" }],
  },
  {
    featureType: "transit",
    elementType: "labels.text.fill",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#1d4ed8" }, { opacity: 0.25 }], // Solid Greek Blue elements for waters
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#1d4ed8" }],
  },
];
