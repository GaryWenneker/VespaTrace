# VespaTrace Web Management Dashboard

## Overview
VespaTrace Web is a Next.js TypeScript application that provides a comprehensive management dashboard for the VespaTrace hornet detection platform. It offers administrative access and desktop users a powerful interface to monitor, analyze, and manage hornet sightings and community alerts.

## Features

### 🎯 Real-time Dashboard
- **Live Statistics**: Total sightings, active reports, verified cases, and critical alerts
- **Real-time Updates**: SignalR integration for instant notifications
- **Risk Assessment**: Current threat level indicators and trends
- **Performance Metrics**: Community engagement and response analytics

### 📊 Data Visualization
- **Time Series Analysis**: Sightings and verification trends over time
- **Species Distribution**: Pie charts showing hornet species breakdown
- **Risk Level Mapping**: Visual representation of threat levels
- **Geographic Hotspots**: Interactive mapping of high-risk areas

### 🔍 Management Tools
- **Sighting Management**: Review, verify, or dismiss reported sightings
- **Community Monitoring**: Track user engagement and reporting activity
- **Alert System**: Configure and monitor community alert thresholds
- **API Integration**: Seamless connection to VespaTrace .NET 9 backend

## Technology Stack

### Frontend Framework
- **Next.js 15.5.4** with App Router for modern React development
- **TypeScript** for type-safe development
- **Tailwind CSS** for responsive styling
- **Turbopack** for fast development builds

### Key Dependencies
- **@microsoft/signalr** - Real-time communication with backend
- **axios** - HTTP client for API communication
- **recharts** - Data visualization and charting
- **lucide-react** - Modern icon library
- **@radix-ui** - Accessible UI components

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- VespaTrace .NET 9 API server running

### Installation
```bash
cd src/vespatrace-web
npm install
```

### Development
```bash
npm run dev
```
Visit http://localhost:3001 to view the application.

### Production Build
```bash
npm run build
npm start
```

## Configuration

### Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5028
```

### API Integration
The dashboard connects to the VespaTrace .NET 9 API for:
- Hornet sighting data
- Real-time SignalR notifications
- Community statistics
- Risk assessment data

## Integration with VespaTrace Platform

The web dashboard is part of the comprehensive VespaTrace ecosystem:

- **Backend API**: .NET 9 web API with ML.NET integration
- **Mobile App**: Cross-platform MAUI application for field reporting
- **Web Dashboard**: This Next.js management interface
- **Real-time Communication**: SignalR for instant updates across all clients

---

**VespaTrace Web Dashboard - Protecting communities through advanced hornet detection technology** 🐝
