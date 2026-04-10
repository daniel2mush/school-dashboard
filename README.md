# School Dashboard

A full-stack school dashboard application with an Express + Prisma backend and a React + TanStack frontend.

## Project structure

- `backend/` - Express server, Prisma ORM, authentication, admin/teacher/user APIs.
- `frontend/` - React app built with Vite, TanStack Router, React Query, and Zustand.

## Key features

- JWT-based access and refresh token authentication
- Role-based user flows for admins, teachers, and students
- Prisma-backed PostgreSQL database with migrations
- School settings, reports, announcements, attendance, and grade management
- Frontend dashboard with state management, forms, charts, and internationalization

## Tech stack

- Backend: Node.js, Express, TypeScript, Prisma, PostgreSQL, JWT, Zod, bcrypt
- Frontend: React, Vite, TypeScript, TanStack Router, React Query, Zustand, Sass
- Dev tools: pnpm, ESLint, Prettier, Vitest

## Getting started

This repository uses `pnpm` for dependency management. Install `pnpm` globally if needed:

```bash
npm install -g pnpm
```

### Backend setup

1. Open a terminal and go to the backend folder:

```bash
cd backend
```

2. Install dependencies:

```bash
pnpm install
```

3. Create a `.env` file in `backend/` with at least:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
PORT=3001
NODE_ENV=development
```

4. Run Prisma migrations and seed data if needed:

```bash
pnpm prisma migrate dev --name init
pnpm prisma db seed
```

5. Start the backend server:

```bash
pnpm dev
```

The backend will run on `http://localhost:3001` by default.

### Frontend setup

1. Open a terminal and go to the frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
pnpm install
```

3. Start the frontend app:

```bash
pnpm dev
```

The frontend will run on `http://localhost:3000` by default.

## Available scripts

### Backend

- `pnpm dev` - start the backend in development mode with `nodemon`
- `pnpm build` - compile TypeScript
- `pnpm start` - run the compiled backend

### Frontend

- `pnpm dev` - start the Vite development server
- `pnpm build` - build the production frontend
- `pnpm preview` - preview the production build
- `pnpm test` - run Vitest tests
- `pnpm lint` - run ESLint
- `pnpm format` - check formatting with Prettier
- `pnpm check` - format and lint fixes

## Environment variables

The backend uses environment variables from `backend/.env`:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_ACCESS_SECRET` - JWT access token secret
- `JWT_REFRESH_SECRET` - JWT refresh token secret
- `PORT` - backend port (default: `3001`)
- `NODE_ENV` - environment mode (`development` or `production`)

## Notes

- The backend expects a PostgreSQL database.
- The frontend is configured for local development and should be connected to the backend API.
- Update CORS or API base URLs as needed for deployment.

## API endpoints

The backend exposes the following route groups:

- `POST /api/auth/register` - register new users
- `POST /api/auth/login` - authenticate and issue tokens
- `POST /api/auth/refresh-token` - refresh access tokens via refresh cookie
- `POST /api/auth/logout` - revoke refresh tokens and clear cookie
- `GET /api/user/profile` - user profile and dashboard data
- `GET /api/user/announcements` - student announcements
- `GET /api/user/school-settings` - school settings data
- `GET /api/teacher/classes` - teacher classes and reports
- `POST /api/teacher/submit-grades` - submit student grades
- `POST /api/teacher/submit-attendance` - record class attendance
- `POST /api/admin/*` - admin user management and school settings endpoints

> Note: these routes require authenticated access and role-based authorization where applicable.

## Deployment

For deployment, build the frontend and serve it from a static host, while running the backend API on a Node.js server instance.

1. Build the frontend:

```bash
cd frontend
pnpm build
```

2. Build and run the backend in production mode:

```bash
cd backend
pnpm build
NODE_ENV=production PORT=3001 node dist/server.js
```

3. Configure environment variables and CORS for your production domains.

4. Optionally use a reverse proxy or separate domains to route `frontend` and `backend` traffic.

## License

This repository does not specify a license. Add one if you plan to publish or share this project publicly.
