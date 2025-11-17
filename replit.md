# BRD Generator

## Overview

This is a Business Requirements Document (BRD) generator application built for Indian banking advisory consultants. The application converts call transcripts into structured BRDs using AI technology, specifically leveraging a local Gemma3 LLM. It features a full-stack architecture with a React frontend and Express.js backend, designed to streamline the process of creating professional business requirements documentation for Indian banking systems and regulatory compliance.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom PwC-themed color scheme
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API architecture
- **File Processing**: Multer for file uploads with support for .txt, .pdf, and .docx files
- **AI Integration**: Local Gemma3 LLM for BRD content generation

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM and Neon serverless support
- **Schema Management**: Drizzle Kit for migrations and schema updates
- **Storage Strategy**: Full database persistence with Drizzle ORM
- **File Storage**: Local file system for uploaded transcripts
- **Connection**: Serverless PostgreSQL with WebSocket support

## Key Components

### Database Schema
- **Clients**: Store client information (name, industry)
- **Teams**: Organize teams by client with focus areas
- **Transcripts**: Store uploaded transcript files and content
- **BRDs**: Generated business requirements documents with status tracking

### Core Services
- **File Processor**: Handles transcript file uploads and content extraction
- **Local LLM Service**: Integrates with local Gemma3 model for BRD generation
- **Storage Layer**: Abstracted storage interface supporting both memory and database implementations

### Frontend Components
- **BRD Generator**: Main application interface with multi-step form
- **File Upload**: Drag-and-drop file upload with sample transcript options
- **BRD Display**: Structured presentation of generated BRD content
- **UI Components**: Comprehensive shadcn/ui component library

## Data Flow

1. **File Upload**: Users upload transcript files (.txt, .pdf, .docx)
2. **Content Extraction**: Backend processes files and extracts text content
3. **Configuration**: Users select client, team, process area, and target system
4. **AI Processing**: Transcript content is sent to local LLM service for BRD generation
5. **Result Storage**: Generated BRDs are stored with status tracking
6. **Display**: Structured BRD content is presented to users with export options

## External Dependencies

