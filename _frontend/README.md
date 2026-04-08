# Sunridge Academy – School Dashboard

A role-based school management platform built in React.
Supports **Principal**, **Teacher**, and **Student** roles with full data isolation.

## Features

| Module | Principal | Teacher | Student |
|---|---|---|---|
| Year Group Management | ✅ Create / edit / assign | 👁 View assigned | 👁 View enrolled |
| Subject Management | ✅ Full control | ✅ Own subjects | 👁 Enrolled subjects |
| Grading & Report Cards | 👁 Overview | ✅ Enter grades | 👁 Own report card |
| Attendance | 👁 Overview | ✅ Mark / view | 👁 Own record |
| Timetable | ✅ Build / edit | 👁 View | 👁 View |
| Fee Management | ✅ Full control | — | 👁 Own balance |
| Announcements | ✅ School-wide | ✅ Class-level | 👁 Filtered to their year |
| Analytics | ✅ Full dashboard | — | — |

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Start dev server
```bash
npm run dev
```

### 3. Open in browser
```
http://localhost:5173
```

---

## Project Structure

```
src/
├── App.jsx                    # Root – routing, role switching
├── main.jsx                   # Entry point
├── styles/
│   └── globals.css            # Design tokens + all utility classes
├── constants/
│   └── navigation.js          # Sidebar nav config per role
├── data/
│   └── (replaced with API)   # Mock data removed as requested
├── components/
│   ├── Sidebar.jsx            # Role-aware sidebar
│   ├── RoleSwitcher.jsx       # Dev preview bar (remove in production)
│   ├── Modal.jsx              # Central modal renderer
│   └── ui/
│       └── index.jsx          # Shared atomic components
└── pages/
    ├── principal/
    │   └── index.jsx          # Overview, YearGroups, Users, Fees, Announcements, Analytics
    ├── teacher/
    │   └── index.jsx          # MyYears, Subjects, Grading, Attendance, Announcements
    └── student/
        └── index.jsx          # Dashboard, Subjects, ReportCard, Attendance, Timetable, Fees
```

---

## Connecting to a Real Backend

Mock data has been removed. All data is now expected to be fetched from the API.

### Example with React Query:

```jsx
// Removed mockData import

// After (real API):
import { useQuery } from "@tanstack/react-query";

function useStudents() {
  return useQuery({
    queryKey: ["students"],
    queryFn: () => fetch("/api/students").then(r => r.json()),
  });
}
```

### Recommended backend schema

```sql
-- Core tables
year_groups  (id, name, level, color)
subjects     (id, name, year_group_id)
users        (id, name, email, role, year_group_id)
teacher_year_assignments (teacher_id, year_group_id)

-- Academic
grades       (id, student_id, subject_id, score, term)
attendance   (id, student_id, date, status)  -- status: P/A/T/H
publications (id, title, subject_id, teacher_id, published, created_at)
timetable    (id, year_group_id, day, period, subject_id, teacher_id)

-- Finance
fee_structures (id, year_group_id, term, amount)
fee_payments   (id, student_id, amount, paid_at, type)

-- Communication
announcements (id, title, body, target, urgent, author_id, created_at)
```

---

## Authentication

Remove `RoleSwitcher.jsx` and replace with your auth provider.

```jsx
// Example with a JWT context:
import { useAuth } from "./hooks/useAuth";

export default function App() {
  const { user } = useAuth();         // { role: "teacher", id: 3, ... }
  const role = user?.role ?? "student";
  // ... rest of App
}
```

---

## Tech Stack

- **React 18** with hooks
- **Vite** for build tooling
- **Vanilla CSS** with design tokens (no CSS framework dependency)
- No UI library — all components are hand-rolled and easy to modify

---

## Customisation

| What | Where |
|---|---|
| School name / term | `SchoolDataProvider.tsx` → `SCHOOL` |
| Year group labels (Form 1, Grade 1, etc.) | `YEAR_GROUPS[].name` |
| Colour palette | `src/styles/globals.css` → `:root` |
| Currency | `SCHOOL.currency` (currently `CFA`) |
| Add a new page | Create component → add to `PAGE_MAP` in `App.jsx` → add to `NAV_CONFIG` in `navigation.js` |
| Add a modal | Add new `if (type === ...)` block in `Modal.jsx` |
