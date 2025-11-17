# LLM Services Documentation - BRD Generator Application

## Overview

This document outlines the Large Language Model (LLM) services integrated into the BRD Generator application for Indian banking advisory consultants. The application leverages AI to convert call transcripts into structured Business Requirements Documents.

## Primary LLM Service

### Local LLM Service (Gemma3)

**Service Provider**: Local LLM Endpoint  
**Model**: Configurable (default: `gemma3:latest`)  
**Integration Location**: `server/services/local-llm.ts`  
**API Endpoint**: Configurable via `LLM_ENDPOINT` environment variable (default: `http://192.168.1.10:8000/generate`)  
**Authentication**: None required for local endpoint

#### Key Features Used:
- **Text Analysis**: Processes call transcripts and extracts business requirements
- **Structured Output**: Generates JSON-formatted responses with predefined schemas
- **Context Awareness**: Maintains banking domain knowledge and Indian regulatory context
- **Multi-turn Conversations**: Supports requirement enhancement and refinement

#### Configuration:
- **LLM_ENDPOINT**: Custom endpoint URL (default: http://192.168.1.10:8000/generate)
- **LLM_MODEL**: Model name to use (default: gemma3:latest)
- **Temperature**: Configurable per request (default: 0.7 for general tasks, 0.3 for BRD generation)

## LLM Service Functions

### 1. BRD Generation (`generateBrd`)

**Purpose**: Converts raw call transcripts into comprehensive Business Requirements Documents

**Input Parameters**:
```typescript
interface BrdRequest {
  transcriptContent: string;
  processArea: string;
  targetSystem: string;
  template: string;
  analysisDepth: string;
  clientName: string;
  teamName: string;
}
```

**Output Structure**:
```typescript
interface BrdContent {
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
  }>;
  integrationRequirements: Array<{
    id: string;
    title: string;
    description: string;
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
```

**Specialized Prompting**:
- Indian banking context focus (RBI compliance, UPI, KYC/AML)
- Technical system integration requirements
- Regulatory reporting considerations
- Digital banking transformation elements

### 2. Requirement Enhancement (`generateRequirementEnhancements`)

**Purpose**: Analyzes individual functional requirements and provides AI-powered improvement suggestions

**Input Parameters**:
- Current requirement object
- Context (process area, target system)

**Output Structure**:
```typescript
{
  suggestions: string[];
  enhancedRequirement: {
    id: string;
    title: string;
    description: string;
    priority: string;
    complexity: string;
  }
}
```

**Enhancement Focus Areas**:
- Clarity and specificity improvements
- Measurable acceptance criteria
- Technical feasibility validation
- RBI regulatory compliance
- User experience optimization
- Security considerations
- Performance requirements

### 3. Implementation Activities Generation (`generateImplementationActivities`)

**Purpose**: Converts BRD content into actionable implementation plans tailored to the target system

**Output Structure**:
```typescript
{
  configurationActivities: Array<{
    title: string;
    description: string;
    effort: string;
    skillsRequired: string[];
  }>;
  developmentActivities: Array<{
    title: string;
    description: string;
    effort: string;
    skillsRequired: string[];
  }>;
  integrationActivities: Array<{
    title: string;
    description: string;
    effort: string;
    skillsRequired: string[];
  }>;
}
```

### 4. Test Case Generation (`generateTestCases`)

**Purpose**: Creates comprehensive test cases from BRD content

**Output Structure**:
```typescript
{
  functionalTests: Array<{
    id: string;
    title: string;
    description: string;
    priority: string;
    preconditions: string;
    testSteps: string[];
    expectedResult: string;
  }>;
  integrationTests: Array<{
    id: string;
    title: string;
    description: string;
    priority: string;
    preconditions: string;
    testSteps: string[];
    expectedResult: string;
  }>;
  performanceTests: Array<{
    id: string;
    title: string;
    description: string;
    loadConditions: string;
    acceptanceCriteria: string;
  }>;
}
```

## API Integration Details

### Configuration

**Environment Variables**:
```bash
LLM_ENDPOINT=http://192.168.1.10:8000/generate  # Optional, defaults to this value
LLM_MODEL=gemma3:latest  # Optional, defaults to gemma3:latest
```

**API Request Format**:
```typescript
{
  model: string;        // e.g., "gemma3:latest"
  prompt: string;       // Combined system + user prompt
  temperature: number;  // 0.0 to 1.0
}
```

**API Response Format**:
```typescript
{
  response?: string;  // Primary response field
  text?: string;      // Alternative response field
  content?: string;   // Alternative response field
}
```

### Error Handling

**Common Error Scenarios**:
1. **Endpoint Unreachable**: Connection to local LLM service failed
2. **Invalid Response**: No valid response from LLM
3. **JSON Parsing**: Issues extracting JSON from LLM response
4. **Timeout**: LLM taking too long to respond

**Error Response Format**:
```typescript
{
  message: string;
  error?: string;
}
```

### Request Patterns

**System Prompts**: Consistent role-based prompting for banking domain expertise
**User Prompts**: Context-rich prompts including:
- Client and team information
- Process area specification
- Target system details
- Transcript content
- Template preferences

## Indian Banking Context Specialization

### Domain-Specific Knowledge Areas:

1. **Regulatory Compliance**:
   - Reserve Bank of India (RBI) guidelines
   - Know Your Customer (KYC) requirements
   - Anti-Money Laundering (AML) processes
   - Digital banking regulations

2. **Banking Systems**:
   - Core banking platforms (Finacle, T24, etc.)
   - Payment systems (UPI, RTGS, NEFT)
   - Digital banking solutions
   - Integration architectures

3. **Process Areas**:
   - Account opening and management
   - Loan processing and origination
   - Customer onboarding
   - Payment processing
   - Risk management
   - Treasury operations
   - Trade finance

## Performance Considerations

### Response Times:
- **BRD Generation**: Varies by LLM speed and transcript length
- **Requirement Enhancement**: Varies by LLM speed
- **Concurrent Requests**: Handled asynchronously

### Optimization:
- Structured prompts to minimize processing time
- Focused context provision
- Efficient JSON parsing and validation

## Security and Privacy

### Data Handling:
- **API Communications**: HTTP to local endpoint (consider HTTPS for production)
- **Transcript Data**: Processed and sent to local LLM
- **Generated Content**: Stored locally in PostgreSQL database
- **No External Services**: All processing remains on local infrastructure

### Compliance Considerations:
- Banking data sensitivity awareness
- Regulatory reporting capability
- Audit trail maintenance through changelog functionality

## Future Enhancements

### Potential Improvements:
1. **HTTPS Support**: Add SSL/TLS for secure communication
2. **Model Selection**: Support multiple models with dynamic selection
3. **Streaming Responses**: Real-time streaming for faster user feedback
4. **Advanced Analytics**: Requirement quality scoring and validation
5. **Multi-Language Support**: Hindi and regional language processing capabilities

## Monitoring and Maintenance

### Key Metrics:
- API response times
- Success/failure rates
- User satisfaction with generated content

### Maintenance Tasks:
- Model updates and version management
- Prompt optimization based on user feedback
- Performance monitoring and optimization

---

**Document Version**: 2.0  
**Last Updated**: November 17, 2025  
**Maintained By**: BRD Generator Development Team
