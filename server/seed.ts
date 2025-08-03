import { db } from "./db";
import { users, ships, certificates, forms, kpis } from "@shared/schema";
import { sql } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seedDatabase() {
  console.log("🌱 Seeding database...");

  try {
    // Clear existing data
    await db.delete(certificates);
    await db.delete(forms);
    await db.delete(kpis);
    await db.delete(users);
    await db.delete(ships);

    console.log("✅ Cleared existing data");

    // Create ships first
    const shipData = [
      {
        name: "MV Atlantic Star",
        imoNumber: "9234567",
        flagState: "Marshall Islands",
        shipType: "Container Ship",
        grossTonnage: 85000,
        builtYear: 2018,
        classificationSociety: "Lloyd's Register"
      },
      {
        name: "MV Pacific Explorer",
        imoNumber: "9345678",
        flagState: "Liberia",
        shipType: "Bulk Carrier",
        grossTonnage: 65000,
        builtYear: 2020,
        classificationSociety: "DNV GL"
      },
      {
        name: "MV Ocean Voyager",
        imoNumber: "9456789",
        flagState: "Panama",
        shipType: "Tanker",
        grossTonnage: 95000,
        builtYear: 2019,
        classificationSociety: "ABS"
      }
    ];

    const createdShips = await db.insert(ships).values(shipData).returning();
    console.log("✅ Created ships");

    // Create demo users with hashed passwords
    const hashedPassword = await hashPassword("123456789");
    
    const userData = [
      {
        username: "admin@msms.com",
        email: "admin@msms.com",
        password: hashedPassword,
        firstName: "John",
        lastName: "Smith",
        role: "dpa" as const,
        shipId: null
      },
      {
        username: "super@msms.com",
        email: "super@msms.com",
        password: hashedPassword,
        firstName: "Sarah",
        lastName: "Wilson",
        role: "superintendent" as const,
        shipId: null
      },
      {
        username: "captain@ship1.com",
        email: "captain@ship1.com",
        password: hashedPassword,
        firstName: "Michael",
        lastName: "Johnson",
        role: "ship_captain" as const,
        shipId: createdShips[0].id
      },
      {
        username: "operator@msms.com",
        email: "operator@msms.com",
        password: hashedPassword,
        firstName: "David",
        lastName: "Brown",
        role: "operator" as const,
        shipId: null
      },
      {
        username: "crew@ship1.com",
        email: "crew@ship1.com",
        password: hashedPassword,
        firstName: "James",
        lastName: "Davis",
        role: "ship_crew" as const,
        shipId: createdShips[0].id
      }
    ];

    const createdUsers = await db.insert(users).values(userData).returning();
    console.log("✅ Created demo users");

    // Create sample certificates
    const certificateData = [
      {
        shipId: createdShips[0].id,
        certificateType: "Safety Management Certificate",
        certificateName: "Safety Management Certificate",
        issuingAuthority: "Lloyd's Register",
        certificateNumber: "SMC-2024-001",
        issueDate: "2024-01-15",
        expiryDate: "2027-01-15",
        status: "valid" as const,
        createdBy: createdUsers[0].id
      },
      {
        shipId: createdShips[1].id,
        certificateType: "International Load Line Certificate",
        certificateName: "International Load Line Certificate",
        issuingAuthority: "DNV GL",
        certificateNumber: "LLC-2023-045",
        issueDate: "2023-03-22",
        expiryDate: "2025-03-22",
        status: "expiring_soon" as const,
        createdBy: createdUsers[0].id
      },
      {
        shipId: createdShips[2].id,
        certificateType: "MARPOL Certificate",
        certificateName: "International Oil Pollution Prevention Certificate",
        issuingAuthority: "ABS",
        certificateNumber: "MARPOL-2022-123",
        issueDate: "2022-06-10",
        expiryDate: "2024-06-10",
        status: "expired" as const,
        createdBy: createdUsers[0].id
      }
    ];

    await db.insert(certificates).values(certificateData);
    console.log("✅ Created sample certificates");

    // Create sample forms
    const formData = [
      {
        name: "Weekly Safety Drill",
        description: "Weekly safety drill and inspection record",
        formType: "recurring" as const,
        recurrencePattern: { type: "weekly", interval: 1, day: 1 },
        requiresApproval: true,
        approvalRoles: ["dpa", "superintendent"],
        formFields: [
          {
            id: "drill_type",
            type: "select",
            label: "Drill Type",
            required: true,
            options: ["Fire Drill", "Abandon Ship", "Man Overboard", "General Alarm"]
          },
          {
            id: "participation",
            type: "number",
            label: "Number of Participants",
            required: true
          },
          {
            id: "duration",
            type: "text",
            label: "Duration (minutes)",
            required: true
          },
          {
            id: "observations",
            type: "textarea",
            label: "Observations and Comments",
            required: false
          }
        ],
        createdBy: createdUsers[0].id
      },
      {
        name: "Monthly Environmental Report",
        description: "Monthly environmental compliance and monitoring report",
        formType: "recurring" as const,
        recurrencePattern: { type: "monthly", interval: 1, day: 1 },
        requiresApproval: true,
        approvalRoles: ["dpa"],
        formFields: [
          {
            id: "waste_oil",
            type: "number",
            label: "Waste Oil Quantity (liters)",
            required: true
          },
          {
            id: "bilge_water",
            type: "number", 
            label: "Bilge Water Processed (m³)",
            required: true
          },
          {
            id: "compliance_check",
            type: "checkbox",
            label: "All environmental procedures followed",
            required: true
          }
        ],
        createdBy: createdUsers[0].id
      },
      {
        name: "Incident Report",
        description: "Report safety incidents and near misses",
        formType: "one_time" as const,
        requiresApproval: true,
        approvalRoles: ["dpa", "superintendent"],
        formFields: [
          {
            id: "incident_type",
            type: "select",
            label: "Incident Type",
            required: true,
            options: ["Personal Injury", "Equipment Damage", "Near Miss", "Environmental", "Security"]
          },
          {
            id: "severity",
            type: "select",
            label: "Severity Level",
            required: true,
            options: ["Low", "Medium", "High", "Critical"]
          },
          {
            id: "description",
            type: "textarea",
            label: "Incident Description",
            required: true
          },
          {
            id: "corrective_actions",
            type: "textarea",
            label: "Corrective Actions Taken",
            required: true
          },
          {
            id: "photo",
            type: "file",
            label: "Attach Photo Evidence",
            required: false
          }
        ],
        createdBy: createdUsers[0].id
      },
      {
        name: "Defect Report",
        description: "Report equipment defects and maintenance issues",
        formType: "one_time" as const,
        requiresApproval: false,
        formFields: [
          {
            id: "equipment",
            type: "text",
            label: "Equipment/System",
            required: true
          },
          {
            id: "location",
            type: "text",
            label: "Location",
            required: true
          },
          {
            id: "defect_description",
            type: "textarea",
            label: "Defect Description",
            required: true
          },
          {
            id: "urgency",
            type: "select",
            label: "Urgency",
            required: true,
            options: ["Low", "Medium", "High", "Emergency"]
          }
        ],
        createdBy: createdUsers[0].id
      }
    ];

    await db.insert(forms).values(formData);
    console.log("✅ Created sample forms");

    // Create sample KPIs
    const kpiData = [
      {
        name: "Lost Time Injury Frequency Rate",
        description: "Number of lost time injuries per million work hours",
        calculationFormula: "(Lost Time Injuries / Total Work Hours) * 1,000,000",
        dataSource: "incident_reports",
        category: "Safety",
        unit: "per million hours",
        targetValue: 0.15
      },
      {
        name: "Port State Control Detention Rate",
        description: "Percentage of PSC inspections resulting in detention",
        calculationFormula: "(Detentions / Total PSC Inspections) * 100",
        dataSource: "psc_reports",
        category: "Compliance",
        unit: "%",
        targetValue: 2.0
      },
      {
        name: "Environmental Incidents per Ship",
        description: "Average number of environmental incidents per vessel per year",
        calculationFormula: "Total Environmental Incidents / Number of Ships",
        dataSource: "incident_reports",
        category: "Environment",
        unit: "incidents/ship/year",
        targetValue: 0.1
      },
      {
        name: "Near Miss Reporting Rate",
        description: "Number of near miss reports per ship per month",
        calculationFormula: "Total Near Miss Reports / Number of Ships / 12",
        dataSource: "incident_reports",
        category: "Safety",
        unit: "reports/ship/month",
        targetValue: 2.0
      },
      {
        name: "Certificate Compliance Rate",
        description: "Percentage of certificates that are valid and up to date",
        calculationFormula: "(Valid Certificates / Total Certificates) * 100",
        dataSource: "certificates",
        category: "Compliance",
        unit: "%",
        targetValue: 100.0
      },
      {
        name: "Form Completion Rate",
        description: "Percentage of required forms completed on time",
        calculationFormula: "(Completed Forms / Required Forms) * 100",
        dataSource: "form_submissions",
        category: "Operations",
        unit: "%",
        targetValue: 95.0
      },
      {
        name: "Average Response Time to Defects",
        description: "Average time to respond to reported defects",
        calculationFormula: "Sum of Response Times / Number of Defects",
        dataSource: "defect_reports",
        category: "Maintenance",
        unit: "hours",
        targetValue: 24.0
      },
      {
        name: "Crew Training Completion Rate",
        description: "Percentage of required training completed by crew",
        calculationFormula: "(Completed Training / Required Training) * 100",
        dataSource: "training_records",
        category: "Human Resources",
        unit: "%",
        targetValue: 100.0
      },
      {
        name: "Equipment Downtime Rate",
        description: "Percentage of time critical equipment is down",
        calculationFormula: "(Downtime Hours / Total Operating Hours) * 100",
        dataSource: "maintenance_logs",
        category: "Maintenance",
        unit: "%",
        targetValue: 2.0
      },
      {
        name: "Fuel Efficiency",
        description: "Fuel consumption per nautical mile",
        calculationFormula: "Total Fuel Consumed / Total Distance Traveled",
        dataSource: "voyage_reports",
        category: "Efficiency",
        unit: "MT/NM",
        targetValue: 0.25
      },
      {
        name: "Security Incident Rate",
        description: "Number of security incidents per ship per year",
        calculationFormula: "Total Security Incidents / Number of Ships",
        dataSource: "security_reports",
        category: "Security",
        unit: "incidents/ship/year",
        targetValue: 0.0
      },
      {
        name: "Audit Non-Conformity Rate",
        description: "Number of non-conformities per audit",
        calculationFormula: "Total Non-Conformities / Number of Audits",
        dataSource: "audit_reports",
        category: "Quality",
        unit: "per audit",
        targetValue: 3.0
      },
      {
        name: "Emergency Response Time",
        description: "Average time to respond to emergency situations",
        calculationFormula: "Sum of Emergency Response Times / Number of Emergencies",
        dataSource: "emergency_logs",
        category: "Safety",
        unit: "minutes",
        targetValue: 5.0
      },
      {
        name: "Cargo Damage Rate",
        description: "Percentage of cargo shipments with damage claims",
        calculationFormula: "(Damaged Shipments / Total Shipments) * 100",
        dataSource: "cargo_reports",
        category: "Operations",
        unit: "%",
        targetValue: 0.1
      },
      {
        name: "Vessel Availability Rate",
        description: "Percentage of time vessels are available for operation",
        calculationFormula: "(Available Days / Total Days) * 100",
        dataSource: "vessel_logs",
        category: "Operations",
        unit: "%",
        targetValue: "95.0"
      }
    ];

    await db.insert(kpis).values(kpiData);
    console.log("✅ Created 15 KPIs");

    console.log("🎉 Database seeding completed successfully!");
    console.log("\n📋 Demo Users Created:");
    console.log("- DPA: admin@msms.com (password: 123456789)");
    console.log("- Superintendent: super@msms.com (password: 123456789)");
    console.log("- Ship Captain: captain@ship1.com (password: 123456789)");
    console.log("- Operator: operator@msms.com (password: 123456789)");
    console.log("- Ship Crew: crew@ship1.com (password: 123456789)");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedDatabase };
