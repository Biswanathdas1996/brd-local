import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  industry: text("industry").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  focus: text("focus").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transcripts = pgTable("transcripts", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  content: text("content").notNull(),
  fileType: text("file_type").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const brds = pgTable("brds", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  teamId: integer("team_id").references(() => teams.id).notNull(),
  transcriptId: integer("transcript_id").references(() => transcripts.id).notNull(),
  processArea: text("process_area").notNull(),
  targetSystem: text("target_system").notNull(),
  template: text("template").notNull().default("standard"),
  analysisDepth: text("analysis_depth").notNull().default("detailed"),
  content: jsonb("content").notNull(),
  status: text("status").notNull().default("generating"), // generating, completed, failed
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
});

export const insertTranscriptSchema = createInsertSchema(transcripts).omit({
  id: true,
  uploadedAt: true,
});

export const insertBrdSchema = createInsertSchema(brds).omit({
  id: true,
  generatedAt: true,
  content: true,
}).extend({
  content: z.any().optional(),
  processArea: z.enum([
    "account_mgmt",
    "loan_processing", 
    "customer_onboarding",
    "risk_management",
    "compliance",
    "payment_processing",
    "credit_assessment",
    "data_management",
    "reporting",
    "digital_banking"
  ]),
  targetSystem: z.enum([
    "finacle",
    "temenos_t24",
    "oracle_banking",
    "fiserv_dna",
    "finnone_lms",
    "finastra_lending",
    "mambu",
    "salesforce_crm",
    "microsoft_dynamics",
    "pegasystems",
    "sas_risk",
    "moody_analytics",
    "algorithmics"
  ]),
  template: z.enum(["standard", "agile", "detailed", "executive"]).default("standard"),
  analysisDepth: z.enum(["basic", "detailed", "comprehensive"]).default("detailed"),
});

export type Client = typeof clients.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type Transcript = typeof transcripts.$inferSelect;
export type Brd = typeof brds.$inferSelect;

export type InsertClient = z.infer<typeof insertClientSchema>;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type InsertTranscript = z.infer<typeof insertTranscriptSchema>;
export type InsertBrd = z.infer<typeof insertBrdSchema>;
