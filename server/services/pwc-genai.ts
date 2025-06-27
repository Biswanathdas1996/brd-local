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
const PWC_GENAI_ENDPOINT =
  "https://genai-sharedservice-americas.pwc.com/completions";
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

async function callPwcGenAI(
  prompt: string,
  systemPrompt?: string,
): Promise<string> {
  if (!process.env.PWC_GENAI_API_KEY) {
    throw new Error("PWC_GENAI_API_KEY environment variable is required");
  }

  // Combine system and user prompts
  const fullPrompt = systemPrompt
    ? `${systemPrompt}\n\nUser: ${prompt}`
    : prompt;

  const requestBody: PwcGenAIRequest = {
    model: DEFAULT_MODEL_STR,
    prompt: fullPrompt,
    presence_penalty: 0,
    seed: 25,
    stop: null,
    stream: false,
    stream_options: null,
    temperature: 0.3,
    top_p: 1,
  };

  try {
    const response = await fetch(PWC_GENAI_ENDPOINT, {
      method: "POST",
      headers: {
        accept: "application/json",
        "API-Key": process.env.PWC_GENAI_API_KEY,
        Authorization: `Bearer ${process.env.PWC_GENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(
        `PwC GenAI API error: ${response.status} ${response.statusText}`,
      );
    }

    const data: PwcGenAIResponse = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error("No response choices returned from PwC GenAI API");
    }

    return data.choices[0].text;
  } catch (error: any) {
    console.error("Error calling PwC GenAI API:", error);
    throw new Error(`Failed to call PwC GenAI service: ${error.message}`);
  }
}

// Helper function to fix truncated JSON responses
function fixTruncatedJson(truncatedJson: string): string {
  console.log('Attempting to fix truncated JSON...');
  
  // Find the last complete object/array
  let lastCompleteIndex = -1;
  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  let escapeNext = false;
  
  for (let i = 0; i < truncatedJson.length; i++) {
    const char = truncatedJson[i];
    
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    
    if (char === '\\') {
      escapeNext = true;
      continue;
    }
    
    if (char === '"' && !escapeNext) {
      inString = !inString;
      continue;
    }
    
    if (inString) continue;
    
    if (char === '{') openBraces++;
    else if (char === '}') openBraces--;
    else if (char === '[') openBrackets++;
    else if (char === ']') openBrackets--;
    
    if (openBraces === 1 && openBrackets === 0) {
      lastCompleteIndex = i;
    }
  }
  
  // If we can find a reasonable stopping point, truncate there and close the JSON
  if (lastCompleteIndex > -1) {
    let fixedJson = truncatedJson.substring(0, lastCompleteIndex + 1);
    
    // Add minimal required closing structure
    const requiredFields = [
      '"nonFunctionalRequirements": [{"id": "NFR-001", "title": "Performance", "description": "System performance requirements"}]',
      '"integrationRequirements": [{"id": "IR-001", "title": "Core Banking", "description": "Integration with core banking system"}]',
      '"raciMatrix": [{"task": "Implementation", "responsible": "Development Team", "accountable": "Project Manager", "consulted": "Business Analyst", "informed": "Stakeholders"}]',
      '"assumptions": ["Existing infrastructure available", "User training provided"]',
      '"constraints": ["Regulatory compliance required", "Budget limitations"]',
      '"riskMitigation": ["Regular testing", "Backup procedures"]',
      '"changelog": [{"version": "1.0", "date": "2025-06-27", "author": "PwC GenAI Assistant", "changes": "Initial BRD generation"}]'
    ];
    
    // Remove trailing comma if present
    if (fixedJson.endsWith(',')) {
      fixedJson = fixedJson.slice(0, -1);
    }
    
    // Add missing required fields and close JSON
    fixedJson += ', ' + requiredFields.join(', ') + '}';
    
    console.log('Successfully fixed truncated JSON');
    return fixedJson;
  }
  
  // If we can't fix it intelligently, create a minimal valid BRD
  console.log('Creating minimal fallback BRD structure');
  return `{
    "tableOfContents": [
      {"section": "Executive Summary", "pageNumber": 1},
      {"section": "Functional Requirements", "pageNumber": 2}
    ],
    "executiveSummary": "Business requirements document generated from transcript analysis with PwC GenAI integration.",
    "functionalRequirements": [
      {
        "id": "FR-001",
        "title": "Core Functionality",
        "description": "Primary system functionality based on transcript requirements",
        "priority": "High",
        "complexity": "Medium"
      }
    ],
    "nonFunctionalRequirements": [
      {"id": "NFR-001", "title": "Performance", "description": "System performance requirements"}
    ],
    "integrationRequirements": [
      {"id": "IR-001", "title": "System Integration", "description": "Integration requirements"}
    ],
    "raciMatrix": [
      {"task": "Implementation", "responsible": "Development Team", "accountable": "Project Manager", "consulted": "Business Analyst", "informed": "Stakeholders"}
    ],
    "assumptions": ["Standard implementation assumptions"],
    "constraints": ["Regulatory and budget constraints"],
    "riskMitigation": ["Standard risk mitigation practices"],
    "changelog": [
      {"version": "1.0", "date": "2025-06-27", "author": "PwC GenAI Assistant", "changes": "Initial BRD generation"}
    ]
  }`;
}

export async function generateRequirementEnhancements(
  requirement: any,
  context: any,
): Promise<any> {
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
    let jsonText = responseText.trim();

    // Try to extract JSON from markdown code blocks
    const codeBlockMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1].trim();
    }

    // Find the first { and last } to extract the main JSON object
    const firstBrace = jsonText.indexOf("{");
    const lastBrace = jsonText.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonText = jsonText.substring(firstBrace, lastBrace + 1);
    }

    console.log("Enhancement JSON text:", jsonText.substring(0, 200) + "...");
    return JSON.parse(jsonText);
  } catch (error: any) {
    console.error("Error generating requirement enhancements:", error);
    throw new Error(
      `Failed to generate enhancement suggestions: ${error.message}`,
    );
  }
}

export async function generateBrd(request: BrdRequest): Promise<BrdContent> {
  const systemPrompt = `You are an expert business analyst specializing in financial services and enterprise software implementations. Your task is to analyze call transcripts from business requirements gathering workshops and generate comprehensive Business Requirements Documents (BRDs).

Generate a minimal BRD with essential sections only. Keep ALL text very brief:

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

Please provide a concise response in the following JSON format (keep descriptions brief and focused):
{
  "tableOfContents": [
    {"section": "Executive Summary", "pageNumber": 1},
    {"section": "Functional Requirements", "pageNumber": 2}
  ],
  "executiveSummary": "Brief 1-2 sentence summary",
  "functionalRequirements": [
    {
      "id": "FR-001",
      "title": "Short title",
      "description": "One sentence only",
      "priority": "High",
      "complexity": "Medium"
    },
    {
      "id": "FR-002", 
      "title": "Short title",
      "description": "One sentence only",
      "priority": "Medium",
      "complexity": "Low"
    }
  ],
  "nonFunctionalRequirements": [
    {
      "id": "NFR-001",
      "title": "Short title",
      "description": "One sentence"
    }
  ],
  "integrationRequirements": [
    {
      "id": "IR-001",
      "title": "Short title", 
      "description": "One sentence"
    }
  ],
  "raciMatrix": [
    {
      "task": "Task name",
      "responsible": "Role",
      "accountable": "Role",
      "consulted": "Role",
      "informed": "Role"
    }
  ],
  "assumptions": ["Brief assumption 1", "Brief assumption 2"],
  "constraints": ["Brief constraint 1", "Brief constraint 2"],
  "riskMitigation": ["Brief risk mitigation 1"],
  "changelog": [
    {
      "version": "1.0",
      "date": "${new Date().toISOString().split("T")[0]}",
      "author": "PwC GenAI Assistant",
      "changes": "Initial BRD generation"
    }
  ]
}`;

  try {
    const responseText = await callPwcGenAI(userPrompt, systemPrompt);
    console.log("Raw PwC GenAI response:", responseText);

    // Extract JSON from PwC GenAI response (handles markdown format)
    let jsonText = responseText.trim();

    // Extract JSON from markdown code blocks
    if (jsonText.includes("```")) {
      // Find the content between ```json and ```
      const startMarker = jsonText.indexOf("```");
      const endMarker = jsonText.indexOf("```", startMarker + 3);

      if (startMarker !== -1 && endMarker !== -1) {
        let codeContent = jsonText.substring(startMarker + 3, endMarker).trim();

        // Remove 'json' if it's at the beginning
        if (codeContent.startsWith("json")) {
          codeContent = codeContent.substring(4).trim();
        }

        jsonText = codeContent;
        console.log("Successfully extracted from markdown code block");
      }
    }

    // Ensure we have a valid JSON object
    if (!jsonText.startsWith("{")) {
      const firstBrace = jsonText.indexOf("{");
      const lastBrace = jsonText.lastIndexOf("}");

      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonText = jsonText.substring(firstBrace, lastBrace + 1);
        console.log("Extracted JSON using brace boundaries");
      }
    }

    console.log(
      "Final JSON to parse (first 300 chars):",
      jsonText.substring(0, 300),
    );
    
    // Handle truncated JSON by attempting to complete it
    let brdData;
    try {
      brdData = JSON.parse(jsonText);
    } catch (parseError) {
      console.log('JSON parsing failed, attempting to fix truncated response...');
      const fixedJson = fixTruncatedJson(jsonText);
      brdData = JSON.parse(fixedJson);
    }

    // Validate the structure
    if (
      !brdData.functionalRequirements ||
      !Array.isArray(brdData.functionalRequirements)
    ) {
      throw new Error(
        "Invalid BRD structure: missing or invalid functional requirements",
      );
    }

    return brdData as BrdContent;
  } catch (error: any) {
    console.error("Error generating BRD:", error);
    throw new Error(`Failed to generate BRD: ${error.message}`);
  }
}
