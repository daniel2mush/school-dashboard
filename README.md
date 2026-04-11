# School Dashboard

A comprehensive full-stack school management system built with modern web technologies. Features secure authentication, role-based access control, educational content management, and bilingual support for French and English users.

## Why this project exists

Many schools still rely on scattered paper records, unorganized spreadsheets, and file systems that grow more fragile over time. I built this dashboard to help both new and established schools keep their data organized without stress.

This platform is designed to:

- keep school data safe and structured
- help teachers see the programs and assignments they are responsible for
- help students understand which subject areas to focus on
- support both French and English users with an advanced bilingual experience

If you want to contribute financially or support the project, feel free to reach out: +223 71907048

## Project structure

- `backend/` - Express server, Prisma ORM, authentication, admin/teacher/user APIs.
- `frontend/` - React app built with Vite, TanStack Router, React Query, and Zustand.

## Key features

- JWT-based access and refresh token authentication with secure cookie handling
- Role-based user flows for admins, teachers, and students
- Prisma-backed PostgreSQL database with migrations and seeding
- School settings, reports, announcements, attendance, and grade management
- Teacher material management: upload, organize, and delete educational content
- Frontend dashboard with state management, forms, charts, and internationalization
- File upload support for PDFs, Word documents, and PowerPoint presentations
- Bilingual support (French and English) with i18n integration

## Who this helps

- **Admins** can manage users, school settings, and overall system data
- **Teachers** can view assigned programs, submit grades, track attendance, upload and organize educational materials, and create announcements
- **Students** can see which subjects to study, review announcements, access shared materials, and follow their learning progress
- **Schools** can keep records organized, searchable, and available over time with secure file storage

## Current status

This project is actively developed and includes:

- ✅ User authentication and authorization
- ✅ Admin user management
- ✅ Teacher dashboard with class management
- ✅ Student profile and announcements
- ✅ Grade and attendance tracking
- ✅ Educational material upload and management
- ✅ Bilingual interface (French/English)
- ✅ Responsive design for mobile and desktop

## Roadmap

Future enhancements may include:

- Student portal with assignment tracking
- Advanced reporting and analytics
- Parent communication features
- Integration with learning management systems
- Mobile app companion

## Contributing

If you want to help improve the project:

1. Fork the repository
2. Clone your fork locally
3. Install dependencies in both `backend/` and `frontend/`
4. Run the app and verify your changes
5. Open a pull request with a clear description of your improvement

Contributions are welcome for bug fixes, feature enhancements, translations, and documentation.

## Tech stack

- **Backend**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, JWT, bcrypt, Zod validation, Winston logging, Multer file uploads, Supabase storage
- **Frontend**: React 19, Vite, TypeScript, TanStack Router, TanStack Query, Zustand state management, Sass, Lucide React icons, React Hook Form, Zod validation, i18next internationalization, Recharts for data visualization
- **Dev tools**: pnpm, ESLint, Prettier, Vitest, TanStack DevTools
- **Deployment**: Docker-ready, static frontend hosting, Node.js backend server

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
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
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
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key for server-side operations
- `PORT` - backend port (default: `3001`)
- `NODE_ENV` - environment mode (`development` or `production`)

The frontend uses environment variables from `frontend/.env` (if needed for API endpoints).

## File storage

The application uses Supabase Storage for file uploads. Currently configured for:

- PDF documents (.pdf)
- Microsoft Word documents (.doc, .docx)
- Microsoft PowerPoint presentations (.ppt, .pptx)

To configure file storage:

1. Create a Supabase project at https://supabase.com
2. Go to Settings > API to get your project URL and service role key
3. Create a storage bucket named "School Dashboard" (with spaces)
4. Set bucket to public access
5. Add the environment variables to your `.env` file:
   - `SUPABASE_URL=your_project_url`
   - `SUPABASE_SERVICE_ROLE_KEY=your_service_role_key`

## Database

The application uses PostgreSQL with Prisma ORM. The database schema includes:

- Users (students, teachers, admins)
- Year groups and subjects
- Grades, attendance, and reports
- Materials and announcements
- School settings and configurations

Run migrations with: `cd backend && npx prisma migrate dev`

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
- `GET /api/teacher/materials` - list teacher's uploaded materials
- `POST /api/teacher/materials` - upload new educational material
- `DELETE /api/teacher/materials/:id` - delete specific material
- `PATCH /api/teacher/materials/:id/status` - toggle material publish status
- `POST /api/teacher/grades` - submit student grades
- `POST /api/teacher/attendance` - record class attendance
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

4. Set up file storage (currently uses Supabase - update configuration for your preferred storage solution).

5. Optionally use a reverse proxy or separate domains to route `frontend` and `backend` traffic.

## Support and feedback

If you want to contribute financially, report bugs, or suggest features, please contact:

- Phone: +223 71907048

You can also open issues or pull requests directly in the repository.

## License

This project is licensed under the MIT License.

See [LICENSE](./LICENSE) for details.
