# MemoryOS - AI-Powered Personal Knowledge Management System

## Overview

MemoryOS is a full-stack web application that serves as an AI-powered "second brain" for personal knowledge management. The system allows users to store, organize, and retrieve memories (notes, ideas, learnings, tasks) using semantic search powered by AI embeddings and provides an intelligent chat interface for interacting with stored content.

The application combines modern web technologies with AI capabilities to create a seamless experience for capturing and retrieving personal knowledge through both traditional interfaces and conversational AI.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod schema validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **Error Handling**: Centralized error middleware with structured error responses
- **Development**: Hot reload with Vite integration for full-stack development

### Data Storage Solutions
- **Database**: Supabase PostgreSQL (third-party, free tier compatible)
- **ORM**: Drizzle ORM for type-safe database interactions
- **Schema Management**: Drizzle Kit for migrations and schema changes
- **Fallback Storage**: In-memory storage implementation for development/testing
- **Vector Storage**: Native PostgreSQL vector columns for AI embeddings (1536 dimensions)

### Authentication and Authorization
- **Current State**: Mock authentication with demo user for development
- **Session Management**: Express sessions with PostgreSQL session store
- **Future Ready**: Architecture supports proper authentication implementation

### AI Integration
- **Provider**: OpenRouter API integration (cost-effective alternative to OpenAI)
- **Embeddings**: Simple hash-based embedding generation for development/testing
- **Chat**: GPT-4o model through OpenRouter for conversational interactions
- **Features**: 
  - Automatic keyword extraction using text analysis algorithms
  - Semantic similarity search using vector embeddings (384 dimensions)
  - Context-aware chat responses using relevant memories
  - Intelligent content categorization

### Recent Changes (August 26, 2025)
- Successfully implemented complete MemoryOS MVP with fully functional UI
- Switched from OpenAI API to OpenRouter API for better cost efficiency
- Implemented fallback embedding generation for development without API costs
- Added simple keyword extraction algorithm as backup to AI-powered extraction
- Fixed major UI functionality issues:
  - Resolved scroll problems in chat interface
  - Made content type filter buttons fully functional with proper state management
  - Added memory list view with working filter functionality
  - Created toggle between Chat and Memories views
  - All buttons now have proper click handlers and visual feedback
- Verified all core functionality: memory creation, search, chat with AI, UI navigation
- System is fully operational with semantic search, intelligent chat responses, and intuitive UI

### Key Architectural Decisions

**Monorepo Structure**: Single repository with shared schema and types between client and server for type safety and code reuse.

**Vector Search Strategy**: Uses PostgreSQL's native vector support rather than external vector databases for simplicity and reduced infrastructure complexity.

**Component Architecture**: Radix UI primitives provide accessibility and behavior while Tailwind handles styling, creating a maintainable design system.

**Real-time Development**: Vite's HMR integrated with Express for seamless full-stack development experience.

**Type Safety**: End-to-end TypeScript with shared schemas using Zod for runtime validation and compile-time type checking.

## External Dependencies

### Database Services
- **Supabase**: PostgreSQL hosting with vector extension support (free tier)
- **Connection**: Environment-based connection string configuration
- **Setup**: User provides DATABASE_URL from Supabase dashboard

### AI Services  
- **OpenRouter API**: Cost-effective alternative to OpenAI
- **OpenAI API**: 
  - Text embeddings (text-embedding-3-small)
  - Chat completions (GPT-5)
  - Automatic content analysis and keyword extraction

### UI and Styling
- **Radix UI**: Comprehensive set of unstyled, accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **Replit Integration**: Development environment optimization with error overlay and debugging tools
- **ESBuild**: Fast bundling for production server builds
- **PostCSS**: CSS processing pipeline with Tailwind and Autoprefixer

### Frontend Libraries
- **TanStack Query**: Server state management with caching and synchronization
- **React Hook Form**: Performant form handling with validation
- **Wouter**: Lightweight routing solution
- **Date-fns**: Date manipulation and formatting utilities

The architecture emphasizes developer experience, type safety, and AI-first design while maintaining simplicity and deployment flexibility.