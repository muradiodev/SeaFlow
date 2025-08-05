import { db } from "./db";
import { 
  users, 
  ships, 
  certificates, 
  forms, 
  formSubmissions, 
  notifications, 
  manuals, 
  kpis, 
  auditLogs 
} from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function seedEnhancedData() {
  console.log("🌱 Starting enhanced database seeding...");

  try {
    // Clear existing data
    await db.delete(auditLogs);
    await db.delete(formSubmissions);
    await db.delete(forms);
    await db.delete(certificates);
    await db.delete(notifications);
    await db.delete(manuals);
    await db.delete(kpis);
    await db.delete(users);
    await db.delete(ships);

    console.log("🧹 Cleared existing data");

    // Create ships first
    const shipsData = [
      {
        name: "MV Oceanic Explorer",
        imoNumber: "IMO9123456",
        shipType: "Container Ship",
        flagState: "Panama",
        buildYear: 2018,
        grossTonnage: 85000,
        classification: "DNV GL",
        isActive: true,
        lastSync: new Date(),
      },
      {
        name: "MV Atlantic Pioneer",
        imoNumber: "IMO9234567",
        shipType: "Tanker",
        flagState: "Liberia",
        buildYear: 2020,
        grossTonnage: 120000,
        classification: "ABS",
        isActive: true,
        lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        name: "MV Pacific Voyager",
        imoNumber: "IMO9345678",
        shipType: "Bulk Carrier",
        flagState: "Marshall Islands",
        buildYear: 2019,
        grossTonnage: 95000,
        classification: "Lloyd's Register",
        isActive: false,
        lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        name: "MV Nordic Spirit",
        imoNumber: "IMO9456789",
        shipType: "General Cargo",
        flagState: "Norway",
        buildYear: 2017,
        grossTonnage: 45000,
        classification: "DNV GL",
        isActive: true,
        lastSync: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      },
      {
        name: "MV Mediterranean Star",
        imoNumber: "IMO9567890",
        shipType: "RoRo Passenger",
        flagState: "Malta",
        buildYear: 2021,
        grossTonnage: 65000,
        classification: "RINA",
        isActive: true,
        lastSync: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      }
    ];

    const createdShips = await db.insert(ships).values(shipsData).returning();
    console.log("✅ Created ships");

    // Create users with varied roles
    const hashedPassword = await hashPassword("123456789");
    const usersData = [
      {
        username: "admin@msms.com",
        email: "admin@msms.com",
        password: hashedPassword,
        firstName: "Admin",
        lastName: "User",
        role: "dpa" as const,
        shipId: null,
      },
      {
        username: "super@msms.com",
        email: "super@msms.com",
        password: hashedPassword,
        firstName: "Sarah",
        lastName: "Wilson",
        role: "superintendent" as const,
        shipId: null,
      },
      {
        username: "captain1@msms.com",
        email: "captain1@msms.com",
        password: hashedPassword,
        firstName: "Michael",
        lastName: "Johnson",
        role: "ship_captain" as const,
        shipId: createdShips[0].id,
      },
      {
        username: "captain2@msms.com",
        email: "captain2@msms.com",
        password: hashedPassword,
        firstName: "Robert",
        lastName: "Smith",
        role: "ship_captain" as const,
        shipId: createdShips[1].id,
      },
      {
        username: "captain3@msms.com",
        email: "captain3@msms.com",
        password: hashedPassword,
        firstName: "James",
        lastName: "Anderson",
        role: "ship_captain" as const,
        shipId: createdShips[2].id,
      },
      {
        username: "operator@msms.com",
        email: "operator@msms.com",
        password: hashedPassword,
        firstName: "David",
        lastName: "Brown",
        role: "operator" as const,
        shipId: null,
      },
      {
        username: "crew1@msms.com",
        email: "crew1@msms.com",
        password: hashedPassword,
        firstName: "John",
        lastName: "Davis",
        role: "ship_crew" as const,
        shipId: createdShips[0].id,
      },
      {
        username: "crew2@msms.com",
        email: "crew2@msms.com",
        password: hashedPassword,
        firstName: "Peter",
        lastName: "Wilson",
        role: "ship_crew" as const,
        shipId: createdShips[1].id,
      },
      {
        username: "crew3@msms.com",
        email: "crew3@msms.com",
        password: hashedPassword,
        firstName: "Mark",
        lastName: "Taylor",
        role: "ship_crew" as const,
        shipId: createdShips[2].id,
      },
      {
        username: "crew4@msms.com",
        email: "crew4@msms.com",
        password: hashedPassword,
        firstName: "Chris",
        lastName: "Martinez",
        role: "ship_crew" as const,
        shipId: createdShips[3].id,
      }
    ];

    const createdUsers = await db.insert(users).values(usersData).returning();
    console.log("✅ Created users");

    // Create extensive certificates for all ships
    const currentDate = new Date();
    const certificatesData = [];
    
    const certificateTypes = [
      { name: "Safety Management Certificate", issuer: "Maritime Authority", validYears: 3 },
      { name: "International Ship and Port Facility Security Certificate", issuer: "Port State Authority", validYears: 5 },
      { name: "Radio Station License", issuer: "Communications Authority", validYears: 2 },
      { name: "Classification Society Certificate", issuer: "DNV GL", validYears: 5 },
      { name: "Maritime Labour Certificate", issuer: "Flag State Administration", validYears: 5 },
      { name: "Load Line Certificate", issuer: "Classification Society", validYears: 5 },
      { name: "International Tonnage Certificate", issuer: "Flag State", validYears: 10 },
      { name: "International Oil Pollution Prevention Certificate", issuer: "Flag State Authority", validYears: 5 },
      { name: "Cargo Ship Safety Certificate", issuer: "Maritime Authority", validYears: 1 },
      { name: "Continuous Synopsis Record", issuer: "Flag State", validYears: 999 }, // Permanent
      { name: "International Air Pollution Prevention Certificate", issuer: "Maritime Authority", validYears: 5 },
      { name: "Ship Energy Efficiency Certificate", issuer: "Flag State", validYears: 999 }, // Permanent
    ];

    for (const ship of createdShips) {
      for (let i = 0; i < certificateTypes.length; i++) {
        const cert = certificateTypes[i];
        const issueDate = new Date(currentDate.getTime() - Math.random() * 730 * 24 * 60 * 60 * 1000); // Up to 2 years ago
        const expiryDate = new Date(issueDate.getTime() + cert.validYears * 365 * 24 * 60 * 60 * 1000);
        
        let status: "valid" | "expiring_soon" | "expired" = "valid";
        const daysToExpiry = Math.ceil((expiryDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24));
        
        if (daysToExpiry < 0) status = "expired";
        else if (daysToExpiry <= 30) status = "expiring_soon";

        certificatesData.push({
          shipId: ship.id,
          certificateType: cert.name,
          certificateName: cert.name,
          issuingAuthority: cert.issuer,
          certificateNumber: `CERT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          issueDate: issueDate.toISOString().split('T')[0],
          expiryDate: expiryDate.toISOString().split('T')[0],
          status,
          createdBy: createdUsers[0].id // DPA user
        });
      }
    }

    await db.insert(certificates).values(certificatesData);
    console.log("✅ Created extensive certificates");

    // Create comprehensive forms - both recurring and one-time
    const formsData = [
      // RECURRING FORMS
      {
        name: "Daily Safety Check",
        description: "Daily safety inspection checklist covering all critical areas of the vessel",
        formType: "recurring" as const,
        recurrencePattern: { type: "daily", interval: 1 },
        formFields: [
          { id: "deck_inspection", type: "checkbox", label: "Deck area clear and safe", required: true },
          { id: "life_jackets", type: "checkbox", label: "Life jackets accessible", required: true },
          { id: "fire_equipment", type: "checkbox", label: "Fire equipment functional", required: true },
          { id: "engine_room", type: "select", label: "Engine room status", options: ["Normal", "Minor Issues", "Major Issues"], required: true },
          { id: "weather_conditions", type: "text", label: "Weather observations", required: false },
          { id: "crew_briefing", type: "checkbox", label: "Crew safety briefing completed", required: true }
        ],
        requiresApproval: true,
        approvalRoles: ["dpa", "superintendent"],
        createdBy: createdUsers[0].id,
        isActive: true
      },
      {
        name: "Weekly Drill Report",
        description: "Weekly safety drill performance and crew assessment",
        formType: "recurring" as const,
        recurrencePattern: { type: "weekly", interval: 1 },
        formFields: [
          { id: "drill_type", type: "select", label: "Type of drill conducted", options: ["Fire", "Abandon Ship", "MOB", "Collision", "Oil Spill"], required: true },
          { id: "participation", type: "number", label: "Number of crew participating", required: true },
          { id: "duration", type: "number", label: "Drill duration (minutes)", required: true },
          { id: "performance", type: "select", label: "Overall performance", options: ["Excellent", "Good", "Satisfactory", "Needs Improvement"], required: true },
          { id: "equipment_used", type: "textarea", label: "Equipment used during drill", required: true },
          { id: "deficiencies", type: "textarea", label: "Deficiencies noted", required: false }
        ],
        requiresApproval: true,
        approvalRoles: ["dpa", "superintendent"],
        createdBy: createdUsers[0].id,
        isActive: true
      },
      {
        name: "Monthly Environmental Check",
        description: "Monthly environmental compliance and waste management report",
        formType: "recurring" as const,
        recurrencePattern: { type: "monthly", interval: 1 },
        formFields: [
          { id: "waste_disposal", type: "select", label: "Waste disposal compliance", options: ["Fully Compliant", "Minor Issues", "Major Issues"], required: true },
          { id: "oil_record", type: "checkbox", label: "Oil record book updated", required: true },
          { id: "garbage_record", type: "checkbox", label: "Garbage record book updated", required: true },
          { id: "bilge_water", type: "number", label: "Bilge water discharged (liters)", required: false },
          { id: "fuel_consumption", type: "number", label: "Fuel consumption (MT)", required: true },
          { id: "emissions_check", type: "checkbox", label: "Emissions monitoring completed", required: true }
        ],
        requiresApproval: true,
        approvalRoles: ["dpa"],
        createdBy: createdUsers[1].id, // Superintendent
        isActive: true
      },
      {
        name: "Quarterly Security Assessment",
        description: "Quarterly vessel security assessment and ISPS compliance check",
        formType: "recurring" as const,
        recurrencePattern: { type: "quarterly", interval: 1 },
        formFields: [
          { id: "security_level", type: "select", label: "Current security level", options: ["Level 1", "Level 2", "Level 3"], required: true },
          { id: "access_control", type: "select", label: "Access control effectiveness", options: ["Excellent", "Good", "Adequate", "Poor"], required: true },
          { id: "cctv_functional", type: "checkbox", label: "CCTV system functional", required: true },
          { id: "security_drills", type: "number", label: "Security drills conducted", required: true },
          { id: "crew_training", type: "checkbox", label: "Crew security training up to date", required: true },
          { id: "vulnerabilities", type: "textarea", label: "Security vulnerabilities identified", required: false }
        ],
        requiresApproval: true,
        approvalRoles: ["dpa"],
        createdBy: createdUsers[0].id,
        isActive: true
      },
      // ONE-TIME FORMS
      {
        name: "Port State Control Inspection Report",
        description: "Report following Port State Control inspection",
        formType: "one_time" as const,
        formFields: [
          { id: "port_authority", type: "text", label: "Inspecting port authority", required: true },
          { id: "inspection_date", type: "date", label: "Inspection date", required: true },
          { id: "inspector_name", type: "text", label: "Lead inspector name", required: true },
          { id: "deficiencies_found", type: "number", label: "Number of deficiencies", required: true },
          { id: "detention", type: "checkbox", label: "Vessel detained", required: true },
          { id: "deficiency_details", type: "textarea", label: "Details of deficiencies", required: false }
        ],
        requiresApproval: true,
        approvalRoles: ["dpa", "superintendent"],
        createdBy: createdUsers[0].id,
        isActive: true
      },
      {
        name: "Incident Investigation Report",
        description: "Comprehensive incident investigation and analysis",
        formType: "one_time" as const,
        formFields: [
          { id: "incident_type", type: "select", label: "Type of incident", options: ["Collision", "Grounding", "Fire", "Injury", "Environmental", "Security", "Other"], required: true },
          { id: "incident_date", type: "datetime", label: "Date and time of incident", required: true },
          { id: "location", type: "text", label: "Location of incident", required: true },
          { id: "weather_conditions", type: "textarea", label: "Weather and sea conditions", required: true },
          { id: "persons_involved", type: "number", label: "Number of persons involved", required: true },
          { id: "injuries", type: "checkbox", label: "Any injuries sustained", required: true },
          { id: "damage_assessment", type: "textarea", label: "Damage assessment", required: true }
        ],
        requiresApproval: true,
        approvalRoles: ["dpa", "superintendent"],
        createdBy: createdUsers[0].id,
        isActive: true
      },
      {
        name: "Dry Dock Completion Report",
        description: "Report following completion of dry dock maintenance",
        formType: "one_time" as const,
        formFields: [
          { id: "dry_dock_location", type: "text", label: "Dry dock facility", required: true },
          { id: "start_date", type: "date", label: "Dry dock start date", required: true },
          { id: "completion_date", type: "date", label: "Completion date", required: true },
          { id: "work_performed", type: "textarea", label: "Major work performed", required: true },
          { id: "hull_inspection", type: "select", label: "Hull inspection result", options: ["Excellent", "Good", "Adequate", "Requires Attention"], required: true },
          { id: "sea_trials", type: "checkbox", label: "Sea trials completed", required: true }
        ],
        requiresApproval: true,
        approvalRoles: ["dpa", "superintendent"],
        createdBy: createdUsers[1].id, // Superintendent
        isActive: true
      },
      {
        name: "Crew Change Report",
        description: "Report documenting crew changes and handover",
        formType: "one_time" as const,
        formFields: [
          { id: "change_date", type: "date", label: "Crew change date", required: true },
          { id: "port_location", type: "text", label: "Port of crew change", required: true },
          { id: "joining_crew", type: "number", label: "Number of crew joining", required: true },
          { id: "leaving_crew", type: "number", label: "Number of crew leaving", required: true },
          { id: "handover_completed", type: "checkbox", label: "Proper handover completed", required: true },
          { id: "documentation_check", type: "checkbox", label: "All documentation verified", required: true }
        ],
        requiresApproval: false,
        createdBy: createdUsers[2].id, // Captain
        isActive: true
      }
    ];

    const createdForms = await db.insert(forms).values(formsData).returning();
    console.log("✅ Created comprehensive forms");

    // Create extensive form submissions with historical data
    const submissionsData = [];
    const statuses = ["draft", "submitted", "approved", "rejected"] as const;
    
    // Generate submissions for the past 6 months
    for (let dayOffset = 0; dayOffset < 180; dayOffset++) {
      const submissionDate = new Date(currentDate.getTime() - dayOffset * 24 * 60 * 60 * 1000);
      
      for (const ship of createdShips.slice(0, 3)) { // First 3 ships are active
        const shipCaptain = createdUsers.find(u => u.shipId === ship.id && u.role === "ship_captain");
        const shipCrew = createdUsers.find(u => u.shipId === ship.id && u.role === "ship_crew");
        
        if (!shipCaptain) continue;

        // Daily Safety Check (every day)
        if (Math.random() > 0.1) { // 90% submission rate
          submissionsData.push({
            formId: createdForms[0].id, // Daily Safety Check
            shipId: ship.id,
            submittedBy: Math.random() > 0.5 ? shipCaptain.id : (shipCrew?.id || shipCaptain.id),
            submittedAt: new Date(submissionDate.getTime() + Math.random() * 12 * 60 * 60 * 1000), // Random time during day
            status: dayOffset < 7 ? statuses[Math.floor(Math.random() * statuses.length)] : "approved",
            submissionData: {
              deck_inspection: true,
              life_jackets: true,
              fire_equipment: Math.random() > 0.05,
              engine_room: Math.random() > 0.1 ? "Normal" : "Minor Issues",
              weather_conditions: `Weather conditions on ${submissionDate.toDateString()}`,
              crew_briefing: Math.random() > 0.02
            }
          });
        }

        // Weekly Drill Report (once per week)
        if (submissionDate.getDay() === 1 && Math.random() > 0.2) { // Mondays, 80% submission rate
          submissionsData.push({
            formId: createdForms[1].id, // Weekly Drill Report
            shipId: ship.id,
            submittedBy: shipCaptain.id,
            submittedAt: new Date(submissionDate.getTime() + 9 * 60 * 60 * 1000), // 9 AM
            status: dayOffset < 14 ? statuses[Math.floor(Math.random() * statuses.length)] : "approved",
            submissionData: {
              drill_type: ["Fire", "Abandon Ship", "MOB", "Collision", "Oil Spill"][Math.floor(Math.random() * 5)],
              participation: Math.floor(Math.random() * 8) + 15, // 15-22 crew
              duration: Math.floor(Math.random() * 20) + 15, // 15-35 minutes
              performance: ["Excellent", "Good", "Satisfactory"][Math.floor(Math.random() * 3)],
              equipment_used: "Standard drill equipment including alarms, life boats, and communication devices",
              deficiencies: Math.random() > 0.7 ? "Minor issues with response time" : ""
            }
          });
        }

        // Monthly Environmental Check (once per month)
        if (submissionDate.getDate() === 1 && Math.random() > 0.1) { // 1st of month, 90% submission rate
          submissionsData.push({
            formId: createdForms[2].id, // Monthly Environmental Check
            shipId: ship.id,
            submittedBy: shipCaptain.id,
            submittedAt: new Date(submissionDate.getTime() + 10 * 60 * 60 * 1000), // 10 AM
            status: dayOffset < 30 ? statuses[Math.floor(Math.random() * statuses.length)] : "approved",
            submissionData: {
              waste_disposal: Math.random() > 0.1 ? "Fully Compliant" : "Minor Issues",
              oil_record: true,
              garbage_record: Math.random() > 0.05,
              bilge_water: Math.floor(Math.random() * 500) + 100,
              fuel_consumption: Math.floor(Math.random() * 200) + 800,
              emissions_check: Math.random() > 0.02
            }
          });
        }
      }
    }

    // Add some incident reports and other one-time forms
    const oneTimeEvents = [
      { formIndex: 4, days: [15, 45, 89, 123] }, // Port State Control
      { formIndex: 5, days: [23, 67, 134] }, // Incident Reports
      { formIndex: 6, days: [156] }, // Dry Dock (once)
      { formIndex: 7, days: [30, 90, 150] } // Crew Changes
    ];

    for (const event of oneTimeEvents) {
      for (const dayOffset of event.days) {
        const eventDate = new Date(currentDate.getTime() - dayOffset * 24 * 60 * 60 * 1000);
        const randomShip = createdShips[Math.floor(Math.random() * createdShips.length)];
        const shipCaptain = createdUsers.find(u => u.shipId === randomShip.id && u.role === "ship_captain");
        
        if (shipCaptain) {
          submissionsData.push({
            formId: createdForms[event.formIndex].id,
            shipId: randomShip.id,
            submittedBy: shipCaptain.id,
            submittedAt: eventDate,
            status: dayOffset < 14 ? statuses[Math.floor(Math.random() * statuses.length)] : "approved",
            submissionData: {
              // Sample data for incident report
              incident_type: "Fire",
              incident_date: eventDate.toISOString(),
              location: "Engine Room",
              weather_conditions: "Calm seas, light winds",
              persons_involved: 3,
              injuries: false,
              damage_assessment: "Minor electrical damage, quickly contained"
            }
          });
        }
      }
    }

    await db.insert(formSubmissions).values(submissionsData.slice(0, 1000)); // Limit to 1000 submissions to avoid timeout
    console.log("✅ Created extensive form submissions");

    // Create audit logs for all activities
    const auditLogsData = [];
    for (let i = 0; i < 500; i++) {
      const logDate = new Date(currentDate.getTime() - Math.random() * 180 * 24 * 60 * 60 * 1000);
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const actions = [
        "USER_LOGIN", "USER_LOGOUT", "FORM_SUBMITTED", "FORM_APPROVED", "FORM_REJECTED",
        "CERTIFICATE_CREATED", "CERTIFICATE_UPDATED", "SHIP_UPDATED", "USER_CREATED",
        "NOTIFICATION_SENT", "MANUAL_UPLOADED", "KPI_UPDATED"
      ];
      const entityTypes = ["User", "Form", "Certificate", "Ship", "Notification", "Manual", "KPI"];
      
      auditLogsData.push({
        userId: randomUser.id,
        action: actions[Math.floor(Math.random() * actions.length)],
        entityType: entityTypes[Math.floor(Math.random() * entityTypes.length)],
        entityId: null,
        oldValues: null,
        newValues: null,
        timestamp: logDate
      });
    }

    await db.insert(auditLogs).values(auditLogsData);
    console.log("✅ Created audit logs");

    // Create notifications
    const notificationsData = [
      {
        recipientId: createdUsers[0].id, // DPA
        title: "Certificate Expiring Soon",
        message: "Radio Station License for MV Oceanic Explorer expires in 15 days",
        notificationType: "certificate_expiry" as const,
        priority: "high" as const,
        isRead: false,
        createdAt: new Date(currentDate.getTime() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        recipientId: createdUsers[0].id, // DPA
        title: "Form Submission Pending",
        message: "Weekly Drill Report from MV Atlantic Pioneer requires approval",
        notificationType: "approval_request" as const,
        priority: "medium" as const,
        isRead: false,
        createdAt: new Date(currentDate.getTime() - 6 * 60 * 60 * 1000)
      },
      {
        recipientId: createdUsers[2].id, // Captain 1
        title: "Port State Control Inspection",
        message: "PSC inspection scheduled for MV Pacific Voyager next week",
        notificationType: "general" as const,
        priority: "critical" as const,
        isRead: false,
        createdAt: new Date(currentDate.getTime() - 12 * 60 * 60 * 1000)
      }
    ];

    await db.insert(notifications).values(notificationsData);
    console.log("✅ Created notifications");

    // Create manuals
    const manualsData = [
      {
        title: "Safety Management System Manual",
        content: "Comprehensive SMS manual covering all safety procedures including emergency response, maintenance protocols, and compliance requirements.",
        category: "Safety",
        tags: ["safety", "sms", "compliance", "emergency"],
        version: "2.1",
        fileAttachments: ["/manuals/sms-manual-v2.1.pdf"],
        isSearchable: true,
        lastUpdatedBy: createdUsers[0].id
      },
      {
        title: "Environmental Management Procedures",
        content: "Environmental compliance and waste management procedures covering MARPOL requirements, waste disposal, and environmental monitoring.",
        category: "Environmental",
        tags: ["environment", "marpol", "waste", "compliance"],
        version: "1.3",
        fileAttachments: ["/manuals/env-procedures-v1.3.pdf"],
        isSearchable: true,
        lastUpdatedBy: createdUsers[1].id // Superintendent
      },
      {
        title: "Emergency Response Plan",
        content: "Comprehensive emergency response and evacuation procedures including fire fighting, abandon ship, and medical emergency protocols.",
        category: "Emergency",
        tags: ["emergency", "fire", "evacuation", "medical"],
        version: "3.0",
        fileAttachments: ["/manuals/emergency-response-v3.0.pdf"],
        isSearchable: true,
        lastUpdatedBy: createdUsers[0].id
      }
    ];

    await db.insert(manuals).values(manualsData);
    console.log("✅ Created manuals");

    // Create KPIs
    const kpisData = [
      {
        name: "Safety Incidents",
        description: "Number of safety incidents per month",
        category: "Safety",
        unit: "incidents",
        target: 0,
        frequency: "monthly",
        isActive: true,
        createdBy: createdUsers[0].id
      },
      {
        name: "Environmental Compliance",
        description: "Percentage of environmental compliance checks passed",
        category: "Environmental",
        unit: "percentage",
        target: 100,
        frequency: "monthly",
        isActive: true,
        createdBy: createdUsers[1].id
      },
      {
        name: "Drill Performance",
        description: "Average drill performance score",
        category: "Safety",
        unit: "score",
        target: 90,
        frequency: "weekly",
        isActive: true,
        createdBy: createdUsers[0].id
      },
      {
        name: "Certificate Validity",
        description: "Percentage of certificates in valid status",
        category: "Compliance",
        unit: "percentage",
        target: 95,
        frequency: "monthly",
        isActive: true,
        createdBy: createdUsers[0].id
      },
      {
        name: "Form Submission Rate",
        description: "Percentage of required forms submitted on time",
        category: "Operations",
        unit: "percentage",
        target: 98,
        frequency: "weekly",
        isActive: true,
        createdBy: createdUsers[1].id
      }
    ];

    await db.insert(kpis).values(kpisData);
    console.log("✅ Created KPIs");

    console.log("🎉 Enhanced database seeding completed successfully!");
    console.log(`Created:
    - ${createdShips.length} ships
    - ${createdUsers.length} users  
    - ${certificatesData.length} certificates
    - ${createdForms.length} forms
    - ${Math.min(submissionsData.length, 1000)} form submissions
    - ${auditLogsData.length} audit log entries
    - ${notificationsData.length} notifications
    - ${manualsData.length} manuals
    - ${kpisData.length} KPIs`);

  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
}

// Run the seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedEnhancedData()
    .then(() => {
      console.log('✅ Enhanced seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Enhanced seeding failed:', error);
      process.exit(1);
    });
}