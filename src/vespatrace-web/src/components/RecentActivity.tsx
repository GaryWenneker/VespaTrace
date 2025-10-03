// components/RecentActivity.tsx - Recent activity feed component
'use client';

import { AlertTriangle, CheckCircle, Clock, MapPin } from 'lucide-react';
import { HornetSighting, HornetSpecies, RiskLevel, SightingStatus } from '@/types';
import { useEffect, useState } from 'react';

import { sightingsApi } from '@/lib/api';

export default function RecentActivity() {
  const [recentSightings, setRecentSightings] = useState<HornetSighting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentActivity();
  }, []);

  const loadRecentActivity = async () => {
    try {
      const response = await sightingsApi.getAll();
      // Get the 5 most recent sightings
      const recent = response.data.data.slice(0, 5);
      setRecentSightings(recent);
    } catch (error) {
      console.error('Failed to load recent activity:', error);
      // Mock data for development
      setRecentSightings([
        {
          id: '1',
          species: 'asian_giant_hornet' as HornetSpecies,
          confidence: 0.95,
          location: { latitude: 47.6062, longitude: -122.3321, address: 'Seattle, WA' },
          reportedAt: new Date().toISOString(),
          reportedBy: 'John Doe',
          riskLevel: RiskLevel.High,
          status: SightingStatus.Pending,
        },
        {
          id: '2',
          species: 'european_hornet' as HornetSpecies,
          confidence: 0.87,
          location: { latitude: 47.6205, longitude: -122.3493, address: 'Belltown, WA' },
          reportedAt: new Date(Date.now() - 3600000).toISOString(),
          reportedBy: 'Jane Smith',
          riskLevel: RiskLevel.Medium,
          status: SightingStatus.Verified,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: SightingStatus) => {
    switch (status) {
      case SightingStatus.Verified:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case SightingStatus.Pending:
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case SightingStatus.Dismissed:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRiskColor = (riskLevel: RiskLevel) => {
    switch (riskLevel) {
      case RiskLevel.Critical:
        return 'text-red-600';
      case RiskLevel.High:
        return 'text-orange-600';
      case RiskLevel.Medium:
        return 'text-yellow-600';
      case RiskLevel.Low:
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {recentSightings.map((sighting) => (
          <div key={sighting.id} className="flex space-x-3">
            <div className="flex-shrink-0">
              {getStatusIcon(sighting.status)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {sighting.species.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Spotted
                </p>
                <p className="text-sm text-gray-500">
                  {formatTimeAgo(sighting.reportedAt)}
                </p>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <MapPin className="h-3 w-3 text-gray-400" />
                <p className="text-sm text-gray-500 truncate">
                  {sighting.location.address}
                </p>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-500">
                  by {sighting.reportedBy}
                </span>
                <span className={`text-xs font-medium ${getRiskColor(sighting.riskLevel)}`}>
                  {sighting.riskLevel.toUpperCase()} RISK
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t">
        <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
          View all activity →
        </button>
      </div>
    </div>
  );
}