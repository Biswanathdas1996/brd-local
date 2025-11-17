/*
Local LLM Service Integration
Uses local Gemma3 model via custom endpoint
API endpoint: Configurable via LLM_ENDPOINT environment variable
*/

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

interface LocalLLMRequest {
  model: string;
  prompt: string;
  temperature: number;
}

interface LocalLLMResponse {
  response?: string;
  text?: string;
  content?: string;
}

async function callLocalLLM(
  prompt: string,
  systemPrompt?: string,
  temperature: number = 0.7
): Promise<string> {
  const endpoint = process.env.LLM_ENDPOINT || "http://192.168.1.10:8000/generate";
  const model = process.env.LLM_MODEL || "gemma3:latest";

  const fullPrompt = systemPrompt
    ? `${systemPrompt}\n\nUser: ${prompt}`
    : prompt;

  const requestBody: LocalLLMRequest = {
    model: model,
    prompt: fullPrompt,
    temperature: temperature,
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(
        `Local LLM API error: ${response.status} ${response.statusText}`,
      );
    }

    const data: LocalLLMResponse = await response.json();

    const responseText = data.response || data.text || data.content || "";
    
    if (!responseText) {
      throw new Error("No response text returned from Local LLM API");
    }

    return responseText;
  } catch (error: any) {
    console.error("Error calling Local LLM API:", error);
    throw new Error(`Failed to call Local LLM service: ${error.message}`);
  }
}

function extractJsonFromResponse(responseText: string): string {
  let jsonText = responseText.trim();

  const codeBlockMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    jsonText = codeBlockMatch[1].trim();
  }

  const firstBrace = jsonText.indexOf("{");
  const lastBrace = jsonText.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    jsonText = jsonText.substring(firstBrace, lastBrace + 1);
  }

  return jsonText;
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
    const responseText = await callLocalLLM(userPrompt, systemPrompt);
    const jsonText = extractJsonFromResponse(responseText);
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
  const systemPrompt = `You are an expert business analyst specializing in Indian banking and financial services implementations. Generate a COMPREHENSIVE, DETAILED Business Requirements Document (BRD) with ALL 12 sections fully populated.

CRITICAL: Each section MUST contain substantial, detailed content. DO NOT generate minimal or placeholder content.

REQUIRED OUTPUT STRUCTURE - ALL sections are MANDATORY:

1. TABLE OF CONTENTS (minimum 12 entries): List ALL sections with page numbers
2. EXECUTIVE SUMMARY (minimum 300 words): Business context, objectives, scope, stakeholders, expected benefits, timeline
3. FUNCTIONAL REQUIREMENTS (minimum 8-12 requirements): Each with id, title, detailed description (100+ words), priority, complexity, 8-12 specific acceptance criteria, 2-3 user stories, dependencies
4. NON-FUNCTIONAL REQUIREMENTS (minimum 6-8 requirements): Cover Performance, Security, Scalability, Availability, Usability, Compliance with detailed metrics
5. INTEGRATION REQUIREMENTS (minimum 4-6 integrations): APIs, data flows, authentication details
6. BUSINESS PROCESS FLOWS (minimum 3-5 processes): Current vs Future state, 6-10 detailed steps each
7. USER INTERFACE REQUIREMENTS (minimum 5-8 screens): Screen specs, components, navigation, accessibility
8. RACI MATRIX (minimum 8-12 tasks): Detailed responsibility assignments
9. ASSUMPTIONS (minimum 8-10 items): Technical, business, and operational assumptions
10. CONSTRAINTS (minimum 6-8 items): Budget, timeline, technical, regulatory constraints
11. RISK MANAGEMENT (minimum 6-8 risks): Categories (Technical, Operational, Compliance, Business) with probability, impact, mitigation, owner
12. CHANGELOG (minimum 1 entry): Version history

Indian Banking Context - MUST address:
- RBI regulations and compliance requirements
- Digital India initiatives and government programs
- UPI/IMPS/NEFT payment integrations
- KYC/AML/CKYC requirements and procedures
- Core Banking System (CBS) integration
- Digital banking channels (Mobile, Internet Banking)
- Security standards (2FA, encryption, audit trails)
- Data localization and privacy (IT Act, RBI guidelines)`;

  const userPrompt = `Generate a COMPREHENSIVE BRD based on this transcript. Every section must be detailed and complete.

**Context:**
- Client: ${request.clientName}
- Team: ${request.teamName}
- Process Area: ${request.processArea}
- Target System: ${request.targetSystem}
- Template: ${request.template}
- Analysis Depth: ${request.analysisDepth}

**Transcript:**
${request.transcriptContent}

REQUIREMENTS FOR COMPREHENSIVE OUTPUT:

**tableOfContents**: Array with minimum 12 sections (Executive Summary, Functional Requirements, Non-Functional Requirements, Integration Requirements, Business Process Flows, User Interface Requirements, RACI Matrix, Assumptions, Constraints, Risk Management, Changelog, etc.)

**executiveSummary**: 300+ word summary covering: business problem, proposed solution, key stakeholders, expected benefits, implementation timeline, budget overview, strategic alignment

**functionalRequirements**: 8-12 detailed requirements, each with:
- Unique ID (FR-001, FR-002, etc.)
- Clear title
- Detailed description (100+ words explaining what, why, how)
- Priority (Critical/High/Medium/Low)
- Complexity (High/Medium/Low)
- acceptanceCriteria: 8-12 specific, measurable criteria in Given-When-Then format with exact values, error messages, performance metrics
- userStories: 2-3 stories in "As a [specific role], I want [specific goal] so that [specific benefit]" format
- dependencies: Related requirements or systems

**nonFunctionalRequirements**: 6-8 requirements across categories:
- Performance: Response times, throughput (with scalabilityMetrics, usabilityStandards)
- Security: Encryption, authentication, authorization (with securityStandards)
- Scalability: User capacity, transaction volume (with scalabilityMetrics)
- Availability: Uptime requirements, DR (with availabilityRequirements)
- Compliance: RBI/SEBI/IRDAI regulations (with complianceDetails)
- Usability: User experience standards (with usabilityStandards)

**integrationRequirements**: 4-6 integrations with apiSpecifications (endpoints, dataFormats, authentication) and detailed dataFlow steps

**businessProcessFlows**: 3-5 processes, each with processName, currentState description, futureState description, and 6-10 detailed steps (stepNumber, description, actor, decision points)

**userInterfaceRequirements**: 5-8 screens with screenName, description, components array, navigationFlow, accessibility (WCAG 2.1), responsiveness details

**raciMatrix**: 8-12 tasks with specific task names and assigned roles (Responsible, Accountable, Consulted, Informed)

**assumptions**: 8-10 specific assumptions about technology, business processes, user behavior, regulatory environment

**constraints**: 6-8 constraints covering budget limits, timeline restrictions, technical limitations, regulatory requirements

**riskManagement**: 6-8 risks with unique id, category (Technical/Operational/Compliance/Business), detailed description, probability (High/Medium/Low), impact (High/Medium/Low), specific mitigation strategy, and owner role

**changelog**: At least 1 entry with version 1.0, today's date, author, and "Initial BRD creation" changes

Return ONLY valid JSON. Ensure all arrays have the minimum required items with complete, detailed information.`;

  try {
    const responseText = await callLocalLLM(userPrompt, systemPrompt, 0.3);
    const jsonText = extractJsonFromResponse(responseText);
    
    console.log("BRD JSON text length:", jsonText.length);
    
    try {
      const brdContent: BrdContent = JSON.parse(jsonText);
      return brdContent;
    } catch (parseError) {
      console.error("JSON parsing failed, returning minimal BRD structure");
      return createMinimalBrd(request);
    }
  } catch (error: any) {
    console.error("Error generating BRD:", error);
    return createMinimalBrd(request);
  }
}

