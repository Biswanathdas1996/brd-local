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
- Specific and measurable with comprehensive acceptance criteria
- Include detailed user stories in "As a [role], I want [goal] so that [benefit]" format
- Technically feasible with proper dependencies identified
- Compliant with Indian banking regulations (RBI, SEBI, IRDAI)
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

Please provide a comprehensive response in JSON format with all sections: tableOfContents, executiveSummary, functionalRequirements (with id, title, description, priority, complexity, acceptanceCriteria array, userStories array, dependencies array), nonFunctionalRequirements, integrationRequirements, businessProcessFlows, userInterfaceRequirements, raciMatrix, assumptions, constraints, riskManagement, and changelog.`;

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
