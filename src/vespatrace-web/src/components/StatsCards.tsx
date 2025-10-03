// components/StatsCards.tsx - Statistics cards component
'use client';

import { Activity, AlertTriangle, Shield, Users } from 'lucide-react';
import { CommunityStats, RiskLevel } from '@/types';

interface StatsCardsProps {
  stats: CommunityStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Sightings',
      value: stats.totalSightings,
      icon: Activity,
      color: 'blue',
      change: '+12%',
    },
    {
      title: 'Active Reports',
      value: stats.activeSightings,
      icon: AlertTriangle,
      color: 'yellow',
      change: '+5%',
    },
    {
      title: 'Verified Cases',
      value: stats.verifiedSightings,
      icon: Shield,
      color: 'green',
      change: '+8%',
    },
    {
      title: 'Critical Alerts',
      value: stats.criticalAlerts,
      icon: AlertTriangle,
      color: 'red',
      change: '-2%',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500 text-white',
      yellow: 'bg-yellow-500 text-white',
      green: 'bg-green-500 text-white',
      red: 'bg-red-500 text-white',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.title} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`inline-flex items-center justify-center p-3 rounded-md ${getColorClasses(card.color)}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {card.title}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {card.value.toLocaleString()}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        card.change.startsWith('+') ? 'text-green-600' : 
                        card.change.startsWith('-') ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {card.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}