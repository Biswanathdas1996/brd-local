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
  assumptions: string[];
  constraints: string[];
  riskMitigation: string[];
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

Format your response as valid JSON with the structure:
{
  "executiveSummary": "string",
  "functionalRequirements": [{"id": "FR-001", "title": "string", "description": "string", "priority": "High|Medium|Low", "complexity": "High|Medium|Low"}],
  "nonFunctionalRequirements": [{"id": "NFR-001", "title": "string", "description": "string"}],
  "integrationRequirements": [{"id": "INT-001", "title": "string", "description": "string"}],
  "assumptions": ["string"],
  "constraints": ["string"],
  "riskMitigation": ["string"]
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

    return brdContent;
  } catch (error) {
    console.error('Error generating BRD:', error);
    throw new Error(`Failed to generate BRD: ${error.message}`);
  }
}
