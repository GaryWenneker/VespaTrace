# VespaTrace .NET 9 Upgrade Script
# This script downloads and installs .NET 9 SDK for the VespaTrace project

Write-Host "🚀 VespaTrace .NET 9 Upgrade" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Check current .NET version
Write-Host "`n📋 Current .NET SDK versions:" -ForegroundColor Cyan
dotnet --list-sdks

# Download and install .NET 9
Write-Host "`n⬇️ Downloading .NET 9 SDK..." -ForegroundColor Yellow

$downloadUrl = "https://download.visualstudio.microsoft.com/download/pr/8e8d1349-2572-4100-94e9-4a9919ae67d9/969c7b6e5b8b8a0e8de0fc4c5266805a/dotnet-sdk-9.0.100-win-x64.exe"
$installerPath = "$env:TEMP\dotnet-sdk-9.0.100-win-x64.exe"

try {
    Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath -UseBasicParsing
    Write-Host "✅ Download completed" -ForegroundColor Green
    
    Write-Host "`n🔧 Installing .NET 9 SDK..." -ForegroundColor Yellow
    Write-Host "Note: This requires administrator privileges and may take a few minutes." -ForegroundColor Gray
    
    # Run installer
    Start-Process -FilePath $installerPath -ArgumentList "/quiet" -Wait -Verb RunAs
    
    Write-Host "✅ .NET 9 SDK installation completed" -ForegroundColor Green
    
    # Clean up
    Remove-Item $installerPath -Force -ErrorAction SilentlyContinue
    
} catch {
    Write-Host "❌ Error downloading .NET 9: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n🔗 Please manually download .NET 9 from:" -ForegroundColor Yellow
    Write-Host "https://dotnet.microsoft.com/download/dotnet/9.0" -ForegroundColor Blue
    exit 1
}

# Verify installation
Write-Host "`n🔍 Verifying .NET 9 installation..." -ForegroundColor Cyan
Start-Sleep -Seconds 3  # Wait for installation to complete

# Refresh environment variables
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")

# Check new version
Write-Host "`n📋 Updated .NET SDK versions:" -ForegroundColor Cyan
dotnet --list-sdks

# Check if .NET 9 is available
$net9Available = (dotnet --list-sdks) -match "9\."
if ($net9Available) {
    Write-Host "✅ .NET 9 is now available!" -ForegroundColor Green
    
    # Build the solution
    Write-Host "`n🔨 Building VespaTrace solution with .NET 9..." -ForegroundColor Yellow
    Set-Location $PSScriptRoot
    
    try {
        dotnet clean
        dotnet restore
        dotnet build --configuration Debug
        
        Write-Host "✅ Build successful!" -ForegroundColor Green
        Write-Host "`n🎉 VespaTrace is now running on .NET 9!" -ForegroundColor Green
        
        # Show next steps
        Write-Host "`n📝 Next steps:" -ForegroundColor Cyan
        Write-Host "1. Run the API: dotnet run --project src/VespaTrace.API" -ForegroundColor White
        Write-Host "2. Build mobile app: dotnet build src/VespaTrace.Mobile -f net9.0-windows10.0.19041.0" -ForegroundColor White
        Write-Host "3. Use VS Code tasks: Ctrl+Shift+P > Tasks: Run Task > Build All (.NET 9)" -ForegroundColor White
        
    } catch {
        Write-Host "❌ Build failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "💡 Try running 'dotnet build' manually to see detailed errors." -ForegroundColor Yellow
    }
    
} else {
    Write-Host "❌ .NET 9 installation verification failed" -ForegroundColor Red
    Write-Host "💡 You may need to restart your terminal or computer" -ForegroundColor Yellow
}

Write-Host "`n🏁 Upgrade script completed!" -ForegroundColor Green