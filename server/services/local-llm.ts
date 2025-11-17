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
  
  console.log(`[LLM] Using endpoint: ${endpoint}, model: ${model}`);

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

// Generate BRD in multiple focused calls for better detail and context management
export async function generateBrd(request: BrdRequest): Promise<BrdContent> {
  console.log("Starting multi-call BRD generation...");
  
  // Full context with complete transcript for each call
  const baseContext = `
**Context:**
- Client: ${request.clientName}
- Team: ${request.teamName}
- Process Area: ${request.processArea}
- Target System: ${request.targetSystem}
- Template: ${request.template}
- Analysis Depth: ${request.analysisDepth}

**Full Transcript:**
${request.transcriptContent}

**Indian Banking Focus:** RBI compliance, UPI/payment systems, KYC/AML, Core Banking integration, Digital India initiatives, data localization.`;

  // Initialize with fallback values for each section
  const brdContent: BrdContent = {
    tableOfContents: [],
    executiveSummary: "",
    functionalRequirements: [],
    nonFunctionalRequirements: [],
    integrationRequirements: [],
    businessProcessFlows: [],
    userInterfaceRequirements: [],
    raciMatrix: [],
    assumptions: [],
    constraints: [],
    riskManagement: [],
    changelog: []
  };

  try {
    // Call 1: Executive Summary & Table of Contents
    try {
      const summaryAndToc = await generateSummaryAndToc(baseContext, request);
      brdContent.tableOfContents = summaryAndToc.tableOfContents || [];
      brdContent.executiveSummary = summaryAndToc.executiveSummary || "";
      console.log("✓ Generated Summary and ToC");
    } catch (error) {
      console.error("Error generating summary/ToC, using fallback:", error);
      brdContent.tableOfContents = [{ section: "Executive Summary", pageNumber: 1 }];
      brdContent.executiveSummary = `BRD for ${request.clientName} - ${request.processArea} on ${request.targetSystem}`;
    }
    
    // Call 2: Functional Requirements
    try {
      brdContent.functionalRequirements = await generateFunctionalRequirements(baseContext, request);
      console.log("✓ Generated Functional Requirements");
    } catch (error) {
      console.error("Error generating functional requirements, using fallback:", error);
      brdContent.functionalRequirements = [{
        id: "FR-001",
        title: "Core Functionality",
        description: "System functionality based on requirements",
        priority: "High",
        complexity: "Medium",
        acceptanceCriteria: ["System meets functional requirements"],
        userStories: [{ role: "User", goal: "use the system", benefit: "achieve objectives" }],
        dependencies: []
      }];
    }
    
    // Call 3: Non-Functional Requirements
    try {
      brdContent.nonFunctionalRequirements = await generateNonFunctionalRequirements(baseContext, request);
      console.log("✓ Generated Non-Functional Requirements");
    } catch (error) {
      console.error("Error generating non-functional requirements, using fallback:", error);
      brdContent.nonFunctionalRequirements = [{
        id: "NFR-001",
        title: "Performance",
        description: "System performance requirements",
        category: "Performance"
      }];
    }
    
    // Call 4: Integration Requirements
    try {
      brdContent.integrationRequirements = await generateIntegrationRequirements(baseContext, request);
      console.log("✓ Generated Integration Requirements");
    } catch (error) {
      console.error("Error generating integration requirements, using fallback:", error);
      brdContent.integrationRequirements = [{
        id: "IR-001",
        title: "System Integration",
        description: "Integration requirements",
        dataFlow: []
      }];
    }
    
    // Call 5: Business Process Flows
    try {
      brdContent.businessProcessFlows = await generateBusinessProcessFlows(baseContext, request);
      console.log("✓ Generated Business Process Flows");
    } catch (error) {
      console.error("Error generating process flows, using fallback:", error);
      brdContent.businessProcessFlows = [];
    }
    
    // Call 6: User Interface Requirements
    try {
      brdContent.userInterfaceRequirements = await generateUIRequirements(baseContext, request);
      console.log("✓ Generated UI Requirements");
    } catch (error) {
      console.error("Error generating UI requirements, using fallback:", error);
      brdContent.userInterfaceRequirements = [];
    }
    
    // Call 7: RACI, Assumptions, Constraints
    try {
      const raciAndMore = await generateRACIAndConstraints(baseContext, request);
      brdContent.raciMatrix = raciAndMore.raciMatrix || [];
      brdContent.assumptions = raciAndMore.assumptions || [];
      brdContent.constraints = raciAndMore.constraints || [];
      console.log("✓ Generated RACI, Assumptions, Constraints");
    } catch (error) {
      console.error("Error generating RACI/assumptions/constraints, using fallback:", error);
      brdContent.raciMatrix = [{
        task: "Implementation",
        responsible: "Development Team",
        accountable: "Project Manager",
        consulted: "Business Analyst",
        informed: "Stakeholders"
      }];
      brdContent.assumptions = ["Standard implementation assumptions"];
      brdContent.constraints = ["Regulatory and budget constraints"];
    }
    
    // Call 8: Risk Management & Changelog
    try {
      const riskAndChangelog = await generateRiskAndChangelog(baseContext, request);
      brdContent.riskManagement = riskAndChangelog.riskManagement || [];
      brdContent.changelog = riskAndChangelog.changelog || [];
      console.log("✓ Generated Risk Management and Changelog");
    } catch (error) {
      console.error("Error generating risk/changelog, using fallback:", error);
      brdContent.riskManagement = [];
      brdContent.changelog = [{
        version: "1.0",
        date: new Date().toISOString().split('T')[0],
        author: "AI Assistant",
        changes: "Initial BRD generation"
      }];
    }
    
    console.log("Multi-call BRD generation completed successfully");
    return brdContent;
    
  } catch (error: any) {
    console.error("Critical error in multi-call BRD generation:", error);
    return createMinimalBrd(request);
  }
}

