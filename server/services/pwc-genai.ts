/*
<important_code_snippet_instructions>
This service integrates with PwC's internal GenAI shared service API.
Using bedrock.anthropic.claude-sonnet-4 model through PwC's secure internal infrastructure.
API endpoint: https://genai-sharedservice-americas.pwc.com/completions
Authentication: Dual header approach with API-Key and Bearer token
</important_code_snippet_instructions>
*/

// <important_do_not_delete>
const DEFAULT_MODEL_STR = "bedrock.anthropic.claude-sonnet-4";
const PWC_GENAI_ENDPOINT = "https://genai-sharedservice-americas.pwc.com/completions";
// </important_do_not_delete>

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

interface PwcGenAIRequest {
  model: string;
  prompt: string;
  presence_penalty?: number;
  seed?: number;
  stop?: string | null;
  stream?: boolean;
  stream_options?: any;
  temperature?: number;
  top_p?: number;
}

interface PwcGenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    finish_reason: string;
    index: number;
    text: string;
    logprobs: any;
  }>;
  usage: {
    completion_tokens: number;
    prompt_tokens: number;
    total_tokens: number;
    completion_tokens_details?: any;
    prompt_tokens_details?: any;
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
  };
}

async function callPwcGenAI(prompt: string, systemPrompt?: string): Promise<string> {
  if (!process.env.PWC_GENAI_API_KEY) {
    throw new Error("PWC_GENAI_API_KEY environment variable is required");
  }

  // Combine system and user prompts
  const fullPrompt = systemPrompt ? `${systemPrompt}\n\nUser: ${prompt}` : prompt;

  const requestBody: PwcGenAIRequest = {
    model: DEFAULT_MODEL_STR,
    prompt: fullPrompt,
    presence_penalty: 0,
    seed: 25,
    stop: null,
    stream: false,
    stream_options: null,
    temperature: 0.7,
    top_p: 1
  };

  try {
    const response = await fetch(PWC_GENAI_ENDPOINT, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'API-Key': process.env.PWC_GENAI_API_KEY,
        'Authorization': `Bearer ${process.env.PWC_GENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`PwC GenAI API error: ${response.status} ${response.statusText}`);
    }

    const data: PwcGenAIResponse = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response choices returned from PwC GenAI API');
    }

    return data.choices[0].text;
  } catch (error: any) {
    console.error('Error calling PwC GenAI API:', error);
    throw new Error(`Failed to call PwC GenAI service: ${error.message}`);
  }
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
    const responseText = await callPwcGenAI(userPrompt, systemPrompt);

    // Extract JSON from markdown code blocks if present
    let jsonText = responseText;
    const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }

    return JSON.parse(jsonText);
  } catch (error: any) {
    console.error('Error generating requirement enhancements:', error);
    throw new Error(`Failed to generate enhancement suggestions: ${error.message}`);
  }
}

export async function generateBrd(request: BrdRequest): Promise<BrdContent> {
  const systemPrompt = `You are an expert business analyst specializing in financial services and enterprise software implementations. Your task is to analyze call transcripts from business requirements gathering workshops and generate comprehensive Business Requirements Documents (BRDs).

You will receive transcript content along with context about the process area, target system, client, and team. Generate a structured BRD that includes:

1. **Table of Contents** - A structured outline with sections and page numbers
2. **Executive Summary** - High-level overview of business objectives and proposed solution
3. **Functional Requirements** - Detailed functional requirements with IDs, titles, descriptions, priority levels (High/Medium/Low), and complexity ratings (High/Medium/Low)
4. **Non-Functional Requirements** - Performance, security, scalability, and usability requirements
5. **Integration Requirements** - System integration and data flow requirements
6. **RACI Matrix** - Responsibility assignment matrix for key tasks and deliverables
7. **Assumptions** - Key assumptions made during requirements gathering
8. **Constraints** - Technical, business, and regulatory constraints
9. **Risk Mitigation** - Identified risks and mitigation strategies
10. **Changelog** - Version control and change tracking

Focus specifically on Indian banking context with:
- RBI (Reserve Bank of India) regulatory compliance
- Digital India initiatives
- UPI and payment system integration
- KYC/AML requirements
- Core banking system modernization
- Digital banking transformation

Ensure all requirements are:
- Specific and measurable
- Technically feasible
- Compliant with Indian banking regulations
- Aligned with digital transformation goals`;

  const userPrompt = `Based on the following call transcript and context, generate a comprehensive Business Requirements Document:

**Context:**
- Client: ${request.clientName}
- Team: ${request.teamName}
- Process Area: ${request.processArea}
- Target System: ${request.targetSystem}
- Template: ${request.template}
- Analysis Depth: ${request.analysisDepth}

**Transcript Content:**
${request.transcriptContent}

Please provide the response in the following JSON format:
{
  "tableOfContents": [
    {"section": "Executive Summary", "pageNumber": 1},
    {"section": "Functional Requirements", "pageNumber": 2}
  ],
  "executiveSummary": "...",
  "functionalRequirements": [
    {
      "id": "FR-001",
      "title": "...",
      "description": "...",
      "priority": "High|Medium|Low",
      "complexity": "High|Medium|Low"
    }
  ],
  "nonFunctionalRequirements": [
    {
      "id": "NFR-001",
      "title": "...",
      "description": "..."
    }
  ],
  "integrationRequirements": [
    {
      "id": "IR-001",
      "title": "...",
      "description": "..."
    }
  ],
  "raciMatrix": [
    {
      "task": "...",
      "responsible": "...",
      "accountable": "...",
      "consulted": "...",
      "informed": "..."
    }
  ],
  "assumptions": ["...", "..."],
  "constraints": ["...", "..."],
  "riskMitigation": ["...", "..."],
  "changelog": [
    {
      "version": "1.0",
      "date": "${new Date().toISOString().split('T')[0]}",
      "author": "PwC GenAI Assistant",
      "changes": "Initial BRD generation from transcript analysis"
    }
  ]
}`;

  try {
    const responseText = await callPwcGenAI(userPrompt, systemPrompt);

    // Extract JSON from markdown code blocks if present
    let jsonText = responseText;
    const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }

    const brdData = JSON.parse(jsonText);
    
    // Validate the structure
    if (!brdData.functionalRequirements || !Array.isArray(brdData.functionalRequirements)) {
      throw new Error('Invalid BRD structure: missing or invalid functional requirements');
    }

    return brdData as BrdContent;
  } catch (error: any) {
    console.error('Error generating BRD:', error);
    throw new Error(`Failed to generate BRD: ${error.message}`);
  }
}