// components/SightingsMap.tsx - Map component for showing hotspots
'use client';

import { AlertTriangle, MapPin } from 'lucide-react';

import { RiskAssessment } from '@/types';

interface SightingsMapProps {
  hotspots: RiskAssessment['hotspots'];
}

export default function SightingsMap({ hotspots }: SightingsMapProps) {
  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 0.8) return 'text-red-600 bg-red-100';
    if (riskScore >= 0.6) return 'text-orange-600 bg-orange-100';
    if (riskScore >= 0.4) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return `${Math.floor(diffInHours / 24)}d ago`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Risk Hotspots</h3>
        <AlertTriangle className="h-5 w-5 text-orange-600" />
      </div>
      
      {/* Mock map placeholder */}
      <div className="bg-gray-100 rounded-lg h-48 mb-4 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Interactive map would be here</p>
          <p className="text-xs text-gray-400">Integration with mapping service needed</p>
        </div>
      </div>

      {/* Hotspots list */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">High-Risk Areas</h4>
        {hotspots.slice(0, 5).map((hotspot) => (
          <div key={hotspot.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${getRiskColor(hotspot.riskScore)}`}>
                <MapPin className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {hotspot.location.name}
                </p>
                <p className="text-xs text-gray-500">
                  {hotspot.sightingCount} sightings • {formatLastActivity(hotspot.lastActivity)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">
                {(hotspot.riskScore * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-gray-500">risk</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t">
        <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
          View full map →
        </button>
      </div>
    </div>
  );
}