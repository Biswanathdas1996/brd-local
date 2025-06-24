import Anthropic from '@anthropic-ai/sdk';

/*
The newest Anthropic model is "claude-sonnet-4-20250514", not "claude-3-7-sonnet-20250219", "claude-3-5-sonnet-20241022" nor "claude-3-sonnet-20240229". 
If the user doesn't specify a model, always prefer using "claude-sonnet-4-20250514" as it is the latest model.
*/

// <important_do_not_delete>
const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";
// </important_do_not_delete>

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY_ENV_VAR || "default_key",
});

export interface BrdRequest {
  transcriptContent: string;
  processArea: string;
  targetSystem: string;
  template: string;
  analysisDepth: string;
  clientName: string;
  teamName: string;
}

export interface BrdContent {
  tableOfContents: Array<{
    section: string;
    pageNumber: number;
  }>;
  executiveSummary: string;
  functionalRequirements: Array<{
    id: string;
    title: string;
    description: string;
    priority: string;
    complexity: string;
  }>;
  nonFunctionalRequirements: Array<{
    id: string;
    title: string;
    description: string;
  }>;
  integrationRequirements: Array<{
    id: string;
    title: string;
    description: string;
  }>;
  raciMatrix: Array<{
    task: string;
    responsible: string;
    accountable: string;
    consulted: string;
    informed: string;
  }>;
  assumptions: string[];
  constraints: string[];
  riskMitigation: string[];
  changelog: Array<{
    version: string;
    date: string;
    author: string;
    changes: string;
  }>;
}

export async function generateRequirementEnhancements(requirement: any, context: any): Promise<any> {
  const systemPrompt = `You are an expert business analyst specializing in requirement enhancement for Indian banking systems. Your task is to analyze a functional requirement and provide specific, actionable suggestions to improve it.

Focus on:
- Clarity and specificity
- Measurable acceptance criteria
- Technical feasibility
- Regulatory compliance (RBI guidelines)
- User experience improvements
- Security considerations
- Performance requirements

Provide both general suggestions and an enhanced version of the requirement.`;

  const userPrompt = `Please analyze this functional requirement and provide enhancement suggestions:

**Current Requirement:**
ID: ${requirement.id}
Title: ${requirement.title}
Description: ${requirement.description}
Priority: ${requirement.priority}
Complexity: ${requirement.complexity}

**Context:**
Process Area: ${context.processArea}
Target System: ${context.targetSystem}

Please provide:
1. List of specific improvement suggestions
2. An enhanced version of the requirement with better clarity, acceptance criteria, and technical details

Format your response as JSON:
{
  "suggestions": ["suggestion 1", "suggestion 2", ...],
  "enhancedRequirement": {
    "id": "enhanced_id",
    "title": "enhanced_title",
    "description": "enhanced_description_with_acceptance_criteria",
    "priority": "priority",
    "complexity": "complexity"
  }
}`;

  try {
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      system: systemPrompt,
      max_tokens: 2000,
      messages: [
        { role: 'user', content: userPrompt }
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Anthropic API');
    }

    // Extract JSON from markdown code blocks if present
    let jsonText = content.text;
    const jsonMatch = content.text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }

    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Error generating requirement enhancements:', error);
    throw new Error(`Failed to generate enhancement suggestions: ${error.message}`);
  }
}

