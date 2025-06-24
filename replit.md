# BRD Generator

## Overview

This is a Business Requirements Document (BRD) generator application built for PwC Financial Services Advisory consultants. The application converts call transcripts into structured BRDs using AI technology, specifically leveraging Anthropic's Claude API. It features a full-stack architecture with a React frontend and Express.js backend, designed to streamline the process of creating professional business requirements documentation.

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
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Management**: Drizzle Kit for migrations
- **Storage Strategy**: In-memory storage implementation with fallback to database
- **File Storage**: Local file system for uploaded transcripts

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
4. **AI Processing**: Transcript content is sent to Anthropic Claude for BRD generation
5. **Result Storage**: Generated BRDs are stored with status tracking
6. **Display**: Structured BRD content is presented to users with export options

## External Dependencies

### AI Services
- **Anthropic Claude API**: Primary AI service for BRD generation using claude-sonnet-4-20250514 model
- **API Key Management**: Environment variable-based configuration

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
- **AI Service**: `ANTHROPIC_API_KEY` environment variable required
- **File Uploads**: Local uploads directory with 10MB size limit

## Changelog

Changelog:
- June 24, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.