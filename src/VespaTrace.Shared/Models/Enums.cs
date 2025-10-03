using System.ComponentModel.DataAnnotations;

namespace VespaTrace.Shared.Models;

public enum HornetSpecies
{
    Unknown = 0,
    VespaCrabro = 1,        // European hornet
    VespaVelutina = 2,      // Asian hornet (invasive)
    VespaMandarinia = 3,    // Giant Asian hornet
    VespaOrientalis = 4,    // Oriental hornet
    VespaSoror = 5          // Yellow-legged hornet
}

public enum RiskLevel
{
    Unknown = 0,
    Low = 1,
    Medium = 2,
    High = 3,
    Critical = 4
}

public enum NestSize
{
    Unknown = 0,
    Small = 1,      // <10cm diameter
    Medium = 2,     // 10-30cm diameter  
    Large = 3,      // 30-50cm diameter
    Massive = 4     // >50cm diameter
}

public enum AccessibilityLevel
{
    Unknown = 0,
    Easy = 1,       // Ground level, accessible
    Moderate = 2,   // Low height, ladder needed
    Difficult = 3,  // High up, special equipment needed
    Extreme = 4     // Professional only, dangerous location
}

public enum EliminationStatus
{
    Reported = 0,
    Confirmed = 1,
    Assigned = 2,
    InProgress = 3,
    Eliminated = 4,
    Failed = 5,
    Cancelled = 6
}

public enum UserRole
{
    Citizen = 0,
    Beekeeper = 1,
    PestController = 2,
    Researcher = 3,
    Administrator = 4
}