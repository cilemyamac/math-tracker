# MathTrack

Modern **math education & exam analytics** platform — a SaaS-style EdTech app with a polished dashboard, student management, exam analytics, charts, authentication, an admin panel, and dark/light mode.

Two independent projects:

| Project | Stack | Path |
|---------|-------|------|
| **Backend API** | ASP.NET Core 8 (.NET 8 LTS) · EF Core · SQLite · JWT auth | `backend/` |
| **Frontend SPA** | Vite · React 19 · TypeScript · Tailwind v4 · shadcn/ui · Recharts | `frontend/` |

---

## Features

- 🔐 **JWT authentication** — register / login, protected routes, role-based (Admin / Teacher)
- 📊 **Dashboard** — KPI cards, score-trend area chart, topic-mastery radar, grade-distribution bar, recent exams
- 👩‍🎓 **Student management** — searchable/sortable table, student profiles with per-student analytics, full CRUD
- 📝 **Exam analytics** — per-exam class performance, score distribution, topic difficulty
- 🛠️ **Admin panel** — tabbed CRUD console for students & exams
- 🌗 **Dark / light mode** — defaults to dark, persisted to `localStorage`
- 📱 Responsive, modern EdTech-startup UI (indigo/violet accent)
- 🌱 **Seeded demo data** — 24 students, 10 exams, ~200 results across 7 math topics

---

## Run it

### 1. Backend (port 5243)

```bash
cd backend
dotnet run
```

- API: `http://localhost:5243/api`
- Swagger: `http://localhost:5243/swagger`
- SQLite DB (`mathtrack.db`) is created and seeded automatically on first run.

> Requires the **.NET 8 SDK**. Opens and runs in **Visual Studio 2022** (17.8+), or just use the `dotnet` CLI.

### 2. Frontend (port 5173)

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The API base URL is configured in `frontend/.env`
(`VITE_API_URL=http://localhost:5243/api`).

### Demo credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@mathtrack.io` | `Admin123!` |
| Teacher | `teacher@mathtrack.io` | `Teacher123!` |

---

## Project structure

```
math-tracker/
├─ backend/                ASP.NET Core 8 Web API
│  ├─ Domain/              Entities (User, Student, Exam, ExamResult, TopicScore)
│  ├─ Data/                AppDbContext + DbSeeder
│  ├─ Controllers/         Auth, Students, Exams, Results, Analytics
│  ├─ Dtos/                Request/response DTOs
│  └─ Services/            JWT token service
├─ frontend/               Vite + React + TypeScript SPA
│  └─ src/
│     ├─ pages/            Login, Register, Dashboard, Students, Exams, Admin
│     ├─ components/       layout (sidebar/topbar), charts, shadcn/ui primitives
│     ├─ context/          AuthContext, ThemeContext
│     └─ lib/              api client, types
└─ docs/                   design spec
```

---

## Notes

- DB strategy: EF Core `EnsureCreated()` + seeder (no migrations) — zero setup for a demo.
- The frontend builds independently of the backend (`npm run build`); data binds at runtime against the live API.