function createMinimalBrd(request: BrdRequest): BrdContent {
  return {
    tableOfContents: [
      { section: "Executive Summary", pageNumber: 1 },
      { section: "Functional Requirements", pageNumber: 2 },
      { section: "Non-Functional Requirements", pageNumber: 3 }
    ],
    executiveSummary: `Business requirements document generated for ${request.clientName} - ${request.teamName}. Process Area: ${request.processArea}, Target System: ${request.targetSystem}.`,
    functionalRequirements: [
      {
        id: "FR-001",
        title: "Core Functionality",
        description: "Primary system functionality based on transcript requirements",
        priority: "High",
        complexity: "Medium",
        acceptanceCriteria: ["System should meet basic functional requirements"],
        userStories: [{
          role: "User",
          goal: "use the system",
          benefit: "complete business objectives"
        }],
        dependencies: []
      }
    ],
    nonFunctionalRequirements: [
      {
        id: "NFR-001",
        title: "Performance",
        description: "System performance requirements",
        category: "Performance"
      }
    ],
    integrationRequirements: [
      {
        id: "IR-001",
        title: "System Integration",
        description: "Integration requirements",
        dataFlow: []
      }
    ],
    businessProcessFlows: [],
    userInterfaceRequirements: [],
    raciMatrix: [
      {
        task: "Implementation",
        responsible: "Development Team",
        accountable: "Project Manager",
        consulted: "Business Analyst",
        informed: "Stakeholders"
      }
    ],
    assumptions: ["Standard implementation assumptions"],
    constraints: ["Regulatory and budget constraints"],
    riskManagement: [],
    changelog: [
      {
        version: "1.0",
        date: new Date().toISOString().split('T')[0],
        author: "AI Assistant",
        changes: "Initial BRD generation"
      }
    ]
  };
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

    const responseText = await callLocalLLM(prompt);
    
    if (!responseText) {
      throw new Error("No response from AI service");
    }

    const jsonText = extractJsonFromResponse(responseText);
    const activities = JSON.parse(jsonText);
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

    const responseText = await callLocalLLM(prompt);
    
    if (!responseText) {
      throw new Error("No response from AI service");
    }

    const jsonText = extractJsonFromResponse(responseText);
    const testCases = JSON.parse(jsonText);
    return testCases;
  } catch (error: any) {
    console.error("Error generating test cases:", error);
    throw new Error(`Failed to generate test cases: ${error.message}`);
  }
}
