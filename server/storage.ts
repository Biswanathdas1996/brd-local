import { 
  clients, teams, transcripts, brds,
  type Client, type Team, type Transcript, type Brd,
  type InsertClient, type InsertTeam, type InsertTranscript, type InsertBrd
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Clients
  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;

  // Teams
  getTeams(): Promise<Team[]>;
  getTeamsByClient(clientId: number): Promise<Team[]>;
  getTeam(id: number): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;

  // Transcripts
  getTranscript(id: number): Promise<Transcript | undefined>;
  createTranscript(transcript: InsertTranscript): Promise<Transcript>;

  // BRDs
  getBrds(): Promise<Brd[]>;
  getBrd(id: number): Promise<Brd | undefined>;
  createBrd(brd: InsertBrd): Promise<Brd>;
  updateBrdStatus(id: number, status: string, content?: any): Promise<Brd | undefined>;
  deleteBrd(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private clients: Map<number, Client> = new Map();
  private teams: Map<number, Team> = new Map();
  private transcripts: Map<number, Transcript> = new Map();
  private brds: Map<number, Brd> = new Map();
  private currentClientId = 1;
  private currentTeamId = 1;
  private currentTranscriptId = 1;
  private currentBrdId = 1;

  constructor() {
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample clients
    const client1: Client = {
      id: this.currentClientId++,
      name: "Global Bank Corp",
      industry: "Banking",
      createdAt: new Date(),
    };
    const client2: Client = {
      id: this.currentClientId++,
      name: "Premier Financial Services",
      industry: "Financial Services",
      createdAt: new Date(),
    };
    const client3: Client = {
      id: this.currentClientId++,
      name: "Metro Credit Union",
      industry: "Credit Union",
      createdAt: new Date(),
    };

    this.clients.set(client1.id, client1);
    this.clients.set(client2.id, client2);
    this.clients.set(client3.id, client3);

    // Sample teams
    const team1: Team = {
      id: this.currentTeamId++,
      name: "Core Banking Implementation Team",
      clientId: client1.id,
      focus: "Core Banking Systems",
      createdAt: new Date(),
    };
    const team2: Team = {
      id: this.currentTeamId++,
      name: "Digital Transformation Team",
      clientId: client1.id,
      focus: "Digital Banking",
      createdAt: new Date(),
    };
    const team3: Team = {
      id: this.currentTeamId++,
      name: "Risk Management Team",
      clientId: client2.id,
      focus: "Risk & Compliance",
      createdAt: new Date(),
    };

    this.teams.set(team1.id, team1);
    this.teams.set(team2.id, team2);
    this.teams.set(team3.id, team3);
  }

  async getClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }

  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const client: Client = {
      ...insertClient,
      id: this.currentClientId++,
      createdAt: new Date(),
    };
    this.clients.set(client.id, client);
    return client;
  }

  async getTeams(): Promise<Team[]> {
    return Array.from(this.teams.values());
  }

  async getTeamsByClient(clientId: number): Promise<Team[]> {
    return Array.from(this.teams.values()).filter(team => team.clientId === clientId);
  }

  async getTeam(id: number): Promise<Team | undefined> {
    return this.teams.get(id);
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const team: Team = {
      ...insertTeam,
      id: this.currentTeamId++,
      createdAt: new Date(),
    };
    this.teams.set(team.id, team);
    return team;
  }

  async getTranscript(id: number): Promise<Transcript | undefined> {
    return this.transcripts.get(id);
  }

  async createTranscript(insertTranscript: InsertTranscript): Promise<Transcript> {
    const transcript: Transcript = {
      ...insertTranscript,
      id: this.currentTranscriptId++,
      uploadedAt: new Date(),
    };
    this.transcripts.set(transcript.id, transcript);
    return transcript;
  }

  async getBrds(): Promise<Brd[]> {
    return Array.from(this.brds.values()).sort((a, b) => 
      new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
    );
  }

  async getBrd(id: number): Promise<Brd | undefined> {
    return this.brds.get(id);
  }

  async createBrd(insertBrd: InsertBrd): Promise<Brd> {
    const brd: Brd = {
      ...insertBrd,
      id: this.currentBrdId++,
      generatedAt: new Date(),
      status: insertBrd.status || "generating",
      content: insertBrd.content || {},
    };
    this.brds.set(brd.id, brd);
    return brd;
  }

  async updateBrdStatus(id: number, status: string, content?: any): Promise<Brd | undefined> {
    const brd = this.brds.get(id);
    if (brd) {
      const updatedBrd: Brd = {
        ...brd,
        status,
        ...(content && { content }),
      };
      this.brds.set(id, updatedBrd);
      return updatedBrd;
    }
    return undefined;
  }

  async deleteBrd(id: number): Promise<boolean> {
    return this.brds.delete(id);
  }
}

export class DatabaseStorage implements IStorage {
  async getClients(): Promise<Client[]> {
    return await db.select().from(clients);
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db
      .insert(clients)
      .values(insertClient)
      .returning();
    return client;
  }

  async getTeams(): Promise<Team[]> {
    return await db.select().from(teams);
  }

  async getTeamsByClient(clientId: number): Promise<Team[]> {
    return await db.select().from(teams).where(eq(teams.clientId, clientId));
  }

  async getTeam(id: number): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team || undefined;
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const [team] = await db
      .insert(teams)
      .values(insertTeam)
      .returning();
    return team;
  }

  async getTranscript(id: number): Promise<Transcript | undefined> {
    const [transcript] = await db.select().from(transcripts).where(eq(transcripts.id, id));
    return transcript || undefined;
  }

  async createTranscript(insertTranscript: InsertTranscript): Promise<Transcript> {
    const [transcript] = await db
      .insert(transcripts)
      .values(insertTranscript)
      .returning();
    return transcript;
  }

  async getBrds(): Promise<Brd[]> {
    return await db.select().from(brds).orderBy(desc(brds.generatedAt));
  }

  async getBrd(id: number): Promise<Brd | undefined> {
    const [brd] = await db.select().from(brds).where(eq(brds.id, id));
    return brd || undefined;
  }

  async createBrd(insertBrd: InsertBrd): Promise<Brd> {
    const [brd] = await db
      .insert(brds)
      .values({
        ...insertBrd,
        content: insertBrd.content || {},
        status: insertBrd.status || "generating",
      })
      .returning();
    return brd;
  }

  async updateBrdStatus(id: number, status: string, content?: any): Promise<Brd | undefined> {
    const updateData: any = { status };
    if (content) {
      updateData.content = content;
    }
    
    const [brd] = await db
      .update(brds)
      .set(updateData)
      .where(eq(brds.id, id))
      .returning();
    return brd || undefined;
  }

  async deleteBrd(id: number): Promise<boolean> {
    const result = await db
      .delete(brds)
      .where(eq(brds.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
}

// Use database storage instead of memory storage
export const storage = new DatabaseStorage();
