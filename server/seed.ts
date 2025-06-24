import { db } from "./db";
import { clients, teams } from "@shared/schema";

export async function seedDatabase() {
  try {
    // Clear existing data for fresh seeding with Indian banking context
    await db.delete(teams);
    await db.delete(clients);
    console.log("Cleared existing data for Indian banking context");

    // Insert sample clients for Indian banking context
    const sampleClients = await db.insert(clients).values([
      {
        name: "State Bank of India",
        industry: "Public Sector Bank",
      },
      {
        name: "HDFC Bank",
        industry: "Private Sector Bank",
      },
      {
        name: "ICICI Bank",
        industry: "Private Sector Bank",
      },
      {
        name: "Axis Bank",
        industry: "Private Sector Bank",
      },
      {
        name: "Kotak Mahindra Bank",
        industry: "Private Sector Bank",
      }
    ]).returning();

    // Insert sample teams for Indian banking operations
    await db.insert(teams).values([
      {
        name: "Digital Banking Transformation",
        clientId: sampleClients[0].id,
        focus: "UPI & Digital Payments",
      },
      {
        name: "Core Banking Modernization",
        clientId: sampleClients[0].id,
        focus: "Finacle Implementation",
      },
      {
        name: "Regulatory Compliance Team",
        clientId: sampleClients[0].id,
        focus: "RBI Compliance & KYC",
      },
      {
        name: "Retail Banking Innovation",
        clientId: sampleClients[1].id,
        focus: "Customer Experience",
      },
      {
        name: "Risk & Credit Assessment",
        clientId: sampleClients[1].id,
        focus: "Credit Scoring & Risk Management",
      },
      {
        name: "Trade Finance Digitization",
        clientId: sampleClients[2].id,
        focus: "LC & Trade Operations",
      },
      {
        name: "Priority Banking Solutions",
        clientId: sampleClients[3].id,
        focus: "Wealth Management",
      },
      {
        name: "Payment Gateway Integration",
        clientId: sampleClients[4].id,
        focus: "NPCI & UPI Integration",
      }
    ]);

    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Failed to seed database:", error);
  }
}