using System.ComponentModel.DataAnnotations;
using VespaTrace.Shared.Models;

namespace VespaTrace.Shared.DTOs;

public class HornetSightingDto
{
    public Guid? Id { get; set; }
    
    [Required]
    public HornetSpecies Species { get; set; }
    
    [Range(0.0, 1.0)]
    public float Confidence { get; set; }
    
    [Required]
    [Range(-90, 90)]
    public double Latitude { get; set; }
    
    [Required]
    [Range(-180, 180)]
    public double Longitude { get; set; }
    
    public DateTime? Timestamp { get; set; }
    
    public string? ImageBase64 { get; set; }
    
    public string? Description { get; set; }
    
    public RiskLevel RiskLevel { get; set; }
    
    // Weather data (optional)
    public double? Temperature { get; set; }
    public double? Humidity { get; set; }
    public double? WindSpeed { get; set; }
    public string? WeatherCondition { get; set; }
}

public class NestLocationDto
{
    public Guid? Id { get; set; }
    
    [Required]
    [Range(-90, 90)]
    public double Latitude { get; set; }
    
    [Required]
    [Range(-180, 180)]
    public double Longitude { get; set; }
    
    [Required]
    public HornetSpecies Species { get; set; }
    
    public NestSize Size { get; set; }
    
    public AccessibilityLevel Accessibility { get; set; }
    
    public string? Description { get; set; }
    
    public string? LocationNotes { get; set; }
    
    public bool RequiresProfessional { get; set; }
    
    public RiskLevel RiskLevel { get; set; }
    
    public int EstimatedPopulation { get; set; }
    
    public bool NearSchool { get; set; }
    
    public bool NearHospital { get; set; }
    
    public bool NearApiary { get; set; }
}

public class ApiaryDto
{
    public Guid? Id { get; set; }
    
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [Range(-90, 90)]
    public double Latitude { get; set; }
    
    [Required]
    [Range(-180, 180)]
    public double Longitude { get; set; }
    
    [Range(1, 1000)]
    public int NumberOfHives { get; set; }
    
    public bool AlertsEnabled { get; set; } = true;
    
    [Range(100, 50000)]
    public double AlertRadius { get; set; } = 5000;
    
    public string? Notes { get; set; }
    
    [EmailAddress]
    public string? ContactEmail { get; set; }
    
    [Phone]
    public string? ContactPhone { get; set; }
}

public class HornetIdentificationRequest
{
    [Required]
    public string ImageBase64 { get; set; } = string.Empty;
    
    public double? Latitude { get; set; }
    
    public double? Longitude { get; set; }
    
    public DateTime? Timestamp { get; set; }
}

public class HornetIdentificationResponse
{
    public HornetSpecies PredictedSpecies { get; set; }
    
    public float Confidence { get; set; }
    
    public RiskLevel RiskLevel { get; set; }
    
    public string Description { get; set; } = string.Empty;
    
    public bool IsInvasive { get; set; }
    
    public bool RequiresImmedateAction { get; set; }
    
    public Dictionary<HornetSpecies, float> AllPredictions { get; set; } = new();
}

public class NearbyNestsRequest
{
    [Required]
    [Range(-90, 90)]
    public double Latitude { get; set; }
    
    [Required]
    [Range(-180, 180)]
    public double Longitude { get; set; }
    
    [Range(100, 50000)]
    public double RadiusMeters { get; set; } = 5000;
    
    public HornetSpecies? SpeciesFilter { get; set; }
    
    public RiskLevel? MinRiskLevel { get; set; }
    
    public bool IncludeEliminated { get; set; } = false;
}

public class NearbyNestsResponse
{
    public List<NestLocationInfo> Nests { get; set; } = new();
    
    public int TotalCount { get; set; }
    
    public double SearchRadius { get; set; }
    
    public DateTime SearchTimestamp { get; set; } = DateTime.UtcNow;
}

public class NestLocationInfo
{
    public Guid Id { get; set; }
    
    public double Latitude { get; set; }
    
    public double Longitude { get; set; }
    
    public HornetSpecies Species { get; set; }
    
    public NestSize Size { get; set; }
    
    public RiskLevel RiskLevel { get; set; }
    
    public EliminationStatus Status { get; set; }
    
    public double Distance { get; set; } // Distance from search point
    
    public int SightingCount { get; set; }
    
    public DateTime LastSighting { get; set; }
    
    public bool RequiresProfessional { get; set; }
}

public class CommunityAlertRequest
{
    [Required]
    public Guid NestId { get; set; }
    
    [Required]
    public string Message { get; set; } = string.Empty;
    
    public RiskLevel AlertLevel { get; set; }
    
    public double AlertRadius { get; set; } = 5000;
    
    public bool AlertBeekeepers { get; set; } = true;
    
    public bool AlertProfessionals { get; set; } = false;
}

public class WeatherRiskAssessment
{
    public DateTime Timestamp { get; set; }
    
    public double Temperature { get; set; }
    
    public double Humidity { get; set; }
    
    public double WindSpeed { get; set; }
    
    public string WeatherCondition { get; set; } = string.Empty;
    
    public bool IsOptimalForElimination { get; set; }
    
    public string RecommendedAction { get; set; } = string.Empty;
    
    public RiskLevel HornetActivityLevel { get; set; }
}

public class ApiResponse<T>
{
    public bool Success { get; set; }
    
    public string Message { get; set; } = string.Empty;
    
    public T? Data { get; set; }
    
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    
    public static ApiResponse<T> SuccessResult(T data, string message = "")
    {
        return new ApiResponse<T>
        {
            Success = true,
            Message = message,
            Data = data
        };
    }
    
    public static ApiResponse<T> ErrorResult(string message)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Message = message,
            Data = default
        };
    }
}