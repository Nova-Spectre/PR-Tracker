# PR Tracker Dashboard

Kanban-style dashboard for tracking pull requests across multiple projects. Built with Next.js 14, TypeScript, TailwindCSS, and drag-and-drop.

This build works fully offline without GitHub/GitLab access. You can paste PR links manually. Data is stored in `localStorage`. Optional MongoDB integration can be wired later.

## Quick Start

1. Install deps

```bash
pnpm install # or npm install / yarn
```

2. Run dev server

```bash
pnpm dev
```

Open http://localhost:3000

## Deploy to Vercel

- Click "New Project" in Vercel and import this repo
- Framework: Next.js, build command: `next build`, output: `.vercel/output` (default)
- No env vars required for v1

## Git

```bash
git init
git add -A
git commit -m "feat: PR Tracker Dashboard v1"
git branch -M v1
git remote add origin <your-github-repo-url>
git push -u origin v1
```

## Roadmap

- MongoDB persistence API
- OAuth connections for GitHub/GitLab (optional)
- Team users and roles


