// components/RiskIndicator.tsx - Risk level indicator component
'use client';

import { AlertCircle, AlertTriangle, Shield, Zap } from 'lucide-react';

import { RiskLevel } from '@/types';

interface RiskIndicatorProps {
  riskLevel: RiskLevel;
}

export default function RiskIndicator({ riskLevel }: RiskIndicatorProps) {
  const getRiskConfig = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.Low:
        return {
          icon: Shield,
          color: 'green',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          label: 'Low Risk',
          description: 'Normal activity levels',
        };
      case RiskLevel.Medium:
        return {
          icon: AlertCircle,
          color: 'yellow',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          label: 'Medium Risk',
          description: 'Increased activity detected',
        };
      case RiskLevel.High:
        return {
          icon: AlertTriangle,
          color: 'orange',
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-800',
          label: 'High Risk',
          description: 'Significant threat level',
        };
      case RiskLevel.Critical:
        return {
          icon: Zap,
          color: 'red',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          label: 'Critical Risk',
          description: 'Immediate attention required',
        };
      default:
        return {
          icon: Shield,
          color: 'gray',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          label: 'Unknown',
          description: 'Risk level unknown',
        };
    }
  };

  const config = getRiskConfig(riskLevel);
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center px-4 py-2 rounded-lg ${config.bgColor}`}>
      <Icon className={`h-5 w-5 mr-2 ${config.textColor}`} />
      <div>
        <div className={`font-semibold ${config.textColor}`}>
          {config.label}
        </div>
        <div className={`text-xs ${config.textColor} opacity-75`}>
          {config.description}
        </div>
      </div>
    </div>
  );
}