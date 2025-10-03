// types/index.ts - TypeScript types for VespaTrace
export interface HornetSighting {
  id: string;
  species: HornetSpecies;
  confidence: number;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  imageUrl?: string;
  reportedAt: string;
  reportedBy: string;
  riskLevel: RiskLevel;
  status: SightingStatus;
}

export enum HornetSpecies {
  AsianGiantHornet = 'asian_giant_hornet',
  EuropeanHornet = 'european_hornet',
  YellowjacketWasp = 'yellowjacket_wasp',
  PaperWasp = 'paper_wasp',
  Unknown = 'unknown'
}

export enum RiskLevel {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Critical = 'critical'
}

export enum SightingStatus {
  Pending = 'pending',
  Verified = 'verified',
  Dismissed = 'dismissed'
}

export interface IdentificationResult {
  id: string;
  predictedSpecies: HornetSpecies;
  confidence: number;
  riskLevel: RiskLevel;
  processedAt: string;
  imageUrl?: string;
}

export interface CommunityStats {
  totalSightings: number;
  activeSightings: number;
  verifiedSightings: number;
  criticalAlerts: number;
  speciesDistribution: Record<HornetSpecies, number>;
  riskLevelDistribution: Record<RiskLevel, number>;
  timeSeriesData: {
    date: string;
    sightings: number;
    verifications: number;
  }[];
}

export interface RiskAssessment {
  overallRisk: RiskLevel;
  hotspots: {
    id: string;
    location: {
      latitude: number;
      longitude: number;
      name: string;
    };
    riskScore: number;
    sightingCount: number;
    lastActivity: string;
  }[];
  trends: {
    period: string;
    change: number;
    direction: 'up' | 'down' | 'stable';
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}