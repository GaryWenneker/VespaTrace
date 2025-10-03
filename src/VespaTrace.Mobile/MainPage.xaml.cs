using System.Collections.ObjectModel;
using VespaTrace.Shared.Models;
using VespaTrace.Shared.DTOs;

namespace VespaTrace.Mobile;

public partial class MainPage : ContentPage
{
    private readonly ObservableCollection<SightingViewModel> _recentSightings;
    private readonly VespaTraceApiService _apiService;

    public MainPage()
    {
        InitializeComponent();
        _recentSightings = new ObservableCollection<SightingViewModel>();
        _apiService = new VespaTraceApiService();
        
        RecentSightingsView.ItemsSource = _recentSightings;
        
        _ = LoadDataAsync();
    }

    private async Task LoadDataAsync()
    {
        try
        {
            StatusLabel.Text = "Loading...";
            
            // Load recent sightings and statistics
            await LoadRecentSightingsAsync();
            await LoadStatisticsAsync();
            
            StatusLabel.Text = "Ready";
        }
        catch (Exception ex)
        {
            StatusLabel.Text = "Offline";
            await DisplayAlert("Error", $"Failed to load data: {ex.Message}", "OK");
        }
    }

    private async Task LoadRecentSightingsAsync()
    {
        try
        {
            // Get current location (simplified - would need proper location service)
            var latitude = 52.0705; // Amsterdam coordinates as default
            var longitude = 4.3007;
            
            var nearbyNests = await _apiService.GetNearbyNestsAsync(latitude, longitude, 10000);
            
            _recentSightings.Clear();
            if (nearbyNests?.Data?.Nests != null)
            {
                foreach (var nest in nearbyNests.Data.Nests.Take(5))
                {
                    _recentSightings.Add(new SightingViewModel
                    {
                        Species = GetFriendlySpeciesName(nest.Species),
                        RiskIcon = GetRiskIcon(nest.RiskLevel),
                        TimeAgo = GetTimeAgo(nest.LastSighting),
                        Distance = $"{nest.Distance:F0}m"
                    });
                }
            }
            
            // Add some mock data if no real data
            if (!_recentSightings.Any())
            {
                _recentSightings.Add(new SightingViewModel
                {
                    Species = "Asian Giant Hornet",
                    RiskIcon = "🔴",
                    TimeAgo = "2 hours ago",
                    Distance = "1.2km"
                });
                _recentSightings.Add(new SightingViewModel
                {
                    Species = "European Hornet",
                    RiskIcon = "🟡",
                    TimeAgo = "1 day ago", 
                    Distance = "3.5km"
                });
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error loading sightings: {ex.Message}");
        }
    }

    private async Task LoadStatisticsAsync()
    {
        try
        {
            // Mock statistics - in real app, these would come from API
            TotalSightingsLabel.Text = "47";
            NestsEliminatedLabel.Text = "12";
            ApiariesProtectedLabel.Text = "8";
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error loading statistics: {ex.Message}");
        }
    }

    private async void OnCameraClicked(object sender, EventArgs e)
    {
        try
        {
            StatusLabel.Text = "Opening camera...";
            
            // Request camera permissions
            var status = await Permissions.RequestAsync<Permissions.Camera>();
            if (status != PermissionStatus.Granted)
            {
                await DisplayAlert("Permission Denied", "Camera permission is required to identify hornets.", "OK");
                StatusLabel.Text = "Ready";
                return;
            }

            // Take photo
            var photo = await MediaPicker.CapturePhotoAsync();
            if (photo != null)
            {
                StatusLabel.Text = "Analyzing image...";
                await ProcessHornetPhotoAsync(photo);
            }
            
            StatusLabel.Text = "Ready";
        }
        catch (Exception ex)
        {
            StatusLabel.Text = "Ready";
            await DisplayAlert("Error", $"Camera error: {ex.Message}", "OK");
        }
    }

    private async Task ProcessHornetPhotoAsync(FileResult photo)
    {
        try
        {
            // Convert photo to base64
            using var stream = await photo.OpenReadAsync();
            using var memoryStream = new MemoryStream();
            await stream.CopyToAsync(memoryStream);
            var imageBytes = memoryStream.ToArray();
            var base64Image = Convert.ToBase64String(imageBytes);
            var dataUri = $"data:image/jpeg;base64,{base64Image}";

            // Send to API for identification
            var result = await _apiService.IdentifyHornetAsync(dataUri);
            
            if (result?.Success == true && result.Data != null)
            {
                var species = result.Data.PredictedSpecies;
                var confidence = result.Data.Confidence;
                var riskLevel = result.Data.RiskLevel;
                
                var message = $"Species: {GetFriendlySpeciesName(species)}\n" +
                             $"Confidence: {confidence:P0}\n" +
                             $"Risk Level: {riskLevel}";
                
                if (result.Data.RequiresImmedateAction)
                {
                    message += "\n\n⚠️ IMMEDIATE ACTION REQUIRED!\nThis species poses a high threat to local bee populations.";
                }

                var reportSighting = await DisplayAlert("Hornet Identified!", message, "Report Sighting", "Close");
                
                if (reportSighting)
                {
                    await ShowReportSightingAsync(result.Data, imageBytes);
                }
            }
            else
            {
                await DisplayAlert("Identification Failed", "Could not identify the hornet. Please try again with a clearer image.", "OK");
            }
        }
        catch (Exception ex)
        {
            await DisplayAlert("Error", $"Failed to process image: {ex.Message}", "OK");
        }
    }

    private async Task ShowReportSightingAsync(HornetIdentificationResponse identification, byte[] imageBytes)
    {
        // This would show a detailed reporting form
        // For now, we'll auto-report with current location
        try
        {
            var location = await Geolocation.GetLocationAsync(new GeolocationRequest
            {
                DesiredAccuracy = GeolocationAccuracy.Medium,
                Timeout = TimeSpan.FromSeconds(10)
            });

            if (location != null)
            {
                var sightingDto = new HornetSightingDto
                {
                    Species = identification.PredictedSpecies,
                    Confidence = identification.Confidence,
                    Latitude = location.Latitude,
                    Longitude = location.Longitude,
                    RiskLevel = identification.RiskLevel,
                    Description = $"Automatically reported via mobile app. Confidence: {identification.Confidence:P0}",
                    ImageBase64 = Convert.ToBase64String(imageBytes),
                    Temperature = 20.0, // Would get from weather API
                    Humidity = 65,
                    WindSpeed = 5.0,
                    WeatherCondition = "Clear"
                };

                var result = await _apiService.ReportSightingAsync(sightingDto);
                
                if (result?.Success == true)
                {
                    await DisplayAlert("Success", "Sighting reported successfully! The community has been alerted.", "OK");
                    await LoadDataAsync(); // Refresh data
                }
                else
                {
                    await DisplayAlert("Error", "Failed to report sighting. Please try again.", "OK");
                }
            }
            else
            {
                await DisplayAlert("Location Error", "Could not get your current location. Please enable location services.", "OK");
            }
        }
        catch (Exception ex)
        {
            await DisplayAlert("Error", $"Failed to report sighting: {ex.Message}", "OK");
        }
    }

    private async void OnReportClicked(object sender, EventArgs e)
    {
        // Navigate to manual reporting page
        await DisplayAlert("Manual Reporting", "Manual sighting reporting feature coming soon!", "OK");
    }

    private async void OnHomeClicked(object sender, EventArgs e)
    {
        // Already on home page
        await LoadDataAsync();
    }

    private async void OnMapClicked(object sender, EventArgs e)
    {
        await DisplayAlert("Map View", "Interactive map feature coming soon!", "OK");
    }

    private async void OnApiariesClicked(object sender, EventArgs e)
    {
        await DisplayAlert("Apiaries", "Apiary management feature coming soon!", "OK");
    }

    private async void OnSettingsClicked(object sender, EventArgs e)
    {
        await DisplayAlert("Settings", "Settings page coming soon!", "OK");
    }

    private string GetFriendlySpeciesName(HornetSpecies species)
    {
        return species switch
        {
            HornetSpecies.VespaVelutina => "Asian Giant Hornet",
            HornetSpecies.VespaCrabro => "European Hornet",
            HornetSpecies.VespaMandarinia => "Asian Giant Hornet",
            HornetSpecies.VespaOrientalis => "Oriental Hornet",
            HornetSpecies.VespaSoror => "Japanese Hornet",
            _ => "Unknown Hornet"
        };
    }

    private string GetRiskIcon(RiskLevel riskLevel)
    {
        return riskLevel switch
        {
            RiskLevel.Critical => "🔴",
            RiskLevel.High => "🟠",
            RiskLevel.Medium => "🟡",
            RiskLevel.Low => "🟢",
            _ => "⚪"
        };
    }

    private string GetTimeAgo(DateTime timestamp)
    {
        var timeSpan = DateTime.UtcNow - timestamp;
        
        if (timeSpan.TotalMinutes < 1)
            return "Just now";
        if (timeSpan.TotalMinutes < 60)
            return $"{(int)timeSpan.TotalMinutes} min ago";
        if (timeSpan.TotalHours < 24)
            return $"{(int)timeSpan.TotalHours}h ago";
        if (timeSpan.TotalDays < 30)
            return $"{(int)timeSpan.TotalDays}d ago";
        
        return timestamp.ToString("MM/dd");
    }
}

public class SightingViewModel
{
    public string Species { get; set; } = string.Empty;
    public string RiskIcon { get; set; } = string.Empty;
    public string TimeAgo { get; set; } = string.Empty;
    public string Distance { get; set; } = string.Empty;
}

