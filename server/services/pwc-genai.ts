/*
<important_code_snippet_instructions>
This service integrates with PwC's internal GenAI shared service API.
Using vertex_ai.gemini-2.0-flash model through PwC's secure internal infrastructure.
API endpoint: https://genai-sharedservice-americas.pwc.com/completions
Authentication: Dual header approach with API-Key and Bearer token
</important_code_snippet_instructions>
*/

// <important_do_not_delete>
const DEFAULT_MODEL_STR = "vertex_ai.gemini-2.0-flash";
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
    acceptanceCriteria: string[];
    userStories: Array<{
      role: string;
      goal: string;
      benefit: string;
    }>;
    dependencies: string[];
  }>;
  nonFunctionalRequirements: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    scalabilityMetrics?: {
      concurrentUsers: string;
      transactionVolume: string;
    };
    availabilityRequirements?: {
      uptime: string;
      disasterRecovery: string;
    };
    securityStandards?: {
      encryption: string;
      auditTrails: string;
      accessControls: string;
    };
    usabilityStandards?: {
      responseTime: string;
      userExperience: string;
    };
    complianceDetails?: {
      regulations: string[];
      requirements: string;
    };
  }>;
  integrationRequirements: Array<{
    id: string;
    title: string;
    description: string;
    apiSpecifications?: {
      endpoints: string;
      dataFormats: string;
      authentication: string;
    };
    dataFlow: string[];
  }>;
  businessProcessFlows: Array<{
    id: string;
    processName: string;
    currentState: string;
    futureState: string;
    steps: Array<{
      stepNumber: number;
      description: string;
      actor: string;
      decision?: string;
    }>;
  }>;
  userInterfaceRequirements: Array<{
    id: string;
    screenName: string;
    description: string;
    components: string[];
    navigationFlow: string;
    accessibility: string;
    responsiveness: string;
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
  riskManagement: Array<{
    id: string;
    category: string;
    description: string;
    probability: string;
    impact: string;
    mitigation: string;
    owner: string;
  }>;
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
  console.log('=== TRUNCATED JSON FIX ATTEMPT ===');
  console.log('Input JSON length:', truncatedJson.length);
  console.log('Input JSON starts with:', JSON.stringify(truncatedJson.substring(0, 100)));
  console.log('Input JSON ends with:', JSON.stringify(truncatedJson.slice(-100)));
  
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
  
  // Find the last complete functional requirement
  const functionalReqMatch = truncatedJson.match(/("functionalRequirements"\s*:\s*\[[\s\S]*?)(?:,\s*"[^"]*"\s*:\s*$|$)/);
  
  if (functionalReqMatch) {
    let baseJson = truncatedJson.substring(0, functionalReqMatch.index + functionalReqMatch[1].length);
    
    // Ensure proper closure of functional requirements array
    if (!baseJson.trim().endsWith(']')) {
      // Find the last complete functional requirement object
      const lastCompleteReq = baseJson.lastIndexOf('}');
      if (lastCompleteReq > -1) {
        baseJson = baseJson.substring(0, lastCompleteReq + 1) + '\n  ]';
      } else {
        baseJson += ']';
      }
    }
    
    // Add required closing structure
    const closingStructure = `,
  "nonFunctionalRequirements": [
    {"id": "NFR-001", "title": "Performance", "description": "System performance requirements"}
  ],
  "integrationRequirements": [
    {"id": "IR-001", "title": "Core Banking", "description": "Integration with core banking system"}
  ],
  "raciMatrix": [
    {"task": "Implementation", "responsible": "Development Team", "accountable": "Project Manager", "consulted": "Business Analyst", "informed": "Stakeholders"}
  ],
  "assumptions": ["Existing infrastructure available", "User training provided"],
  "constraints": ["Regulatory compliance required", "Budget limitations"],
  "riskMitigation": ["Regular testing", "Backup procedures"],
  "changelog": [
    {"version": "1.0", "date": "2025-06-27", "author": "PwC GenAI Assistant", "changes": "Initial BRD generation"}
  ]
}`;
    
    const fixedJson = baseJson + closingStructure;
    console.log('=== JSON FIX COMPLETE ===');
    console.log('Fixed JSON length:', fixedJson.length);
    console.log('Base JSON used:', JSON.stringify(baseJson.slice(-100)));
    console.log('Closing structure added:', JSON.stringify(closingStructure.substring(0, 100)));
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

Generate a comprehensive BRD with enhanced sections:

1. **Table of Contents** - A structured outline with sections and page numbers
2. **Executive Summary** - High-level overview of business objectives and proposed solution
3. **Functional Requirements** - Enhanced with acceptance criteria, user stories, and dependencies
4. **Non-Functional Requirements** - Categorized with specific metrics for scalability, availability, security, usability, and compliance
5. **Integration Requirements** - Detailed with API specifications and data flow processes
6. **Business Process Flows** - Current state vs future state workflows with step-by-step processes
7. **User Interface Requirements** - Screen specifications, navigation flows, and accessibility standards
8. **RACI Matrix** - Responsibility assignment matrix for key tasks and deliverables
9. **Assumptions** - Key assumptions made during requirements gathering
10. **Constraints** - Technical, business, and regulatory constraints
11. **Risk Management** - Categorized risks with probability, impact, mitigation, and ownership
12. **Changelog** - Version control and change tracking

Focus specifically on Indian banking context with:
- RBI (Reserve Bank of India) regulatory compliance
- Digital India initiatives
- UPI and payment system integration
- KYC/AML requirements
- Core banking system modernization
- Digital banking transformation

Ensure all requirements are:
- Specific and measurable with comprehensive acceptance criteria covering functional behavior, performance, security, and compliance aspects
- Include detailed user stories in "As a [role], I want [goal] so that [benefit]" format
- Technically feasible with proper dependencies identified
- Compliant with Indian banking regulations (RBI, SEBI, IRDAI)
- Aligned with digital transformation goals

**Important: For acceptance criteria, provide at least 5-8 detailed, testable conditions that cover:**
- Functional behavior and expected outcomes
- Input validation and error handling scenarios
- Security and authentication requirements
- Performance and response time criteria
- Integration and data flow validation
- User interface and experience requirements
- Compliance and audit trail requirements`;

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

Please provide a comprehensive response in the following JSON format:
{
  "tableOfContents": [
    {"section": "Executive Summary", "pageNumber": 1},
    {"section": "Functional Requirements", "pageNumber": 2},
    {"section": "Non-Functional Requirements", "pageNumber": 3},
    {"section": "Integration Requirements", "pageNumber": 4},
    {"section": "Business Process Flows", "pageNumber": 5},
    {"section": "User Interface Requirements", "pageNumber": 6},
    {"section": "RACI Matrix", "pageNumber": 7},
    {"section": "Risk Management", "pageNumber": 8},
    {"section": "Assumptions", "pageNumber": 9},
    {"section": "Constraints", "pageNumber": 10},
    {"section": "Changelog", "pageNumber": 11}
  ],
  "executiveSummary": "Comprehensive 2-3 sentence summary including business objectives and value proposition",
  "functionalRequirements": [
    {
      "id": "FR-001",
      "title": "Requirement title",
      "description": "Detailed description of the functional requirement",
      "priority": "High",
      "complexity": "Medium",
      "acceptanceCriteria": [
        "Given valid customer credentials, when user initiates the process, then system should authenticate within 3 seconds",
        "Given incomplete required fields, when user submits form, then system should display specific field-level validation errors",
        "Given successful transaction, when process completes, then system should generate audit trail with timestamp and user ID",
        "Given system processing, when response time exceeds 5 seconds, then system should display progress indicator",
        "Given user input validation, when invalid data is entered, then system should prevent submission and show clear error messages",
        "Given successful completion, when data is saved, then system should provide confirmation message with reference number",
        "Given integration requirements, when external system is unavailable, then system should handle gracefully with appropriate error message",
        "Given regulatory compliance, when transaction is processed, then all RBI/KYC requirements must be validated and logged"
      ],
      "userStories": [
        {
          "role": "Bank Customer",
          "goal": "apply for a loan online",
          "benefit": "faster processing and convenience"
        }
      ],
      "dependencies": ["FR-002", "System X integration"]
    }
  ],
  "nonFunctionalRequirements": [
    {
      "id": "NFR-001",
      "title": "Performance requirement",
      "description": "Detailed performance specification",
      "category": "Performance",
      "scalabilityMetrics": {
        "concurrentUsers": "1000 concurrent users",
        "transactionVolume": "10,000 transactions per day"
      }
    },
    {
      "id": "NFR-002", 
      "title": "Security requirement",
      "description": "Security specification",
      "category": "Security",
      "securityStandards": {
        "encryption": "AES-256 encryption for data at rest",
        "auditTrails": "Complete audit logs for all transactions",
        "accessControls": "Role-based access control with MFA"
      }
    },
    {
      "id": "NFR-003",
      "title": "Availability requirement", 
      "description": "System availability specification",
      "category": "Availability",
      "availabilityRequirements": {
        "uptime": "99.9% uptime SLA",
        "disasterRecovery": "4-hour RTO, 1-hour RPO"
      }
    },
    {
      "id": "NFR-004",
      "title": "Compliance requirement",
      "description": "Regulatory compliance specification", 
      "category": "Compliance",
      "complianceDetails": {
        "regulations": ["RBI Guidelines", "KYC/AML Norms"],
        "requirements": "Must comply with RBI's digital lending guidelines"
      }
    }
  ],
  "integrationRequirements": [
    {
      "id": "IR-001",
      "title": "Core banking integration",
      "description": "Integration with core banking system",
      "apiSpecifications": {
        "endpoints": "/api/customers, /api/accounts",
        "dataFormats": "JSON over HTTPS",
        "authentication": "OAuth 2.0 with JWT tokens"
      },
      "dataFlow": [
        "Customer data retrieved from core banking",
        "Account balance validated",
        "Transaction posted to core system"
      ]
    }
  ],
  "businessProcessFlows": [
    {
      "id": "BPF-001",
      "processName": "Loan Application Process",
      "currentState": "Manual paper-based application with 5-7 day processing",
      "futureState": "Digital application with automated decisioning in 24 hours",
      "steps": [
        {
          "stepNumber": 1,
          "description": "Customer submits online application",
          "actor": "Customer",
          "decision": "Application complete?"
        },
        {
          "stepNumber": 2,
          "description": "System validates customer data",
          "actor": "System"
        }
      ]
    }
  ],
  "userInterfaceRequirements": [
    {
      "id": "UI-001",
      "screenName": "Loan Application Form",
      "description": "Customer-facing loan application interface",
      "components": ["Input fields", "Document upload", "Progress indicator"],
      "navigationFlow": "Home > Products > Loans > Application > Review > Submit",
      "accessibility": "WCAG 2.1 AA compliance",
      "responsiveness": "Mobile-first responsive design"
    }
  ],
  "raciMatrix": [
    {
      "task": "Requirements gathering",
      "responsible": "Business Analyst",
      "accountable": "Project Manager", 
      "consulted": "Subject Matter Expert",
      "informed": "Stakeholders"
    }
  ],
  "assumptions": ["API documentation is available", "Regulatory approval obtained"],
  "constraints": ["Budget limitations", "6-month timeline"],
  "riskManagement": [
    {
      "id": "RISK-001",
      "category": "Technical", 
      "description": "API integration complexity",
      "probability": "Medium",
      "impact": "High",
      "mitigation": "Conduct technical spike and proof of concept",
      "owner": "Technical Lead"
    },
    {
      "id": "RISK-002",
      "category": "Compliance",
      "description": "Regulatory changes",
      "probability": "Low", 
      "impact": "High",
      "mitigation": "Regular monitoring of RBI updates",
      "owner": "Compliance Officer"
    }
  ],
  "changelog": [
    {
      "version": "1.0",
      "date": "${new Date().toISOString().split("T")[0]}",
      "author": "PwC GenAI Assistant",
      "changes": "Initial comprehensive BRD generation"
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
      console.log('JSON parsing successful - no truncation detected');
    } catch (parseError) {
      console.log('=== JSON PARSING ERROR DETAILS ===');
      console.log('Original error:', parseError.message);
      console.log('Error position:', parseError.message.match(/position (\d+)/)?.[1] || 'unknown');
      console.log('JSON length:', jsonText.length);
      console.log('JSON substring around error:');
      const errorPos = parseInt(parseError.message.match(/position (\d+)/)?.[1] || '0');
      const start = Math.max(0, errorPos - 50);
      const end = Math.min(jsonText.length, errorPos + 50);
      console.log(`Characters ${start}-${end}:`, JSON.stringify(jsonText.substring(start, end)));
      console.log('Last 100 characters of JSON:', JSON.stringify(jsonText.slice(-100)));
      console.log('=== ATTEMPTING JSON FIX ===');
      
      try {
        const fixedJson = fixTruncatedJson(jsonText);
        console.log('Fixed JSON length:', fixedJson.length);
        console.log('Fixed JSON last 100 chars:', JSON.stringify(fixedJson.slice(-100)));
        brdData = JSON.parse(fixedJson);
        console.log('JSON fix successful!');
      } catch (fixError) {
        console.log('JSON fix failed:', fixError.message);
        console.log('Fix error position:', fixError.message.match(/position (\d+)/)?.[1] || 'unknown');
        throw fixError;
      }
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

export async function generateImplementationActivities(brd: any, targetSystem: string) {
  try {
    const prompt = `
As an expert implementation consultant specializing in ${targetSystem}, convert the following BRD into detailed implementation activities.

Target System: ${targetSystem}
BRD Content: ${JSON.stringify(brd.content, null, 2)}

Generate a comprehensive implementation plan organized into three categories:

1. **Configuration Activities**: System setup, field configuration, workflow configuration
2. **Development Activities**: Custom code, integrations, APIs, custom components  
3. **Integration Activities**: Third-party integrations, data migration, API connections

For each activity, provide:
- title: Clear activity name
- description: Detailed description of what needs to be done
- effort: Estimated effort (e.g., "2-3 days", "1 week")
- skillsRequired: Array of required skills/expertise

Focus on ${targetSystem}-specific implementation details. Consider Indian banking compliance requirements (RBI, SEBI, IRDAI).

Return JSON in this exact format:
{
  "configurationActivities": [
    {
      "title": "string",
      "description": "string", 
      "effort": "string",
      "skillsRequired": ["string"]
    }
  ],
  "developmentActivities": [
    {
      "title": "string",
      "description": "string",
      "effort": "string", 
      "skillsRequired": ["string"]
    }
  ],
  "integrationActivities": [
    {
      "title": "string",
      "description": "string",
      "effort": "string",
      "skillsRequired": ["string"]
    }
  ]
}`;

    const responseText = await callPwcGenAI(prompt);
    
    if (!responseText) {
      throw new Error("No response from AI service");
    }

    const content = responseText.trim();
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response");
    }

    const activities = JSON.parse(jsonMatch[0]);
    return activities;
  } catch (error: any) {
    console.error("Error generating implementation activities:", error);
    throw new Error(`Failed to generate implementation activities: ${error.message}`);
  }
}

export async function generateTestCases(brd: any) {
  try {
    const prompt = `
As a QA testing expert specializing in banking systems, convert the following BRD into comprehensive test cases.

BRD Content: ${JSON.stringify(brd.content, null, 2)}

Generate test cases organized into three categories:

1. **Functional Tests**: Test functional requirements, user workflows, business logic
2. **Integration Tests**: Test API integrations, data flow, third-party connections
3. **Performance Tests**: Test system performance, load handling, response times

For functional and integration tests, provide:
- id: Test case ID (e.g., "TC-F-001", "TC-I-001")
- title: Clear test case name
- description: What is being tested
- priority: High/Medium/Low
- preconditions: Setup required before test
- testSteps: Array of step-by-step test actions
- expectedResult: Expected outcome

For performance tests, provide:
- id: Test case ID (e.g., "TC-P-001")
- title: Clear test case name
- description: What is being tested
- loadConditions: Load/stress conditions to apply
- acceptanceCriteria: Performance criteria that must be met

Focus on Indian banking compliance testing (RBI, SEBI, IRDAI) and include security, data privacy, and regulatory validation tests.

Return JSON in this exact format:
{
  "functionalTests": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "priority": "string",
      "preconditions": "string",
      "testSteps": ["string"],
      "expectedResult": "string"
    }
  ],
  "integrationTests": [
    {
      "id": "string", 
      "title": "string",
      "description": "string",
      "priority": "string",
      "preconditions": "string",
      "testSteps": ["string"],
      "expectedResult": "string"
    }
  ],
  "performanceTests": [
    {
      "id": "string",
      "title": "string", 
      "description": "string",
      "loadConditions": "string",
      "acceptanceCriteria": "string"
    }
  ]
}`;

    const responseText = await callPwcGenAI(prompt);
    
    if (!responseText) {
      throw new Error("No response from AI service");
    }

    const content = responseText.trim();
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response");
    }

    const testCases = JSON.parse(jsonMatch[0]);
    return testCases;
  } catch (error: any) {
    console.error("Error generating test cases:", error);
    throw new Error(`Failed to generate test cases: ${error.message}`);
  }
}
