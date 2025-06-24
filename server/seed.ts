import { db } from "./db";
import { clients, teams } from "@shared/schema";

export async function seedDatabase() {
  try {
    // Check if data already exists
    const existingClients = await db.select().from(clients);
    if (existingClients.length > 0) {
      console.log("Database already seeded");
      return;
    }

    // Insert sample clients
    const sampleClients = await db.insert(clients).values([
      {
        name: "Global Bank Corp",
        industry: "Banking",
      },
      {
        name: "Premier Financial Services", 
        industry: "Financial Services",
      },
      {
        name: "Metro Credit Union",
        industry: "Credit Union",
      }
    ]).returning();

    // Insert sample teams
    await db.insert(teams).values([
      {
        name: "Core Banking Implementation Team",
        clientId: sampleClients[0].id,
        focus: "Core Banking Systems",
      },
      {
        name: "Digital Transformation Team",
        clientId: sampleClients[0].id,
        focus: "Digital Banking",
      },
      {
        name: "Risk Management Team",
        clientId: sampleClients[1].id,
        focus: "Risk & Compliance",
      }
    ]);

    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Failed to seed database:", error);
  }
}