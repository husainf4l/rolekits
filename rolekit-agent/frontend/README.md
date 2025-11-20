# Resume Builder Frontend (Phase 2)

This Vite + React + TypeScript application implements the Phase 2 checklist from `QUICK_IMPLEMENTATION_GUIDE.md`. It ships with Tailwind CSS, React Query, Zustand, and React Router along with scaffolded UI primitives, resume editor components, and API integration hooks.

## Getting Started

```bash
cd frontend
npm install
npm run dev
```

Environment variables are read via `import.meta.env.VITE_API_URL` and default to `http://localhost:8000/api/v1`. Update `.env` at the repo root (used by Docker + backend) and optionally create `frontend/.env` for Vite-specific overrides.

## Project Highlights

- **UI System**: `src/components/UI` contains Tailwind-powered primitives (Button, Input, Modal, Card, Toast) for rapid iteration.
- **Resume Workflow**: `src/components/Resume` includes `ResumeEditor`, `FormFields`, `Preview`, and `TemplateSelector`, mirroring the guide's structure.
- **State & Hooks**: React Query manages data fetching (`useResume`, `useTemplates`), while Zustand stores keep local optimistic state.
- **Services**: Axios client with auth interceptor plus `resumeService` and `templateService`.
- **Routing Layout**: `App.tsx` wires Dashboard, Templates, Editor, Preview, and Settings pages with a shared header/sidebar layout.

## Scripts

| Script        | Description                                   |
|---------------|-----------------------------------------------|
| `npm run dev` | Launch Vite dev server with HMR                |
| `npm run build` | Type-check and bundle for production        |
| `npm run preview` | Preview the production build locally     |
| `npm run lint` | ESLint with the default Vite config         |

Add Vitest or Playwright when you're ready for automated tests.
