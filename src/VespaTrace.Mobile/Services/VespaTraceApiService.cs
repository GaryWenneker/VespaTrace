using System.Text;
using System.Text.Json;
using VespaTrace.Shared.DTOs;
using VespaTrace.Shared.Models;

namespace VespaTrace.Mobile;

public class VespaTraceApiService
{
    private readonly HttpClient _httpClient;
    private readonly JsonSerializerOptions _jsonOptions;
    private const string BaseUrl = "https://localhost:7028/api"; // HTTPS port for production
    private const string LocalBaseUrl = "http://10.0.2.2:5028/api"; // Android emulator localhost

    public VespaTraceApiService()
    {
        _httpClient = new HttpClient();
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            PropertyNameCaseInsensitive = true
        };

        // Use different base URL depending on platform/environment
        var baseUrl = DeviceInfo.Platform == DevicePlatform.Android && DeviceInfo.DeviceType == DeviceType.Virtual
            ? LocalBaseUrl
            : BaseUrl;

        _httpClient.BaseAddress = new Uri(GetApiBaseUrl());
        _httpClient.DefaultRequestHeaders.Add("User-Agent", "VespaTrace-Mobile/1.0");
    }

    private string GetApiBaseUrl()
    {
        // Try to determine the correct API URL
        if (DeviceInfo.Platform == DevicePlatform.Android && DeviceInfo.DeviceType == DeviceType.Virtual)
        {
            return "http://10.0.2.2:5028/api/"; // Android emulator
        }
        else if (DeviceInfo.Platform == DevicePlatform.iOS && DeviceInfo.DeviceType == DeviceType.Virtual)
        {
            return "http://localhost:5028/api/"; // iOS simulator
        }
        else
        {
            // For physical devices, you'd need to use your actual IP address
            return "http://192.168.1.100:5028/api/"; // Replace with your machine's IP
        }
    }

    public async Task<ApiResponse<T>?> GetAsync<T>(string endpoint)
    {
        try
        {
            var response = await _httpClient.GetAsync(endpoint);
            var content = await response.Content.ReadAsStringAsync();
            
            if (response.IsSuccessStatusCode)
            {
                return JsonSerializer.Deserialize<ApiResponse<T>>(content, _jsonOptions);
            }
            else
            {
                System.Diagnostics.Debug.WriteLine($"API Error: {response.StatusCode} - {content}");
                return null;
            }
        }
        catch (HttpRequestException ex)
        {
            System.Diagnostics.Debug.WriteLine($"Network error: {ex.Message}");
            return null;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"API error: {ex.Message}");
            return null;
        }
    }

    public async Task<ApiResponse<T>?> PostAsync<T>(string endpoint, object data)
    {
        try
        {
            var json = JsonSerializer.Serialize(data, _jsonOptions);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            
            var response = await _httpClient.PostAsync(endpoint, content);
            var responseContent = await response.Content.ReadAsStringAsync();
            
            if (response.IsSuccessStatusCode)
            {
                return JsonSerializer.Deserialize<ApiResponse<T>>(responseContent, _jsonOptions);
            }
            else
            {
                System.Diagnostics.Debug.WriteLine($"API Error: {response.StatusCode} - {responseContent}");
                return null;
            }
        }
        catch (HttpRequestException ex)
        {
            System.Diagnostics.Debug.WriteLine($"Network error: {ex.Message}");
            return null;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"API error: {ex.Message}");
            return null;
        }
    }

    public async Task<ApiResponse<HornetIdentificationResponse>?> IdentifyHornetAsync(string imageBase64)
    {
        var request = new HornetIdentificationRequest
        {
            ImageBase64 = imageBase64
        };

        return await PostAsync<HornetIdentificationResponse>("v1/hornets/identify", request);
    }

    public async Task<ApiResponse<Guid>?> ReportSightingAsync(HornetSightingDto sighting)
    {
        return await PostAsync<Guid>("v1/nests/report", sighting);
    }

    public async Task<ApiResponse<NearbyNestsResponse>?> GetNearbyNestsAsync(double latitude, double longitude, double radiusMeters)
    {
        var endpoint = $"v1/nests/nearby?latitude={latitude}&longitude={longitude}&radiusMeters={radiusMeters}";
        return await GetAsync<NearbyNestsResponse>(endpoint);
    }

    public async Task<ApiResponse<Guid>?> RegisterApiaryAsync(ApiaryDto apiary)
    {
        return await PostAsync<Guid>("v1/apiaries/register", apiary);
    }

    public async Task<bool> CheckHealthAsync()
    {
        try
        {
            var response = await _httpClient.GetAsync("health");
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    public void Dispose()
    {
        _httpClient?.Dispose();
    }
}

// Extension class for easier JSON deserialization
public static class HttpExtensions
{
    public static async Task<T?> ReadAsJsonAsync<T>(this HttpContent content, JsonSerializerOptions? options = null)
    {
        var json = await content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<T>(json, options);
    }
}