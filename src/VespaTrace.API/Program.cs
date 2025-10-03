using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using VespaTrace.Shared.DTOs;
using VespaTrace.Shared.Entities;
using VespaTrace.Shared.Models;
using VespaTrace.ML.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

// Add Entity Framework
builder.Services.AddDbContext<VespaTraceDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection") ?? 
        "Server=(localdb)\\mssqllocaldb;Database=VespaTrace;Trusted_Connection=true;"));

// Add ML.NET service
builder.Services.AddSingleton<IHornetIdentificationService, HornetIdentificationService>();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors("AllowAll");

// SignalR Hub
app.MapHub<CommunityAlertsHub>("/alerts");

// API Endpoints

// Health check
app.MapGet("/api/health", () => Results.Ok(new { Status = "Healthy", Timestamp = DateTime.UtcNow }))
    .WithName("HealthCheck")
    .WithOpenApi();

// Hornet identification endpoint
app.MapPost("/api/v1/hornets/identify", async (
    HornetIdentificationRequest request, 
    IHornetIdentificationService mlService) =>
{
    try
    {
        var result = await mlService.IdentifyHornetAsync(request.ImageBase64);
        
        // Log the identification for analytics
        Console.WriteLine($"Hornet identified: {result.PredictedSpecies} (Confidence: {result.Confidence:P})");
        
        return Results.Ok(ApiResponse<HornetIdentificationResponse>.SuccessResult(result));
    }
    catch (Exception ex)
    {
        return Results.BadRequest(ApiResponse<HornetIdentificationResponse>.ErrorResult($"Identification failed: {ex.Message}"));
    }
})
.WithName("IdentifyHornet")
.WithOpenApi();

// Report hornet sighting
app.MapPost("/api/v1/nests/report", async (
    HornetSightingDto sightingDto,
    VespaTraceDbContext db,
    IHubContext<CommunityAlertsHub> hubContext) =>
{
    try
    {
        var sighting = new HornetSighting
        {
            Species = sightingDto.Species,
            Confidence = sightingDto.Confidence,
            Latitude = sightingDto.Latitude,
            Longitude = sightingDto.Longitude,
            Timestamp = sightingDto.Timestamp ?? DateTime.UtcNow,
            ImageBase64 = sightingDto.ImageBase64,
            Description = sightingDto.Description,
            RiskLevel = sightingDto.RiskLevel,
            Temperature = sightingDto.Temperature,
            Humidity = sightingDto.Humidity,
            WindSpeed = sightingDto.WindSpeed,
            WeatherCondition = sightingDto.WeatherCondition,
            ReportedBy = "Anonymous" // TODO: Get from authentication
        };

        db.HornetSightings.Add(sighting);
        await db.SaveChangesAsync();

        // Send real-time alert if high risk
        if (sighting.RiskLevel >= RiskLevel.High)
        {
            await hubContext.Clients.All.SendAsync("HornetAlert", new
            {
                sighting.Id,
                sighting.Species,
                sighting.RiskLevel,
                sighting.Latitude,
                sighting.Longitude,
                Message = $"⚠️ {sighting.Species} detected! Risk Level: {sighting.RiskLevel}"
            });
        }

        return Results.Ok(ApiResponse<Guid>.SuccessResult(sighting.Id, "Sighting reported successfully"));
    }
    catch (Exception ex)
    {
        return Results.BadRequest(ApiResponse<Guid>.ErrorResult($"Failed to report sighting: {ex.Message}"));
    }
})
.WithName("ReportSighting")
.WithOpenApi();