async function generateSummaryAndToc(baseContext: string, request: BrdRequest) {
  const prompt = `${baseContext}

Generate a comprehensive Table of Contents and Executive Summary for this BRD.

**Table of Contents**: Create an array with minimum 12 sections:
- Executive Summary (page 1)
- Functional Requirements (page 3)
- Non-Functional Requirements (page 8)
- Integration Requirements (page 12)
- Business Process Flows (page 15)
- User Interface Requirements (page 19)
- RACI Matrix (page 23)
- Assumptions (page 25)
- Constraints (page 26)
- Risk Management (page 27)
- Changelog (page 29)
- Appendices (page 30)

**Executive Summary** (300+ words): Write a comprehensive summary covering:
- Business problem and current state challenges
- Proposed solution and approach
- Key stakeholders (internal teams, vendors, regulatory bodies)
- Expected business benefits (efficiency gains, cost savings, compliance)
- Implementation timeline and phases
- Budget overview and resource requirements
- Strategic alignment with Digital India and banking modernization

Focus on ${request.processArea} for ${request.targetSystem}.

Return ONLY valid JSON:
{
  "tableOfContents": [{"section": "string", "pageNumber": number}],
  "executiveSummary": "string (300+ words)"
}`;

  const response = await callLocalLLM(prompt, undefined, 0.3);
  const jsonText = extractJsonFromResponse(response);
  return JSON.parse(jsonText);
}

async function generateFunctionalRequirements(baseContext: string, request: BrdRequest) {
  const prompt = `${baseContext}

Generate 8-12 DETAILED Functional Requirements for ${request.processArea} on ${request.targetSystem}.

Each requirement MUST include:
- **id**: Unique ID (FR-001, FR-002, etc.)
- **title**: Clear, specific title
- **description**: 100+ words explaining WHAT the system must do, WHY it's needed, and HOW it supports business goals
- **priority**: Critical/High/Medium/Low
- **complexity**: High/Medium/Low
- **acceptanceCriteria**: Array of 8-12 specific, measurable criteria in Given-When-Then format. Include exact values, error messages, response times, validation rules.
  Example: "Given a user with valid PAN card, When they submit KYC form, Then system validates PAN format (AAAAA9999A) within 2 seconds and displays specific error 'Invalid PAN format' if validation fails"
- **userStories**: Array of 2-3 detailed stories: "As a [specific role like Branch Manager/Customer/Compliance Officer], I want [specific goal with context], so that [specific measurable benefit]"
- **dependencies**: Array of related requirements, systems (CBS, UPI Gateway), or prerequisites

Focus on Indian banking: RBI compliance, KYC/AML, payment systems (UPI/IMPS/NEFT), digital channels, security (2FA, encryption).

Return ONLY valid JSON array:
[{
  "id": "FR-001",
  "title": "string",
  "description": "string (100+ words)",
  "priority": "string",
  "complexity": "string",
  "acceptanceCriteria": ["Given... When... Then..." (8-12 items)],
  "userStories": [{"role": "string", "goal": "string", "benefit": "string"}],
  "dependencies": ["string"]
}]`;

  const response = await callLocalLLM(prompt, undefined, 0.4);
  const jsonText = extractJsonFromResponse(response);
  return JSON.parse(jsonText);
}

