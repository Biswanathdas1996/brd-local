import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { processUploadedFile, getSampleTranscripts } from "./services/fileProcessor";
import { generateBrd, generateRequirementEnhancements, generateImplementationActivities, generateTestCases } from "./services/pwc-genai";
import { insertTranscriptSchema, insertBrdSchema, insertTeamSchema, insertClientSchema } from "@shared/schema";

const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedTypes = ['.txt', '.pdf', '.docx'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only .txt, .pdf, and .docx files are allowed.'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all clients
  app.get("/api/clients", async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  // Get teams by client
  app.get("/api/teams/:clientId", async (req, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      if (isNaN(clientId)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      
      const teams = await storage.getTeamsByClient(clientId);
      res.json(teams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });

  // Create new team
  app.post("/api/teams", async (req, res) => {
    try {
      const teamData = insertTeamSchema.parse(req.body);
      const team = await storage.createTeam(teamData);
      res.json(team);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Create new client
  app.post("/api/clients", async (req, res) => {
    try {
      const clientData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(clientData);
      res.json(client);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get sample transcripts
  app.get("/api/sample-transcripts", async (req, res) => {
    try {
      const samples = getSampleTranscripts();
      res.json(samples);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sample transcripts" });
    }
  });

  // Upload transcript file
  app.post("/api/upload-transcript", upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const processedFile = await processUploadedFile(req.file.path, req.file.originalname);
      
      const transcriptData = insertTranscriptSchema.parse({
        filename: processedFile.filename,
        content: processedFile.content,
        fileType: processedFile.fileType,
      });

      const transcript = await storage.createTranscript(transcriptData);
      res.json(transcript);
    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(400).json({ message: error.message });
    }
  });

  // Load sample transcript
  app.post("/api/load-sample", async (req, res) => {
    try {
      const { sampleName } = req.body;
      const samples = getSampleTranscripts();
      const sample = samples.find(s => s.name === sampleName);
      
      if (!sample) {
        return res.status(404).json({ message: "Sample transcript not found" });
      }

      const transcriptData = insertTranscriptSchema.parse({
        filename: sample.name,
        content: sample.content,
        fileType: "txt",
      });

      const transcript = await storage.createTranscript(transcriptData);
      res.json({ 
        transcript, 
        suggestedProcessArea: sample.processArea,
        suggestedTargetSystem: sample.targetSystem 
      });
    } catch (error: any) {
      console.error('Sample load error:', error);
      res.status(400).json({ message: error.message });
    }
  });

  // Enhance requirement endpoint
  app.post("/api/enhance-requirement", async (req, res) => {
    try {
      const { requirement, context } = req.body;
      
      const suggestions = await generateRequirementEnhancements(requirement, context);
      res.json(suggestions);
    } catch (error) {
      console.error('Enhancement error:', error);
      res.status(500).json({ message: "Failed to generate enhancement suggestions" });
    }
  });

  // Update requirement endpoint
  app.put("/api/brd/:brdId/requirement/:requirementId", async (req, res) => {
    try {
      const { brdId, requirementId } = req.params;
      const updatedRequirement = req.body;
      
      console.log('Updating requirement:', { brdId, requirementId, updatedRequirement });
      
      const brd = await storage.getBrd(parseInt(brdId));
      if (!brd) {
        return res.status(404).json({ message: "BRD not found" });
      }

      // Parse content if it's a string
      let content = brd.content;
      if (typeof content === 'string') {
        content = JSON.parse(content);
      }
      
      // Update the specific requirement
      const reqIndex = content.functionalRequirements.findIndex((req: any) => req.id === requirementId);
      
      if (reqIndex === -1) {
        return res.status(404).json({ message: "Requirement not found" });
      }

      content.functionalRequirements[reqIndex] = updatedRequirement;
      
      const result = await storage.updateBrdStatus(parseInt(brdId), brd.status, content);
      console.log('Update result:', result);
      
      res.json({ message: "Requirement updated successfully", brd: result });
    } catch (error) {
      console.error('Update requirement error:', error);
      res.status(500).json({ message: "Failed to update requirement", error: error.message });
    }
  });

  // Generate BRD
  app.post("/api/generate-brd", async (req, res) => {
    try {
      const brdData = insertBrdSchema.parse(req.body);
      
      // Create BRD record with generating status
      const brd = await storage.createBrd({
        ...brdData,
        status: "generating",
      });

      // Get related data for context
      const [client, team] = await Promise.all([
        storage.getClient(brdData.clientId),
        storage.getTeam(brdData.teamId),
      ]);

      if (!client || !team) {
        await storage.updateBrdStatus(brd.id, "failed");
        return res.status(400).json({ message: "Invalid client or team ID" });
      }

      // Get transcript content - either from transcriptId or from transcriptContent
      let transcriptContent = '';
      if (brdData.transcriptId) {
        const transcript = await storage.getTranscript(brdData.transcriptId);
        if (!transcript) {
          await storage.updateBrdStatus(brd.id, "failed");
          return res.status(400).json({ message: "Invalid transcript ID" });
        }
        transcriptContent = transcript.content;
      } else if ((brdData as any).transcriptContent) {
        transcriptContent = (brdData as any).transcriptContent;
      } else {
        await storage.updateBrdStatus(brd.id, "failed");
        return res.status(400).json({ message: "Either transcriptId or transcriptContent is required" });
      }

      // Return the BRD ID immediately for status tracking
      res.json({ brdId: brd.id, status: "generating" });

      // Generate BRD asynchronously
      try {
        const brdContent = await generateBrd({
          transcriptContent: transcriptContent,
          processArea: brdData.processArea,
          targetSystem: brdData.targetSystem,
          template: brdData.template,
          analysisDepth: brdData.analysisDepth,
          clientName: client.name,
          teamName: team.name,
        });

        await storage.updateBrdStatus(brd.id, "completed", brdContent);
      } catch (error) {
        console.error('BRD generation error:', error);
        await storage.updateBrdStatus(brd.id, "failed");
      }
    } catch (error: any) {
      console.error('BRD creation error:', error);
      res.status(400).json({ message: error.message });
    }
  });

  // Get BRD status
  app.get("/api/brd/:id", async (req, res) => {
    try {
      const brdId = parseInt(req.params.id);
      if (isNaN(brdId)) {
        return res.status(400).json({ message: "Invalid BRD ID" });
      }

      const brd = await storage.getBrd(brdId);
      if (!brd) {
        return res.status(404).json({ message: "BRD not found" });
      }

      res.json(brd);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch BRD" });
    }
  });

  // Get BRD history
  app.get("/api/brds", async (req, res) => {
    try {
      const brds = await storage.getBrds();
      
      // Enhance with client and team names
      const enhancedBrds = await Promise.all(
        brds.map(async (brd) => {
          const [client, team] = await Promise.all([
            storage.getClient(brd.clientId),
            storage.getTeam(brd.teamId),
          ]);
          
          return {
            ...brd,
            clientName: client?.name || "Unknown",
            teamName: team?.name || "Unknown",
          };
        })
      );

      res.json(enhancedBrds);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch BRD history" });
    }
  });

  // Delete BRD
  app.delete("/api/brd/:id", async (req, res) => {
    try {
      const brdId = parseInt(req.params.id);
      if (isNaN(brdId)) {
        return res.status(400).json({ message: "Invalid BRD ID" });
      }

      const success = await storage.deleteBrd(brdId);
      if (!success) {
        return res.status(404).json({ message: "BRD not found" });
      }

      res.json({ message: "BRD deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete BRD" });
    }
  });

  // Generate Implementation Activities
  app.post("/api/generate-implementation", async (req, res) => {
    try {
      const { brd, targetSystem } = req.body;
      
      if (!brd || !targetSystem) {
        return res.status(400).json({ message: "BRD and target system are required" });
      }

      const activities = await generateImplementationActivities(brd, targetSystem);
      res.json(activities);
    } catch (error: any) {
      console.error('Implementation generation error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Generate Test Cases
  app.post("/api/generate-test-cases", async (req, res) => {
    try {
      const { brd } = req.body;
      
      if (!brd) {
        return res.status(400).json({ message: "BRD is required" });
      }

      const testCases = await generateTestCases(brd);
      res.json(testCases);
    } catch (error: any) {
      console.error('Test case generation error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
