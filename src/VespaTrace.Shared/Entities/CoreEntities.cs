using System.ComponentModel.DataAnnotations;
using VespaTrace.Shared.Models;

namespace VespaTrace.Shared.Entities;

public class HornetSighting
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public HornetSpecies Species { get; set; }
    
    [Range(0.0, 1.0)]
    public float Confidence { get; set; }
    
    [Required]
    public double Latitude { get; set; }
    
    [Required]
    public double Longitude { get; set; }
    
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    
    public string? ImageUrl { get; set; }
    
    public string? ImageBase64 { get; set; }
    
    [Required]
    public string ReportedBy { get; set; } = string.Empty;
    
    public bool IsVerified { get; set; }
    
    public string? VerifiedBy { get; set; }
    
    public DateTime? VerificationDate { get; set; }
    
    public RiskLevel RiskLevel { get; set; }
    
    public string? Description { get; set; }
    
    public string? Notes { get; set; }
    
    // Weather conditions at time of sighting
    public double? Temperature { get; set; }
    
    public double? Humidity { get; set; }
    
    public double? WindSpeed { get; set; }
    
    public string? WeatherCondition { get; set; }
    
    // Community engagement
    public int UpvoteCount { get; set; }
    
    public int DownvoteCount { get; set; }
    
    // Relation to nests
    public Guid? RelatedNestId { get; set; }
    
    public virtual NestLocation? RelatedNest { get; set; }
    
    // Audit fields
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? UpdatedAt { get; set; }
}

public class NestLocation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public double Latitude { get; set; }
    
    [Required]
    public double Longitude { get; set; }
    
    [Required]
    public HornetSpecies Species { get; set; }
    
    public NestSize Size { get; set; }
    
    public AccessibilityLevel Accessibility { get; set; }
    
    public EliminationStatus Status { get; set; }
    
    public bool RequiresProfessional { get; set; }
    
    public string? Description { get; set; }
    
    public string? LocationNotes { get; set; }
    
    // Elimination details
    public string? AssignedProfessional { get; set; }
    
    public DateTime? AssignedDate { get; set; }
    
    public DateTime? ScheduledEliminationDate { get; set; }
    
    public DateTime? EliminationDate { get; set; }
    
    public string? EliminationMethod { get; set; }
    
    public string? EliminationNotes { get; set; }
    
    // Risk assessment
    public RiskLevel RiskLevel { get; set; }
    
    public int EstimatedPopulation { get; set; }
    
    public bool NearSchool { get; set; }
    
    public bool NearHospital { get; set; }
    
    public bool NearApiary { get; set; }
    
    public double? DistanceToNearestApiary { get; set; }
    
    // Collection navigation properties
    public virtual ICollection<HornetSighting> Sightings { get; set; } = new List<HornetSighting>();
    
    public virtual ICollection<NearbyApiary> NearbyApiaries { get; set; } = new List<NearbyApiary>();
    
    // Audit fields
    public string ReportedBy { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? UpdatedAt { get; set; }
}

public class Apiary
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    public double Latitude { get; set; }
    
    [Required]
    public double Longitude { get; set; }
    
    [Required]
    public string OwnerId { get; set; } = string.Empty;
    
    public string? OwnerName { get; set; }
    
    public string? ContactEmail { get; set; }
    
    public string? ContactPhone { get; set; }
    
    public int NumberOfHives { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public bool AlertsEnabled { get; set; } = true;
    
    public double AlertRadius { get; set; } = 5000; // meters
    
    public string? Notes { get; set; }
    
    // Navigation properties
    public virtual ICollection<NearbyApiary> NearbyNests { get; set; } = new List<NearbyApiary>();
    
    // Audit fields
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? UpdatedAt { get; set; }
}

public class NearbyApiary
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid NestId { get; set; }
    
    public Guid ApiaryId { get; set; }
    
    public double Distance { get; set; } // in meters
    
    public bool AlertSent { get; set; }
    
    public DateTime? AlertSentDate { get; set; }
    
    // Navigation properties
    public virtual NestLocation Nest { get; set; } = null!;
    
    public virtual Apiary Apiary { get; set; } = null!;
}

public class PestControlProfessional
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public string UserId { get; set; } = string.Empty;
    
    [Required]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    public string Company { get; set; } = string.Empty;
    
    [Required]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    public string Phone { get; set; } = string.Empty;
    
    public string? LicenseNumber { get; set; }
    
    public bool IsVerified { get; set; }
    
    public bool IsAvailable { get; set; } = true;
    
    public double ServiceRadius { get; set; } = 50000; // meters
    
    public double Latitude { get; set; }
    
    public double Longitude { get; set; }
    
    public string? Specializations { get; set; }
    
    public decimal? HourlyRate { get; set; }
    
    public int CompletedJobs { get; set; }
    
    public double AverageRating { get; set; }
    
    public int TotalRatings { get; set; }
    
    // Audit fields
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? UpdatedAt { get; set; }
}