async function generateNonFunctionalRequirements(baseContext: string, request: BrdRequest) {
  const prompt = `${baseContext}

Generate 6-8 DETAILED Non-Functional Requirements across these categories for ${request.targetSystem}:

1. **Performance** (2 requirements): Response times, throughput, transaction processing
2. **Security** (2 requirements): Encryption, authentication, authorization, audit trails
3. **Scalability** (1 requirement): User capacity, transaction volume, growth handling
4. **Availability** (1 requirement): Uptime, disaster recovery, failover
5. **Compliance** (1-2 requirements): RBI/SEBI/IRDAI regulations, data localization
6. **Usability** (1 requirement): User experience, accessibility standards

Each requirement MUST include:
- **id**: NFR-001, NFR-002, etc.
- **title**: Specific title
- **description**: Detailed description (80+ words)
- **category**: Performance/Security/Scalability/Availability/Compliance/Usability
- **scalabilityMetrics** (if Scalability): {concurrentUsers: "string", transactionVolume: "string"}
- **availabilityRequirements** (if Availability): {uptime: "99.9%", disasterRecovery: "string"}
- **securityStandards** (if Security): {encryption: "AES-256", auditTrails: "string", accessControls: "string"}
- **usabilityStandards** (if Usability): {responseTime: "<3 seconds", userExperience: "string"}
- **complianceDetails** (if Compliance): {regulations: ["RBI", "IT Act"], requirements: "string"}

Return ONLY valid JSON array:
[{
  "id": "NFR-001",
  "title": "string",
  "description": "string",
  "category": "string",
  ...additional fields based on category
}]`;

  const response = await callLocalLLM(prompt, undefined, 0.3);
  const jsonText = extractJsonFromResponse(response);
  return JSON.parse(jsonText);
}

async function generateIntegrationRequirements(baseContext: string, request: BrdRequest) {
  const prompt = `${baseContext}

Generate 4-6 DETAILED Integration Requirements for ${request.targetSystem}.

Common integrations for Indian banking:
- Core Banking System (CBS)
- UPI Gateway / NPCI
- Payment Gateway (IMPS/NEFT/RTGS)
- KYC/CKYC verification systems
- Credit Bureau (CIBIL/Experian)
- SMS/Email notification services

Each integration MUST include:
- **id**: IR-001, IR-002, etc.
- **title**: Clear integration name
- **description**: Detailed description (80+ words) of what data is exchanged and why
- **apiSpecifications**: {
    endpoints: "List of API endpoints with methods (GET /api/v1/kyc, POST /api/v1/transaction)",
    dataFormats: "JSON/XML/SOAP with sample structure",
    authentication: "OAuth 2.0/API Key/mTLS with specific details"
  }
- **dataFlow**: Array of 5-8 detailed steps describing the complete data flow
  Example: ["Step 1: User submits loan application via mobile app", "Step 2: System validates input and calls CBS API...", etc.]

Return ONLY valid JSON array:
[{
  "id": "IR-001",
  "title": "string",
  "description": "string",
  "apiSpecifications": {
    "endpoints": "string",
    "dataFormats": "string",
    "authentication": "string"
  },
  "dataFlow": ["string (5-8 steps)"]
}]`;

  const response = await callLocalLLM(prompt, undefined, 0.3);
  const jsonText = extractJsonFromResponse(response);
  return JSON.parse(jsonText);
}

async function generateBusinessProcessFlows(baseContext: string, request: BrdRequest) {
  const prompt = `${baseContext}

Generate 3-5 DETAILED Business Process Flows for ${request.processArea}.

Each process flow MUST include:
- **id**: BP-001, BP-002, etc.
- **processName**: Specific process name
- **currentState**: Detailed description (100+ words) of how the process works today (manual, legacy system)
- **futureState**: Detailed description (100+ words) of how it will work after implementation (automated, digital)
- **steps**: Array of 6-10 detailed steps, each with:
  - stepNumber: Sequential number
  - description: Detailed action description
  - actor: Who performs this (Customer, Branch Staff, System, Compliance Officer)
  - decision: (optional) Decision point if applicable

Example processes:
- Customer onboarding with KYC
- Loan application and approval
- Account opening workflow
- Payment processing flow
- Compliance verification process

Return ONLY valid JSON array:
[{
  "id": "BP-001",
  "processName": "string",
  "currentState": "string (100+ words)",
  "futureState": "string (100+ words)",
  "steps": [{
    "stepNumber": 1,
    "description": "string",
    "actor": "string",
    "decision": "string (optional)"
  }]
}]`;

  const response = await callLocalLLM(prompt, undefined, 0.3);
  const jsonText = extractJsonFromResponse(response);
  return JSON.parse(jsonText);
}

