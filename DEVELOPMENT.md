# VespaTrace Development Setup

## Prerequisites
- .NET 8 SDK or later
- Visual Studio Code with recommended extensions
- Azure CLI (for cloud deployment)
- Git

## Quick Start

### 1. Create the Solution Structure
Run these VS Code tasks from the Command Palette (`Ctrl+Shift+P`):
- **"Create .NET Web API Project"** → Creates `VespaTrace.API`
- **"Create .NET MAUI Project"** → Creates `VespaTrace.Mobile`

### 2. Build and Run
- **Build**: `Ctrl+Shift+P` → "Tasks: Run Task" → "Build VespaTrace Solution"
- **Run API**: `Ctrl+Shift+P` → "Tasks: Run Task" → "Run VespaTrace API"

### 3. Project Structure
```
VespaTrace/
├── src/
│   ├── VespaTrace.API/          # ASP.NET Core Web API
│   ├── VespaTrace.Mobile/       # .NET MAUI App
│   ├── VespaTrace.Shared/       # Shared models and DTOs
│   └── VespaTrace.ML/           # ML.NET models and services
├── tests/
│   ├── VespaTrace.API.Tests/
│   └── VespaTrace.Mobile.Tests/
├── requirements/
│   └── PRP_Hornet_Nest_Localization_App.md  # Complete requirements
└── .vscode/                     # VS Code configuration
```

## Key Technologies Used

### Backend (VespaTrace.API)
- **ASP.NET Core 8** - Web API framework
- **Entity Framework Core** - Database ORM with Spatial extensions
- **SignalR** - Real-time communication
- **ML.NET** - Machine learning for hornet identification
- **Azure Cognitive Services** - Cloud-based AI services

### Mobile App (VespaTrace.Mobile)
- **.NET MAUI** - Cross-platform mobile framework
- **CommunityToolkit.Maui** - Camera and UI enhancements
- **Microsoft.Maui.Maps** - Mapping functionality
- **SQLite** - Local database for offline functionality

### Cloud Services
- **Azure App Service** - API hosting
- **Azure SQL Database** - Primary database
- **Azure Blob Storage** - Image and file storage
- **Azure SignalR Service** - Scalable real-time messaging
- **Azure Cognitive Services** - AI/ML capabilities

## Development Workflow

### 1. Feature Development
1. Create/update PRP files using VS Code snippets (`prp-story`, `prp-epic`)
2. Implement backend API endpoints
3. Build mobile app features
4. Test with unit and integration tests

### 2. AI Model Integration
- Use ML.NET Model Builder for training hornet classification models
- Integrate with Azure Custom Vision for cloud-based recognition
- Implement offline model capability for remote areas

### 3. Real-time Features
- SignalR hubs for community alerts
- Live location tracking for professional pest controllers
- Instant notifications for beekeepers

## Getting Started Commands

```bash
# Clone and setup
git clone https://github.com/GaryWenneker/VespaTrace.git
cd VespaTrace

# Create solution
dotnet new sln -n VespaTrace

# Create projects (or use VS Code tasks)
dotnet new webapi -n VespaTrace.API -o src/VespaTrace.API --use-minimal-apis
dotnet new maui -n VespaTrace.Mobile -o src/VespaTrace.Mobile
dotnet new classlib -n VespaTrace.Shared -o src/VespaTrace.Shared
dotnet new classlib -n VespaTrace.ML -o src/VespaTrace.ML

# Add projects to solution
dotnet sln add src/VespaTrace.API/VespaTrace.API.csproj
dotnet sln add src/VespaTrace.Mobile/VespaTrace.Mobile.csproj
dotnet sln add src/VespaTrace.Shared/VespaTrace.Shared.csproj
dotnet sln add src/VespaTrace.ML/VespaTrace.ML.csproj

# Build solution
dotnet build

# Run API
dotnet run --project src/VespaTrace.API
```

## Next Steps
1. Follow the PRP requirements in `requirements/PRP_Hornet_Nest_Localization_App.md`
2. Set up Azure resources for cloud deployment
3. Configure CI/CD pipeline with Azure DevOps
4. Implement core features starting with hornet identification
5. Build community alert system with SignalR