# BRD Generator

## Overview

This is a Business Requirements Document (BRD) generator application built for Indian banking advisory consultants. The application converts call transcripts into structured BRDs using AI technology, specifically leveraging Anthropic's Claude API. It features a full-stack architecture with a React frontend and Express.js backend, designed to streamline the process of creating professional business requirements documentation for Indian banking systems and regulatory compliance.

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
- **AI Integration**: Anthropic Claude API for BRD content generation

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
- **Anthropic Service**: Integrates with Claude API for BRD generation
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
4. **AI Processing**: Transcript content is sent to PwC GenAI service for BRD generation
5. **Result Storage**: Generated BRDs are stored with status tracking
6. **Display**: Structured BRD content is presented to users with export options

## External Dependencies

### AI Services
- **PwC GenAI Shared Service**: Internal AI service for BRD generation and requirement enhancement
- **Model**: bedrock.anthropic.claude-sonnet-4 (Claude 4.0 Sonnet via AWS Bedrock)
- **Endpoint**: https://genai-sharedservice-americas.pwc.com/completions
- **Functions**: BRD generation from transcripts, functional requirement enhancement suggestions
- **API Key Management**: Environment variable-based configuration (PWC_GENAI_API_KEY)
- **Security**: All processing within PwC's controlled infrastructure
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
- **AI Service**: `PWC_GENAI_API_KEY` environment variable required
- **File Uploads**: Local uploads directory with 10MB size limit

## Recent Changes

June 27, 2025:
- Enhanced BRD generation with Table of Contents, RACI Matrix, and Changelog sections
- Added Salesforce Financial Services Cloud, Microsoft Dynamics 365, and Custom Application Development to target systems
- Implemented inline editing functionality for functional requirements with save/cancel operations
- Added AI-powered requirement enhancement suggestions with apply enhanced version feature
- Fixed download format to generate proper Word documents (.docx) instead of markdown files
- **Refactored LLM integration**: Migrated from external Anthropic API to PwC's internal GenAI shared service
- Updated all AI service calls to use PwC's secure infrastructure (genai-sharedservice-americas.pwc.com)
- Enhanced security and compliance by keeping all data processing within PwC's controlled environment
- Updated comprehensive LLM Services Documentation for new PwC GenAI integration
- Improved requirement update API with better error handling and content parsing
- Added query invalidation for real-time BRD data refresh after edits

June 24, 2025:
- Initial BRD Generator application setup
- Added client and team hierarchy management
- Implemented file upload with .txt, .pdf, .docx support
- Created sample transcript files for testing
- Integrated Anthropic Claude API for BRD generation
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