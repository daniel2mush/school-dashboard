# School Dashboard

A premium, full-stack school management ecosystem built for the modern educational era. This platform bridges the gap between administrators, teachers, and students through a unified interface designed for high-performance data management and intuitive user experiences.

---

## Why This Project Exists

Traditional school management is often bogged down by fragmented systems and fragile manual records. This dashboard was engineered to:

- Centralize Integrity: Keep all academic, financial, and administrative data in one safe, structured environment.
- Empower Educators: Provide teachers with professional-grade tools for material distribution and grade management.
- Guide Students: Offer a clear, organized roadmap for learning with instant access to resources and announcements.
- Bilingual Experience: Support for French and English users ensures accessibility across diverse educational landscapes.

---

## Ecosystem Overview

### Administrative Core

The nerve center of the institution. Administrators can oversee every aspect of the school's digital footprint.

- Analytics Dashboard: High-level insights into student performance, enrollment trends, and financial health.
- Financial Registry: Sophisticated fee tracking with automatic payment status updates and detailed receipts.
- User Orchestration: Role-based access control (RBAC) to manage students, teachers, and staff accounts.
- Institution Settings: Global configuration for terms, academic years, and branding.

### Teacher Hub

A high-productivity workspace for educators to manage their classes and content.

- Material Engine: Securely upload, organize, and distribute educational content (PDFs, PPTs, Docs) via Supabase.
- Academic Reporting: Streamlined grade entry with performance analysis and term-end report summaries.
- Attendance Tracking: Digital rosters for quick and accurate daily attendance recording.
- Strategic Communication: Create and target announcements by year group or priority.

### Student Portal

A focused, distraction-free environment for students to stay on track.

- Personalized Roadmap: Instant access to subject-specific materials and learning resources.
- Interactive Timetable: Real-time view of class schedules, periods, and break times.
- Announcement Stream: Priority-sorted feed for school updates, urgent alerts, and class news.
- Performance Tracking: Visibility into grades and progress reports.

---

## Tech Stack

| Layer               | Technologies                              |
| :------------------ | :---------------------------------------- |
| **Runtime**         | Bun (Ultra-fast JavaScript runtime)       |
| **Frontend**        | React 19, TanStack Start, TypeScript      |
| **State & Routing** | TanStack Router, TanStack Query, Zustand  |
| **Styling**         | Sass (SCSS), Lucide Icons, Recharts       |
| **Backend**         | Node.js, Express, Zod Validation          |
| **Database**        | PostgreSQL, Prisma ORM                    |
| **Cloud Services**  | Supabase (Storage & Managed DB), JWT Auth |

---

## Project Structure

- frontend/ - React application powered by Vite & TanStack. Uses a modular route-based architecture.
- backend/ - Express API with Prisma integration, structured for scalability and security.
- backend/prisma/ - Database schema definitions, migrations, and seeding scripts.

---

## Getting Started

This repository is optimized for Bun. We recommend using it for the fastest experience.

### 1. Prerequisites

Ensure you have Bun installed:

```bash
curl -fsSL https://bun.sh/install | bash
```

### 2. Backend Setup

1. Navigate to the directory: cd backend
2. Install dependencies: bun install
3. Configure .env:
   ```env
   DATABASE_URL="postgresql://..."
   JWT_ACCESS_SECRET="..."
   JWT_REFRESH_SECRET="..."
   SUPABASE_URL="..."
   SUPABASE_SERVICE_ROLE_KEY="..."
   ```
4. Initialize Database:
   ```bash
   bun x prisma migrate dev
   bun x prisma db seed
   ```
5. Start Server: bun dev

### 3. Frontend Setup

1. Navigate to the directory: cd frontend
2. Install dependencies: bun install
3. Start Dev Server: bun dev

---

## Default Credentials

If you have run the seeding script (`bun x prisma db seed`), you can use the following accounts for testing:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@sunridge.edu` | `password123` |
| **Teacher** | `teacher.001@sunridge.edu` | `password123` |
| **Student** | `student.001@sunridge.edu` | `password123` |

---

## Available Scripts

### Backend

- bun dev: Watch mode for rapid development.
- bun run build: Compile TypeScript for production.
- bun start: Run the production server.

### Frontend

- bun dev: Launches Vite development server on port 3000.
- bun run build: Optimized production build.
- bun run test: Executes Vitest test suite.
- bun run check: Automated formatting (Prettier) and linting (ESLint).

---

## Security and Performance

- Desktop-Restricted Dashboard: Specialized UI optimized for desktop administrative tasks, with responsive guards for specific roles.
- JWT Refresh Strategy: Seamless authentication with secure HTTP-only cookies and automatic token rotation.
- Type Safety: End-to-end TypeScript and Zod validation ensure data integrity from the DB to the UI.

---

## Support

For financial support or partnership inquiries: +223 71907048

---

Licensed under [MIT](./LICENSE). Built for educational excellence.
