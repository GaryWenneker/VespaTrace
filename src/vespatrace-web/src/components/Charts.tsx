// components/Charts.tsx - Charts and data visualization component
'use client';

import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CommunityStats, HornetSpecies, RiskLevel } from '@/types';

interface ChartsProps {
  stats: CommunityStats;
}

const COLORS = {
  primary: '#ea580c', // orange-600
  secondary: '#dc2626', // red-600
  accent: '#16a34a', // green-600
  warning: '#d97706', // amber-600
};

const SPECIES_COLORS = ['#ea580c', '#dc2626', '#16a34a', '#d97706', '#6366f1'];
const RISK_COLORS = ['#16a34a', '#d97706', '#ea580c', '#dc2626'];

export default function Charts({ stats }: ChartsProps) {
  // Prepare species distribution data
  const speciesData = Object.entries(stats.speciesDistribution).map(([species, count]) => ({
    name: species.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: count,
  }));

  // Prepare risk level distribution data
  const riskData = Object.entries(stats.riskLevelDistribution).map(([risk, count]) => ({
    name: risk.charAt(0).toUpperCase() + risk.slice(1),
    value: count,
  }));

  return (
    <div className="space-y-6">
      {/* Time Series Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sightings Over Time</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: number, name: string) => [value, name === 'sightings' ? 'Sightings' : 'Verifications']}
              />
              <Line 
                type="monotone" 
                dataKey="sightings" 
                stroke={COLORS.primary} 
                strokeWidth={2}
                dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="verifications" 
                stroke={COLORS.accent} 
                strokeWidth={2}
                dot={{ fill: COLORS.accent, strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Species Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Species Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={speciesData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {speciesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SPECIES_COLORS[index % SPECIES_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Level Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Level Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
                <Tooltip />
                <Bar dataKey="value" fill={COLORS.primary}>
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={RISK_COLORS[index % RISK_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}