// Get nearby nests
app.MapGet("/api/v1/nests/nearby", async (
    double latitude,
    double longitude, 
    double radiusMeters,
    VespaTraceDbContext db) =>
{
    try
    {
        // Simple distance calculation (for production, use proper geospatial queries)
        var nearbyNests = await db.NestLocations
            .Where(n => n.Status != EliminationStatus.Eliminated)
            .ToListAsync();

        var filteredNests = nearbyNests
            .Select(n => new
            {
                Nest = n,
                Distance = CalculateDistance(latitude, longitude, n.Latitude, n.Longitude)
            })
            .Where(x => x.Distance <= radiusMeters)
            .OrderBy(x => x.Distance)
            .Select(x => new NestLocationInfo
            {
                Id = x.Nest.Id,
                Latitude = x.Nest.Latitude,
                Longitude = x.Nest.Longitude,
                Species = x.Nest.Species,
                Size = x.Nest.Size,
                RiskLevel = x.Nest.RiskLevel,
                Status = x.Nest.Status,
                Distance = x.Distance,
                RequiresProfessional = x.Nest.RequiresProfessional,
                SightingCount = 1, // TODO: Count actual sightings
                LastSighting = x.Nest.CreatedAt
            })
            .ToList();

        var response = new NearbyNestsResponse
        {
            Nests = filteredNests,
            TotalCount = filteredNests.Count,
            SearchRadius = radiusMeters
        };

        return Results.Ok(ApiResponse<NearbyNestsResponse>.SuccessResult(response));
    }
    catch (Exception ex)
    {
        return Results.BadRequest(ApiResponse<NearbyNestsResponse>.ErrorResult($"Search failed: {ex.Message}"));
    }
})
.WithName("GetNearbyNests")
.WithOpenApi();

// Register apiary
app.MapPost("/api/v1/apiaries/register", async (
    ApiaryDto apiaryDto,
    VespaTraceDbContext db) =>
{
    try
    {
        var apiary = new Apiary
        {
            Name = apiaryDto.Name,
            Latitude = apiaryDto.Latitude,
            Longitude = apiaryDto.Longitude,
            NumberOfHives = apiaryDto.NumberOfHives,
            AlertsEnabled = apiaryDto.AlertsEnabled,
            AlertRadius = apiaryDto.AlertRadius,
            Notes = apiaryDto.Notes,
            ContactEmail = apiaryDto.ContactEmail,
            ContactPhone = apiaryDto.ContactPhone,
            OwnerId = "Anonymous" // TODO: Get from authentication
        };

        db.Apiaries.Add(apiary);
        await db.SaveChangesAsync();

        return Results.Ok(ApiResponse<Guid>.SuccessResult(apiary.Id, "Apiary registered successfully"));
    }
    catch (Exception ex)
    {
        return Results.BadRequest(ApiResponse<Guid>.ErrorResult($"Failed to register apiary: {ex.Message}"));
    }
})
.WithName("RegisterApiary")
.WithOpenApi();

// Initialize ML service
var mlService = app.Services.GetRequiredService<IHornetIdentificationService>();
await mlService.InitializeAsync();

app.Run();

// Helper methods
static double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
{
    const double EarthRadius = 6371000; // Earth radius in meters
    
    var dLat = ToRadians(lat2 - lat1);
    var dLon = ToRadians(lon2 - lon1);
    
    var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
            Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
            Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
    
    var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
    
    return EarthRadius * c;
}

static double ToRadians(double degrees) => degrees * Math.PI / 180;

// SignalR Hub for real-time alerts
public class CommunityAlertsHub : Hub
{
    public async Task JoinLocationGroup(double latitude, double longitude)
    {
        var groupName = $"Location_{(int)(latitude * 100)}_{(int)(longitude * 100)}";
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
    }

    public async Task LeaveLocationGroup(double latitude, double longitude)
    {
        var groupName = $"Location_{(int)(latitude * 100)}_{(int)(longitude * 100)}";
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
    }
}

// Entity Framework DbContext
public class VespaTraceDbContext : DbContext
{
    public VespaTraceDbContext(DbContextOptions<VespaTraceDbContext> options) : base(options) { }

    public DbSet<HornetSighting> HornetSightings { get; set; }
    public DbSet<NestLocation> NestLocations { get; set; }
    public DbSet<Apiary> Apiaries { get; set; }
    public DbSet<PestControlProfessional> PestControlProfessionals { get; set; }
    public DbSet<NearbyApiary> NearbyApiaries { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configure relationships
        modelBuilder.Entity<NearbyApiary>()
            .HasKey(na => na.Id);

        modelBuilder.Entity<NearbyApiary>()
            .HasOne(na => na.Nest)
            .WithMany(n => n.NearbyApiaries)
            .HasForeignKey(na => na.NestId);

        modelBuilder.Entity<NearbyApiary>()
            .HasOne(na => na.Apiary)
            .WithMany(a => a.NearbyNests)
            .HasForeignKey(na => na.ApiaryId);

        modelBuilder.Entity<HornetSighting>()
            .HasOne(hs => hs.RelatedNest)
            .WithMany(n => n.Sightings)
            .HasForeignKey(hs => hs.RelatedNestId);

        base.OnModelCreating(modelBuilder);
    }
}
