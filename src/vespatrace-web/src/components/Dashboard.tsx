// components/Dashboard.tsx - Main dashboard component
'use client';

import { Activity, AlertTriangle, MapPin, Shield, TrendingUp, Users } from 'lucide-react';
import { CommunityStats, RiskAssessment } from '@/types';
import { SignalRService, analyticsApi } from '@/lib/api';
import { useEffect, useState } from 'react';

import Charts from './Charts';
import RecentActivity from './RecentActivity';
import RiskIndicator from './RiskIndicator';
import SightingsMap from './SightingsMap';
import StatsCards from './StatsCards';

export default function Dashboard() {
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [signalR] = useState(() => new SignalRService());

  useEffect(() => {
    loadDashboardData();
    setupRealTimeUpdates();

    return () => {
      signalR.disconnect();
    };
  }, [signalR]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, riskResponse] = await Promise.all([
        analyticsApi.getCommunityStats(),
        analyticsApi.getRiskAssessment(),
      ]);

      setStats(statsResponse.data.data);
      setRiskAssessment(riskResponse.data.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeUpdates = async () => {
    await signalR.connect();
    
    signalR.onSightingReported((sighting) => {
      // Refresh stats when new sighting is reported
      loadDashboardData();
    });

    signalR.onCommunityAlert((alert) => {
      // Handle community alerts
      console.log('Community alert:', alert);
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-orange-600" />
                <h1 className="text-2xl font-bold text-gray-900">VespaTrace</h1>
              </div>
              <span className="bg-orange-100 text-orange-800 text-sm px-2 py-1 rounded-full">
                Management Dashboard
              </span>
            </div>
            
            {riskAssessment && (
              <RiskIndicator riskLevel={riskAssessment.overallRisk} />
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && <StatsCards stats={stats} />}

        {/* Main Content Grid */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Charts Section */}
          <div className="lg:col-span-2">
            {stats && <Charts stats={stats} />}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <RecentActivity />
            {riskAssessment && <SightingsMap hotspots={riskAssessment.hotspots} />}
          </div>
        </div>
      </main>
    </div>
  );
}