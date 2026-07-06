/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MetricCardData {
  wellBeingIndex: number;
  costEfficiency: number;
  carbonFootprint: number;
  publicSafety: number;
  satisfaction: number;
}

export interface MetricTrendItem {
  timestamp: string;
  metricValue: number;
  baseline: number;
  predicted?: number;
}

export interface TelemetryAnomaly {
  id: string;
  location: string;
  parameter: string;
  value: string;
  status: "Normal" | "Warning" | "Critical";
  timestamp: string;
}

export interface SectorDefinition {
  id: string;
  name: string;
  icon: string;
  description: string;
  defaultMetrics: MetricCardData;
  parameters: {
    id: string;
    label: string;
    min: number;
    max: number;
    step: number;
    defaultValue: number;
    unit: string;
  }[];
  telemetry: TelemetryAnomaly[];
  trendData: MetricTrendItem[];
  sampleTriggers: string[];
}

export interface SimulationResult {
  metrics: MetricCardData;
  insights: string;
  opportunities: string[];
  risks: string[];
  roadmap: {
    phase: string;
    tasks: string[];
  }[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}

export interface AutomationWorkflow {
  id: string;
  workflowName: string;
  description: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  trigger: {
    condition: string;
    source: string;
  };
  actions: {
    sequence: number;
    target: string;
    actionType: string;
    payload: string;
  }[];
  playbookScript: string;
}

export const SECTORS: Record<string, SectorDefinition> = {
  mobility: {
    id: "mobility",
    name: "Urban Mobility & Transit",
    icon: "Bus",
    description: "Predict congestion hot-spots, optimize public transit schedules, and analyze pedestrian traffic safety patterns across city sectors.",
    defaultMetrics: {
      wellBeingIndex: 68,
      costEfficiency: 58,
      carbonFootprint: 74,
      publicSafety: 72,
      satisfaction: 61,
    },
    parameters: [
      { id: "transitFrequency", label: "Public Transit Frequency", min: 5, max: 60, step: 5, defaultValue: 15, unit: "mins" },
      { id: "congestionPricing", label: "Peak Congestion Tolling", min: 0, max: 20, step: 2, defaultValue: 5, unit: "$" },
      { id: "bikeLaneExpansion", label: "Active Mobility Infrastructure", min: 0, max: 100, step: 10, defaultValue: 40, unit: "% coverage" },
      { id: "evChargingDensity", label: "EV Fleet & Charging Density", min: 10, max: 200, step: 10, defaultValue: 50, unit: "stations" }
    ],
    telemetry: [
      { id: "A1", location: "District 4 (Downtown Intersection)", parameter: "Traffic Queue Length", value: "850 meters", status: "Critical", timestamp: "07:22 AM" },
      { id: "A2", location: "Line 12 Transit Corridor", parameter: "Bus Congestion Load Factor", value: "112%", status: "Warning", timestamp: "07:15 AM" },
      { id: "A3", location: "North Station Charging Hub", parameter: "Grid Charging Demand Peak", value: "480 kW", status: "Normal", timestamp: "07:10 AM" },
      { id: "A4", location: "District 2 Cycle Highway", parameter: "Hourly Micro-mobility Flow", value: "340 bikes/hr", status: "Normal", timestamp: "07:05 AM" }
    ],
    trendData: [
      { timestamp: "Mon", metricValue: 65, baseline: 60 },
      { timestamp: "Tue", metricValue: 68, baseline: 60, predicted: 70 },
      { timestamp: "Wed", metricValue: 72, baseline: 60, predicted: 75 },
      { timestamp: "Thu", metricValue: 70, baseline: 60, predicted: 74 },
      { timestamp: "Fri", metricValue: 75, baseline: 60, predicted: 79 },
      { timestamp: "Sat", metricValue: 80, baseline: 60, predicted: 84 },
      { timestamp: "Sun", metricValue: 82, baseline: 60, predicted: 85 }
    ],
    sampleTriggers: [
      "If Downtown Intersection congestion exceeds 80% for 15 minutes, trigger dynamic traffic light sequencing and dispatch public transit shuttle",
      "If public transit rider demand on Line 12 rises above 95% capacity, automatically reroute standby hybrid buses from depot"
    ]
  },
  wellness: {
    id: "wellness",
    name: "Healthcare Access & Wellness",
    icon: "HeartPulse",
    description: "Analyze clinical response latency, coordinate municipal community health outreach programs, and manage preventative health scores.",
    defaultMetrics: {
      wellBeingIndex: 75,
      costEfficiency: 63,
      carbonFootprint: 45,
      publicSafety: 80,
      satisfaction: 70,
    },
    parameters: [
      { id: "mobileClinicHours", label: "Mobile Health Unit Hours", min: 8, max: 120, step: 8, defaultValue: 40, unit: "hrs/week" },
      { id: "preventionFunding", label: "Preventative Care Funding", min: 10, max: 500, step: 50, defaultValue: 250, unit: "k$/month" },
      { id: "mentalHealthOutreach", label: "Mental Health Support Counselors", min: 5, max: 100, step: 5, defaultValue: 30, unit: "personnel" },
      { id: "telehealthSubsidy", label: "Telehealth Platform Subsidy", min: 0, max: 100, step: 10, defaultValue: 50, unit: "% coverage" }
    ],
    telemetry: [
      { id: "W1", location: "East Precinct Walk-in Center", parameter: "Emergency Room Waiting Duration", value: "115 mins", status: "Warning", timestamp: "07:28 AM" },
      { id: "W2", location: "District 5 Clinic", parameter: "Pediatric Care Appointment Availability", value: "2 days delay", status: "Normal", timestamp: "07:18 AM" },
      { id: "W3", location: "West Side Community Hub", parameter: "Heat Distress Inquiries", value: "45 reports/hr", status: "Critical", timestamp: "07:25 AM" }
    ],
    trendData: [
      { timestamp: "Mon", metricValue: 72, baseline: 70 },
      { timestamp: "Tue", metricValue: 73, baseline: 70 },
      { timestamp: "Wed", metricValue: 75, baseline: 70, predicted: 76 },
      { timestamp: "Thu", metricValue: 78, baseline: 70, predicted: 80 },
      { timestamp: "Fri", metricValue: 77, baseline: 70, predicted: 79 },
      { timestamp: "Sat", metricValue: 81, baseline: 70, predicted: 83 },
      { timestamp: "Sun", metricValue: 84, baseline: 70, predicted: 86 }
    ],
    sampleTriggers: [
      "If clinic wait times exceed 90 minutes in East Precinct, send priority dispatch orders to Mobile Health Units to establish express triaging",
      "If daily local heat stress reports double within 3 hours, trigger emergency warnings to neighborhood leads and activate cold shelter listings"
    ]
  },
  sustainability: {
    id: "sustainability",
    name: "Sustainability & Climate",
    icon: "Leaf",
    description: "Monitor real-time air quality indexing, predict urban heat islands, audit carbon output, and guide waste management diversion.",
    defaultMetrics: {
      wellBeingIndex: 61,
      costEfficiency: 52,
      carbonFootprint: 82,
      publicSafety: 65,
      satisfaction: 59,
    },
    parameters: [
      { id: "canopyTarget", label: "Urban Tree Canopy Target", min: 10, max: 50, step: 5, defaultValue: 25, unit: "% cover" },
      { id: "renewableIncentives", label: "Solar & Green Tech Subsidies", min: 10, max: 100, step: 10, defaultValue: 30, unit: "% rebate" },
      { id: "wasteCompostFrequency", label: "Compost & Recycle Collection", min: 1, max: 7, step: 1, defaultValue: 2, unit: "days/week" },
      { id: "emissionZoneStrictness", label: "Low-Emission Zone Restriction", min: 0, max: 5, step: 1, defaultValue: 2, unit: "level" }
    ],
    telemetry: [
      { id: "S1", location: "District 3 Industrial Border", parameter: "Fine Particulate Matter (PM2.5)", value: "112 µg/m³", status: "Critical", timestamp: "07:30 AM" },
      { id: "S2", location: "South District Smart Bin Cluster", parameter: "Organic Container Load Peak", value: "88%", status: "Warning", timestamp: "07:24 AM" },
      { id: "S3", location: "Central Park Sensor Station", parameter: "Ambient Temperature Delta", value: "+4.2°C", status: "Warning", timestamp: "07:11 AM" }
    ],
    trendData: [
      { timestamp: "Mon", metricValue: 55, baseline: 65 },
      { timestamp: "Tue", metricValue: 58, baseline: 65 },
      { timestamp: "Wed", metricValue: 60, baseline: 65, predicted: 62 },
      { timestamp: "Thu", metricValue: 62, baseline: 65, predicted: 65 },
      { timestamp: "Fri", metricValue: 64, baseline: 65, predicted: 68 },
      { timestamp: "Sat", metricValue: 68, baseline: 65, predicted: 72 },
      { timestamp: "Sun", metricValue: 71, baseline: 65, predicted: 76 }
    ],
    sampleTriggers: [
      "If local PM2.5 readings exceed 100 µg/m³ for 2 consecutive hours, restrict heavy freight entry to Low-Emission Zones and deploy mobile air filtration units",
      "If Organic Waste Container level exceeds 85%, generate automated rerouting instructions for sanitation fleet dispatch"
    ]
  },
  energy: {
    id: "energy",
    name: "Energy & Utilities",
    icon: "Zap",
    description: "Manage grid distribution loads, track solar and wind generation efficiency, and identify pipeline or clean water leaks.",
    defaultMetrics: {
      wellBeingIndex: 70,
      costEfficiency: 71,
      carbonFootprint: 60,
      publicSafety: 75,
      satisfaction: 68,
    },
    parameters: [
      { id: "gridStorageReserve", label: "Battery Energy Reserves", min: 10, max: 100, step: 5, defaultValue: 45, unit: "MWh" },
      { id: "demandResponseRates", label: "Peak Load Tariff Multiplier", min: 1, max: 5, step: 0.5, defaultValue: 2, unit: "x" },
      { id: "waterLeakDetection", label: "Water Telemetry Inspection Rate", min: 10, max: 100, step: 10, defaultValue: 60, unit: "% sensors" },
      { id: "microgridIntegration", label: "Localized Community Microgrids", min: 0, max: 50, step: 5, defaultValue: 15, unit: "hubs" }
    ],
    telemetry: [
      { id: "E1", location: "Substation C (Suburban Edge)", parameter: "Transformer Operating Temp", value: "98°C", status: "Warning", timestamp: "07:26 AM" },
      { id: "E2", location: "Main Water Trunk (West Corridor)", parameter: "Pressure Loss Coefficient", value: "0.22 bar/km", status: "Critical", timestamp: "07:21 AM" },
      { id: "E3", location: "West-facing Rooftop Solar Array", parameter: "Power Output Ratio", value: "94% efficiency", status: "Normal", timestamp: "07:09 AM" }
    ],
    trendData: [
      { timestamp: "Mon", metricValue: 68, baseline: 70 },
      { timestamp: "Tue", metricValue: 70, baseline: 70 },
      { timestamp: "Wed", metricValue: 71, baseline: 70, predicted: 73 },
      { timestamp: "Thu", metricValue: 74, baseline: 70, predicted: 76 },
      { timestamp: "Fri", metricValue: 75, baseline: 70, predicted: 78 },
      { timestamp: "Sat", metricValue: 78, baseline: 70, predicted: 82 },
      { timestamp: "Sun", metricValue: 81, baseline: 70, predicted: 85 }
    ],
    sampleTriggers: [
      "If pressure loss in the Main Water Trunk exceeds 0.20 bar/km, isolate valve 4B immediately and dispatch municipal engineering repair squads",
      "If Substation transformer operating temperature rises above 95°C, auto-divert localized demand responses to auxiliary solar microgrids"
    ]
  },
  safety: {
    id: "safety",
    name: "Safety & Emergency Prep",
    icon: "ShieldAlert",
    description: "Optimize first responder staging, monitor localized hazard alerts, and coordinate disaster evacuation and response scenarios.",
    defaultMetrics: {
      wellBeingIndex: 73,
      costEfficiency: 60,
      carbonFootprint: 50,
      publicSafety: 82,
      satisfaction: 71,
    },
    parameters: [
      { id: "responderStagingPoints", label: "Staging Locations Density", min: 2, max: 20, step: 2, defaultValue: 8, unit: "stations" },
      { id: "hazardDetectionScan", label: "AI Sensor Scanning Rate", min: 1, max: 60, step: 5, defaultValue: 10, unit: "secs" },
      { id: "shelterResiliency", label: "Evacuation Center Capacity", min: 500, max: 10000, step: 500, defaultValue: 3000, unit: "people" },
      { id: "trainingParticipation", label: "Community Drill Drills", min: 0, max: 100, step: 10, defaultValue: 30, unit: "% community" }
    ],
    telemetry: [
      { id: "P1", location: "Riverfront Delta Walk", parameter: "Water Stage Level (Flood Gauge)", value: "4.8 meters", status: "Critical", timestamp: "07:29 AM" },
      { id: "P2", location: "Commercial Precinct North", parameter: "Smoke Sensor Air Opacity", value: "1.2% obsc", status: "Normal", timestamp: "07:14 AM" },
      { id: "P3", location: "District 1 Depot", parameter: "Response Squad Deployment Prep", value: "3 mins 12 secs", status: "Normal", timestamp: "07:08 AM" }
    ],
    trendData: [
      { timestamp: "Mon", metricValue: 79, baseline: 80 },
      { timestamp: "Tue", metricValue: 81, baseline: 80 },
      { timestamp: "Wed", metricValue: 82, baseline: 80, predicted: 84 },
      { timestamp: "Thu", metricValue: 80, baseline: 80, predicted: 82 },
      { timestamp: "Fri", metricValue: 83, baseline: 80, predicted: 85 },
      { timestamp: "Sat", metricValue: 85, baseline: 80, predicted: 88 },
      { timestamp: "Sun", metricValue: 87, baseline: 80, predicted: 90 }
    ],
    sampleTriggers: [
      "If flood gauge levels at Riverfront Delta exceed 4.5 meters, immediately sound sirens in evacuation sector G and deploy dynamic sandbag deployers",
      "If response squad deploy readiness times exceed 5 minutes in key districts, dispatch automated alerts to station commanders to reassess crew assignments"
    ]
  }
};
