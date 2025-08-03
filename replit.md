# Maritime Safety Management System

## Overview

This is a comprehensive Maritime Safety Management System (SMS) designed for fleet management with ship-based and office-based user roles. The system provides centralized management of certificates, document workflows, form submissions, KPI tracking, and compliance monitoring across multiple vessels. Built as a full-stack application with real-time synchronization capabilities for offline/online operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom maritime theme colors and CSS variables
- **State Management**: TanStack React Query for server state management and data fetching
- **Routing**: Wouter for lightweight client-side routing
- **Data Visualization**: Recharts for KPI dashboards and analytics

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Authentication**: Passport.js with local strategy and session-based authentication
- **Session Management**: Express sessions with PostgreSQL session store
- **API Design**: RESTful API with role-based access control middleware

### Database Design
- **Primary Database**: PostgreSQL with Drizzle ORM
- **Connection**: Neon serverless PostgreSQL via connection pooling
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Key Entities**: Users, Ships, Certificates, Forms, Form Submissions, Notifications, Manuals, KPIs, and Audit Logs

### Role-Based Access Control
- **Ship Personnel**: Ship Captain and Ship Crew with vessel-specific access
- **Office Personnel**: DPA (Designated Person Ashore), Superintendent, and Operators with fleet-wide permissions
- **Permission Levels**: Create, read, update, delete, and approve permissions based on user roles

### Core Features Architecture
- **Document Management**: Form builder with recurring and one-time form types, custom field support, and approval workflows
- **Certificate Tracking**: Expiration monitoring with automated notifications
- **KPI System**: 15 predefined KPIs with data collection from form submissions
- **Notification System**: Priority-based notifications for deadlines, expirations, and approvals
- **Audit Logging**: Comprehensive activity tracking for compliance and security
- **Manual Management**: Searchable documentation with version control

### Offline Synchronization
- **Sync Strategy**: Pending/synced/failed status tracking for offline operations
- **Conflict Resolution**: Timestamp-based conflict resolution with manual override capabilities
- **Data Persistence**: Local storage mechanisms for offline form submissions and data caching

## External Dependencies

### Cloud Services
- **Neon Database**: Serverless PostgreSQL database hosting
- **Google Cloud Storage**: File storage for document attachments and manual uploads

### File Upload System
- **Uppy**: File upload handling with AWS S3 integration support
- **Multiple Providers**: Google Cloud Storage and AWS S3 compatibility

### Development Tools
- **Replit Integration**: Development environment with cartographer plugin and runtime error handling
- **Build Tools**: ESBuild for server bundling, Vite for client bundling
- **Development Server**: Hot module replacement and development middleware

### Authentication & Security
- **Password Hashing**: Scrypt-based password hashing with salt
- **Session Security**: Secure HTTP-only cookies with CSRF protection
- **Environment Variables**: Secure configuration management for database URLs and session secrets

### UI Component Libraries
- **Radix UI**: Accessible component primitives for complex UI interactions
- **Lucide React**: Icon library with maritime-specific iconography
- **TanStack Table**: Advanced data table functionality with sorting, filtering, and pagination