### AI Services
- **Local LLM Service**: Local Gemma3 model for BRD generation and requirement enhancement
- **Model**: Configurable (default: gemma3:latest)
- **Endpoint**: Configurable via LLM_ENDPOINT environment variable (default: http://192.168.1.10:8000/generate)
- **Functions**: BRD generation from transcripts, functional requirement enhancement, implementation activities, test case generation
- **Configuration**: Environment variable-based endpoint and model configuration (LLM_ENDPOINT, LLM_MODEL)
- **Security**: Local processing, no external API dependencies
- **Documentation**: Comprehensive LLM services documentation available in LLM_Services_Documentation.md

### Database
- **PostgreSQL**: Primary database with Neon serverless support
- **Connection**: Environment variable-based database URL configuration

### Development Tools
- **Replit Integration**: Configured for Replit development environment
- **Cartographer**: Development-time code mapping tool

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20 with PostgreSQL 16
- **Development Server**: Vite dev server with HMR on port 5000
- **Database**: Managed PostgreSQL instance

### Production Build
- **Frontend**: Vite production build with static asset optimization
- **Backend**: ESBuild bundling for Node.js deployment
- **Deployment**: Autoscale deployment target with build and start scripts

### Environment Configuration
- **Database**: `DATABASE_URL` environment variable required
- **AI Service**: `LLM_ENDPOINT` (optional, defaults to http://192.168.1.10:8000/generate) and `LLM_MODEL` (optional, defaults to gemma3:latest)
- **File Uploads**: Local uploads directory with 10MB size limit

## Recent Changes

November 17, 2025:
- **LLM Service Migration**: Replaced PwC GenAI integration with local LLM service
  - **New Service**: Local Gemma3 model integration via configurable endpoint
  - **Endpoint**: Configurable via LLM_ENDPOINT environment variable (default: http://192.168.1.10:8000/generate)
  - **Model**: Configurable via LLM_MODEL environment variable (default: gemma3:latest)
  - **API Format**: Simplified request/response format with model, prompt, and temperature parameters
  - **No Authentication**: Direct local access without API key requirements
  - **Updated Documentation**: Comprehensive updates to LLM_Services_Documentation.md
  - **Service File**: New local-llm.ts service replacing pwc-genai.ts
  - **Maintained Features**: All existing AI capabilities preserved (BRD generation, requirement enhancement, implementation activities, test cases)

July 17, 2025:
- **Enhanced Acceptance Criteria Display**: Completely revamped acceptance criteria visualization with highly detailed formatting
  - **Advanced Given-When-Then Parsing**: Robust regex-based parsing to handle complex, granular acceptance criteria
  - **Premium Visual Design**: Each criterion in individual cards with gradient numbering, shadows, and hover effects
  - **Detailed Color-Coded Structure**: Enhanced blue borders for Given (preconditions), purple for When (triggers), green for Then (outcomes)
  - **Professional Layout**: Improved spacing, typography, and visual hierarchy for better readability of longer, detailed criteria
  - **Comprehensive Format Guide**: Enhanced legend with detailed explanations of Given-When-Then methodology
  - **Granular Count Display**: Shows total criteria count with emphasis on detailed testing conditions
- **Advanced AI Prompt Engineering**: Enhanced BRD generation to produce 8-12 highly granular, detailed acceptance criteria featuring:
  - **Specific Data Values**: Exact inputs, outputs, user roles, system states, and quantifiable metrics
  - **Measurable Performance Criteria**: Response times, load conditions, and specific thresholds
  - **Detailed Error Scenarios**: Exact error messages, validation rules, and edge cases
  - **Comprehensive Security Flows**: Authentication scenarios with specific user roles and security checks
  - **Integration Test Cases**: Specific system responses and integration failure handling
  - **UI/UX Specifications**: Precise visual feedback, layout requirements, and responsive design criteria
  - **Regulatory Compliance**: Specific RBI/KYC validation requirements and audit trail specifications

June 27, 2025:
- **Major BRD Enhancement Update**: Comprehensive expansion of BRD generation capabilities
  - **Enhanced Functional Requirements**: Added acceptance criteria, user stories ("As a [role], I want [goal] so that [benefit]"), and dependency tracking
  - **Expanded Non-Functional Requirements**: Added detailed categorization with scalability metrics, availability requirements, security standards, usability standards, and specific compliance details for RBI/SEBI/IRDAI regulations
  - **Detailed Integration Requirements**: Enhanced with API specifications (endpoints, data formats, authentication) and step-by-step data flow diagrams
  - **New Business Process Flows Section**: Current state vs future state workflows with detailed step-by-step processes and decision trees
  - **New User Interface Requirements Section**: Screen specifications, component details, navigation flows, accessibility standards (WCAG 2.1), and responsive design requirements
  - **Enhanced Risk Management**: Replaced simple risk mitigation with comprehensive risk categories (Technical, Operational, Compliance, Business), probability/impact assessment, and specific risk ownership
  - **Updated TypeScript Interfaces**: Comprehensive BrdContent interface supporting all enhanced fields and nested structures
  - **Enhanced Frontend Display**: Rich UI components showing all new sections with color-coded categories, structured layouts, and detailed breakdowns
- **Tabbed Interface Implementation**: Added comprehensive three-tab system for enhanced BRD workflow
  - **BRD Document Tab**: Enhanced display of complete business requirements with all new sections
  - **Implementation Activities Tab**: AI-powered conversion of BRD to target-system-specific implementation tasks (Configuration, Development, Integration activities)
  - **Test Cases Tab**: AI-powered generation of comprehensive test scenarios (Functional, Integration, Performance tests)
  - **Dynamic Content Generation**: On-demand AI generation for implementation and test content with loading states and error handling
  - **Backend API Integration**: New endpoints for generating implementation activities and test cases using PwC GenAI service
- Enhanced BRD generation with Table of Contents, RACI Matrix, and Changelog sections
- Added Salesforce Financial Services Cloud, Microsoft Dynamics 365, and Custom Application Development to target systems
- Implemented inline editing functionality for functional requirements with save/cancel operations
- Added AI-powered requirement enhancement suggestions with apply enhanced version feature
- Fixed download format to generate proper Word documents (.docx) instead of markdown files
- Fixed save function for functional requirements enhancement feature
- Added BRD delete functionality with confirmation dialogs and proper error handling
- **Refactored LLM integration**: Migrated from external API to PwC's internal GenAI shared service
- Updated all AI service calls to use PwC's secure infrastructure (genai-sharedservice-americas.pwc.com)
- Enhanced security and compliance by keeping all data processing within PwC's controlled environment
- Updated comprehensive LLM Services Documentation for PwC GenAI integration
- Improved requirement update API with better error handling and content parsing
- Added query invalidation for real-time BRD data refresh after edits

June 24, 2025:
- Initial BRD Generator application setup
- Added client and team hierarchy management
- Implemented file upload with .txt, .pdf, .docx support
- Created sample transcript files for testing
- Integrated AI API for BRD generation
- Added team creation functionality to resolve empty dropdown issue
- Fixed TypeScript errors and HTML validation warnings
- Migrated from in-memory storage to PostgreSQL database
- Added database seeding with sample clients and teams
- Implemented full CRUD operations with Drizzle ORM
- Adapted application for Indian banking context with authentic bank names
- Updated process areas and target systems for Indian banking requirements
- Added comprehensive Indian banking teams across major banks

## User Preferences

Preferred communication style: Simple, everyday language.