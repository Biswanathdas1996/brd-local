# LLM Services Documentation - BRD Generator Application

## Overview

This document outlines the Large Language Model (LLM) services integrated into the BRD Generator application for Indian banking advisory consultants. The application leverages AI to convert call transcripts into structured Business Requirements Documents.

## Primary LLM Service

### Anthropic Claude API

**Service Provider**: Anthropic  
**Model**: `claude-sonnet-4-20250514` (Claude 4.0 Sonnet)  
**Integration Location**: `server/services/anthropic.ts`  
**Authentication**: API Key-based authentication via `ANTHROPIC_API_KEY` environment variable

#### Key Features Used:
- **Text Analysis**: Processes call transcripts and extracts business requirements
- **Structured Output**: Generates JSON-formatted responses with predefined schemas
- **Context Awareness**: Maintains banking domain knowledge and Indian regulatory context
- **Multi-turn Conversations**: Supports requirement enhancement and refinement

#### Token Limits:
- **BRD Generation**: 4,000 tokens max output
- **Requirement Enhancement**: 2,000 tokens max output
- **Input Processing**: Handles extensive transcript content (varies by model limits)

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

## API Integration Details

### Configuration

**Environment Variables Required**:
```bash
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

**SDK Integration**:
```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
```

### Error Handling

**Common Error Scenarios**:
1. **API Key Missing/Invalid**: Application fails to start, requires environment configuration
2. **Rate Limiting**: Anthropic API rate limits handled with proper error responses
3. **Content Parsing**: JSON extraction from Claude responses with fallback handling
4. **Token Limits**: Large transcripts may exceed input limits

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
- **BRD Generation**: ~20-45 seconds (varies by transcript length)
- **Requirement Enhancement**: ~10-25 seconds
- **Concurrent Requests**: Handled asynchronously with proper queuing

### Cost Optimization:
- Structured prompts to minimize token usage
- Focused context provision
- Efficient JSON parsing and validation

## Security and Privacy

### Data Handling:
- **API Communications**: HTTPS-encrypted
- **Transcript Data**: Processed in-memory, not permanently stored by LLM service
- **Generated Content**: Stored locally in PostgreSQL database
- **API Keys**: Environment variable-based secure storage

### Compliance Considerations:
- Banking data sensitivity awareness
- Regulatory reporting capability
- Audit trail maintenance through changelog functionality

## Future Enhancements

### Potential Improvements:
1. **Multi-Model Support**: Integration with additional LLM providers for redundancy
2. **Fine-Tuning**: Custom model training on banking-specific datasets
3. **Real-Time Processing**: Streaming responses for faster user feedback
4. **Advanced Analytics**: Requirement quality scoring and validation
5. **Multi-Language Support**: Hindi and regional language processing capabilities

## Monitoring and Maintenance

### Key Metrics:
- API response times
- Success/failure rates
- Token usage patterns
- User satisfaction with generated content

### Maintenance Tasks:
- Regular API key rotation
- Model version updates
- Prompt optimization based on user feedback
- Performance monitoring and optimization

## Usage Statistics

**Current Implementation**:
- **Active Endpoints**: 2 (BRD generation, requirement enhancement)
- **Supported Languages**: English (primary), banking terminology in Hindi
- **Target Systems**: 16 supported banking platforms
- **Process Areas**: 9 specialized banking domains
- **Template Formats**: 4 BRD template variations

---

**Document Version**: 1.0  
**Last Updated**: June 27, 2025  
**Maintained By**: BRD Generator Development Team