async function generateUIRequirements(baseContext: string, request: BrdRequest) {
  const prompt = `${baseContext}

Generate 5-8 DETAILED User Interface Requirements for ${request.targetSystem}.

Each UI requirement MUST include:
- **id**: UI-001, UI-002, etc.
- **screenName**: Specific screen name (Dashboard, Application Form, Verification Screen, etc.)
- **description**: Detailed description (80+ words) of screen purpose and functionality
- **components**: Array of UI components (Login form, OTP input, Document upload, Account summary cards, Transaction table, etc.)
- **navigationFlow**: Detailed description of how users navigate to/from this screen
- **accessibility**: WCAG 2.1 compliance details (keyboard navigation, screen reader support, color contrast ratio, etc.)
- **responsiveness**: Multi-device support details (Desktop 1920px, Tablet 768px, Mobile 375px, specific responsive behaviors)

Focus on digital banking channels (mobile app, internet banking, branch portal).

Return ONLY valid JSON array:
[{
  "id": "UI-001",
  "screenName": "string",
  "description": "string (80+ words)",
  "components": ["string (5-8 components)"],
  "navigationFlow": "string",
  "accessibility": "string",
  "responsiveness": "string"
}]`;

  const response = await callLocalLLM(prompt, undefined, 0.3);
  const jsonText = extractJsonFromResponse(response);
  return JSON.parse(jsonText);
}

async function generateRACIAndConstraints(baseContext: string, request: BrdRequest) {
  const prompt = `${baseContext}

Generate:

1. **RACI Matrix** (8-12 tasks): Detailed responsibility assignments for:
   - Requirements gathering
   - System design and architecture  
   - Development and coding
   - Integration and APIs
   - Testing (UAT, SIT, Performance)
   - Training and documentation
   - Deployment and go-live
   - Post-production support
   - Compliance validation
   - Security audit

2. **Assumptions** (8-10 items): Specific assumptions about:
   - Technology availability and compatibility
   - User training and adoption
   - Data quality and migration
   - Third-party service availability
   - Regulatory approval timelines
   - Budget and resource allocation
   - Network infrastructure
   - Vendor support

3. **Constraints** (6-8 items): Detailed constraints covering:
   - Budget limitations (specific amounts if possible)
   - Timeline restrictions (go-live dates, regulatory deadlines)
   - Technical limitations (legacy system compatibility, infrastructure)
   - Regulatory requirements (RBI guidelines, data localization)
   - Resource constraints (team size, skill availability)
   - Vendor dependencies

Return ONLY valid JSON:
{
  "raciMatrix": [{
    "task": "string (specific task)",
    "responsible": "string (role)",
    "accountable": "string (role)",
    "consulted": "string (role)",
    "informed": "string (role)"
  }],
  "assumptions": ["string (8-10 detailed items)"],
  "constraints": ["string (6-8 detailed items)"]
}`;

  const response = await callLocalLLM(prompt, undefined, 0.3);
  const jsonText = extractJsonFromResponse(response);
  return JSON.parse(jsonText);
}

async function generateRiskAndChangelog(baseContext: string, request: BrdRequest) {
  const prompt = `${baseContext}

Generate:

1. **Risk Management** (6-8 risks) across categories:
   - **Technical**: System integration failures, data migration issues, performance bottlenecks
   - **Operational**: User adoption challenges, training gaps, process disruptions
   - **Compliance**: Regulatory violations, audit failures, data privacy breaches
   - **Business**: Budget overruns, timeline delays, scope creep

Each risk MUST include:
- **id**: RISK-001, RISK-002, etc.
- **category**: Technical/Operational/Compliance/Business
- **description**: Detailed risk description (60+ words)
- **probability**: High/Medium/Low (with reasoning)
- **impact**: High/Medium/Low (with specific consequences)
- **mitigation**: Detailed mitigation strategy
- **owner**: Specific role responsible for managing this risk

2. **Changelog**: Initial entry with version 1.0, today's date, and initial creation details

Return ONLY valid JSON:
{
  "riskManagement": [{
    "id": "RISK-001",
    "category": "string",
    "description": "string (60+ words)",
    "probability": "string",
    "impact": "string",
    "mitigation": "string",
    "owner": "string"
  }],
  "changelog": [{
    "version": "1.0",
    "date": "${new Date().toISOString().split('T')[0]}",
    "author": "AI-Generated BRD",
    "changes": "Initial BRD creation for ${request.processArea} on ${request.targetSystem}"
  }]
}`;

  const response = await callLocalLLM(prompt, undefined, 0.3);
  const jsonText = extractJsonFromResponse(response);
  return JSON.parse(jsonText);
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
