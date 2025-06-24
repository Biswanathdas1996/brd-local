import { db } from "./db";
import { clients, teams } from "@shared/schema";

export async function seedDatabase() {
  try {
    // Check if Indian banking data already exists
    const existingClients = await db.select().from(clients);
    if (existingClients.length >= 5) {
      console.log("Indian banking data already seeded");
      return;
    }
    
    // Clear existing non-Indian data if any
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
      },
      {
        name: "Punjab National Bank",
        industry: "Public Sector Bank",
      },
      {
        name: "Bank of Baroda",
        industry: "Public Sector Bank",
      },
      {
        name: "IndusInd Bank",
        industry: "Private Sector Bank",
      },
      {
        name: "Yes Bank",
        industry: "Private Sector Bank",
      },
      {
        name: "Canara Bank",
        industry: "Public Sector Bank",
      }
    ]).returning();

    // Insert comprehensive teams for Indian banking operations
    await db.insert(teams).values([
      // State Bank of India Teams
      {
        name: "YONO Digital Platform Team",
        clientId: sampleClients[0].id,
        focus: "Digital Banking & Mobile App",
      },
      {
        name: "CBS Finacle Implementation",
        clientId: sampleClients[0].id,
        focus: "Core Banking System Upgrade",
      },
      {
        name: "RBI Compliance & Risk",
        clientId: sampleClients[0].id,
        focus: "Regulatory Compliance & Risk Management",
      },
      {
        name: "UPI & Payment Systems",
        clientId: sampleClients[0].id,
        focus: "NPCI Integration & Digital Payments",
      },
      
      // HDFC Bank Teams
      {
        name: "NetBanking Modernization",
        clientId: sampleClients[1].id,
        focus: "Internet Banking Platform",
      },
      {
        name: "Personal Loan Automation",
        clientId: sampleClients[1].id,
        focus: "Loan Processing & Credit Assessment",
      },
      {
        name: "SmartBuy Platform",
        clientId: sampleClients[1].id,
        focus: "E-commerce & Merchant Banking",
      },
      
      // ICICI Bank Teams
      {
        name: "iMobile Pay Enhancement",
        clientId: sampleClients[2].id,
        focus: "Mobile Banking & UPI",
      },
      {
        name: "Trade Finance Digital",
        clientId: sampleClients[2].id,
        focus: "Letter of Credit & Trade Operations",
      },
      {
        name: "Wealth Management Solutions",
        clientId: sampleClients[2].id,
        focus: "Priority Banking & Investment",
      },
      
      // Axis Bank Teams
      {
        name: "Burgundy Private Banking",
        clientId: sampleClients[3].id,
        focus: "High Net Worth Individual Services",
      },
      {
        name: "Open Banking API",
        clientId: sampleClients[3].id,
        focus: "API Banking & Fintech Integration",
      },
      
      // Kotak Mahindra Bank Teams
      {
        name: "Kotak 811 Digital Account",
        clientId: sampleClients[4].id,
        focus: "Zero-balance Account & Digital KYC",
      },
      {
        name: "Corporate Banking Solutions",
        clientId: sampleClients[4].id,
        focus: "Enterprise Banking & Cash Management",
      },
      
      // Punjab National Bank Teams
      {
        name: "PNB ONE Digital Platform",
        clientId: sampleClients[5].id,
        focus: "Unified Digital Banking Experience",
      },
      {
        name: "MSME Lending Platform",
        clientId: sampleClients[5].id,
        focus: "Small Business Loan Processing",
      },
      
      // Bank of Baroda Teams
      {
        name: "BOB World Mobile App",
        clientId: sampleClients[6].id,
        focus: "Mobile Banking & Customer Experience",
      },
      {
        name: "International Banking",
        clientId: sampleClients[6].id,
        focus: "Forex & NRI Banking Services",
      },
      
      // IndusInd Bank Teams
      {
        name: "IndusNet Mobile Banking",
        clientId: sampleClients[7].id,
        focus: "Mobile Banking Platform",
      },
      {
        name: "Video Banking Solutions",
        clientId: sampleClients[7].id,
        focus: "Remote Banking & Video KYC",
      },
      
      // Yes Bank Teams
      {
        name: "YES Mobile Plus",
        clientId: sampleClients[8].id,
        focus: "Digital Banking Recovery",
      },
      
      // Canara Bank Teams
      {
        name: "Canara ai1 Mobile App",
        clientId: sampleClients[9].id,
        focus: "AI-powered Banking Services",
      }
    ]);

    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Failed to seed database:", error);
  }
}