export async function generateBrd(request: BrdRequest): Promise<BrdContent> {
  const systemPrompt = `You are an expert business analyst specializing in financial services and enterprise software implementations. Your task is to analyze call transcripts from business requirements gathering workshops and generate comprehensive Business Requirements Documents (BRDs).

You will receive transcript content along with context about the process area, target system, client, and team. Generate a structured BRD that includes:

1. Executive Summary - High-level overview of the requirements
2. Functional Requirements - Specific features and capabilities needed
3. Non-Functional Requirements - Performance, security, scalability requirements
4. Integration Requirements - How the solution integrates with existing systems
5. Assumptions - Key assumptions made during analysis
6. Constraints - Technical or business limitations
7. Risk Mitigation - Potential risks and mitigation strategies
8. Table of Contents - Section listing with page numbers
9. RACI Matrix - Responsibility assignment matrix
10. Changelog - Document version history

Format your response as valid JSON with the structure:
{
  "tableOfContents": [{"section": "Executive Summary", "pageNumber": 1}, {"section": "Functional Requirements", "pageNumber": 2}],
  "executiveSummary": "string",
  "functionalRequirements": [{"id": "FR-001", "title": "string", "description": "string", "priority": "High|Medium|Low", "complexity": "High|Medium|Low"}],
  "nonFunctionalRequirements": [{"id": "NFR-001", "title": "string", "description": "string"}],
  "integrationRequirements": [{"id": "INT-001", "title": "string", "description": "string"}],
  "raciMatrix": [{"task": "Requirements Analysis", "responsible": "Business Analyst", "accountable": "Project Manager", "consulted": "Subject Matter Expert", "informed": "Stakeholders"}],
  "assumptions": ["string"],
  "constraints": ["string"],
  "riskMitigation": ["string"],
  "changelog": [{"version": "1.0", "date": "2024-06-24", "author": "Business Analyst", "changes": "Initial version of BRD"}]
}

Ensure all requirements are:
- Specific and measurable
- Relevant to the process area and target system
- Technically feasible
- Aligned with financial services best practices
- Compliant with regulatory requirements where applicable`;

  const userPrompt = `Please analyze the following transcript and generate a comprehensive BRD:

**Context:**
- Client: ${request.clientName}
- Team: ${request.teamName}
- Process Area: ${request.processArea}
- Target System: ${request.targetSystem}
- Template: ${request.template}
- Analysis Depth: ${request.analysisDepth}

**Transcript Content:**
${request.transcriptContent}

Generate a detailed BRD based on this information. Focus on extracting concrete requirements from the transcript while ensuring they align with the specified process area and target system capabilities.`;

  try {
    const response = await anthropic.messages.create({
      // "claude-sonnet-4-20250514"
      model: DEFAULT_MODEL_STR,
      system: systemPrompt,
      max_tokens: 4000,
      messages: [
        { role: 'user', content: userPrompt }
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Anthropic API');
    }

    // Extract JSON from markdown code blocks if present
    let jsonText = content.text;
    const jsonMatch = content.text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }
    
    const brdContent = JSON.parse(jsonText) as BrdContent;
    
    // Validate the response structure
    if (!brdContent.executiveSummary || !Array.isArray(brdContent.functionalRequirements)) {
      throw new Error('Invalid BRD structure returned from AI');
    }

    // Ensure all new fields exist with defaults if missing
    if (!brdContent.tableOfContents) {
      brdContent.tableOfContents = [
        { section: "Executive Summary", pageNumber: 1 },
        { section: "Functional Requirements", pageNumber: 2 },
        { section: "Non-Functional Requirements", pageNumber: 3 },
        { section: "Integration Requirements", pageNumber: 4 },
        { section: "RACI Matrix", pageNumber: 5 },
        { section: "Assumptions", pageNumber: 6 },
        { section: "Constraints", pageNumber: 7 },
        { section: "Risk Mitigation", pageNumber: 8 },
        { section: "Changelog", pageNumber: 9 }
      ];
    }

    if (!brdContent.raciMatrix) {
      brdContent.raciMatrix = [
        {
          task: "Requirements Analysis",
          responsible: "Business Analyst",
          accountable: "Project Manager",
          consulted: "Subject Matter Expert",
          informed: "Stakeholders"
        },
        {
          task: "Solution Design",
          responsible: "Solution Architect",
          accountable: "Technical Lead",
          consulted: "Business Analyst",
          informed: "Development Team"
        },
        {
          task: "Implementation",
          responsible: "Development Team",
          accountable: "Technical Lead",
          consulted: "Solution Architect",
          informed: "Project Manager"
        }
      ];
    }

    if (!brdContent.changelog) {
      brdContent.changelog = [
        {
          version: "1.0",
          date: new Date().toISOString().split('T')[0],
          author: "Business Analyst",
          changes: "Initial version of Business Requirements Document"
        }
      ];
    }

    return brdContent;
  } catch (error) {
    console.error('Error generating BRD:', error);
    throw new Error(`Failed to generate BRD: ${error.message}`);
  }
}
