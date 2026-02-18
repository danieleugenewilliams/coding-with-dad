# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Coding with Dad** — a kids coding education platform designed to teach children ages 7+ programming through visual block-based coding (Blockly). Subscription-based ($75-$125/month) with a goal of $250k revenue within 24 months.

## Architecture & Technology Stack

**Frontend:**
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **UI:** Tailwind CSS 3
- **Block Editor:** Blockly 12
- **Hosting:** AWS S3 + CloudFront

**Backend (Phase 1 — planned):**
- **API:** TBD (Node.js / serverless)
- **Database:** PostgreSQL on AWS EC2 (self-managed, with RLS)
- **Authentication:** JWT
- **Payment:** Stripe
- **Storage:** AWS S3

## Project Structure

```
coding-with-dad/
├── src/                    # React application source
│   ├── components/         # React components (BlocklyWorkspace, GameCanvas, etc.)
│   ├── data/               # Lesson definitions
│   ├── engine/             # GameEngine class
│   └── types/              # TypeScript type definitions
├── public/                 # Static assets
├── docs/                   # Documentation
│   ├── spec.md             # Full technical specification
│   └── archive/prototype/  # Original HTML/JS prototype (archived)
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
└── tsconfig.json           # TypeScript configuration
```

## Development Commands

```bash
npm run dev      # Start dev server (Vite)
npm run build    # Type-check + production build
npm run lint     # ESLint
npm run preview  # Preview production build
```

## Deployment

Local scripts — no CI/CD service (GitHub Actions disabled to minimize costs).

```bash
./scripts/aws-setup.sh   # One-time: provision S3, CloudFront, ACM, DNS
./scripts/deploy.sh      # Build + S3 sync + CloudFront invalidation
```

Pattern follows `kitae.ai` deployment approach: intelligent caching (immutable hashed assets, no-cache index.html), CloudFront invalidation on deploy.

## Development Phases

1. **Phase 0:** Blockly Prototype & Validation — **COMPLETE** ✅
2. **Phase 1:** Application Foundation (Weeks 4-7) — AWS infra, PostgreSQL, JWT auth, REST API
3. **Phase 2:** Core Learning Experience (Weeks 8-13) — Lesson player and progress tracking
4. **Phase 3:** Studio & Projects (Weeks 14-17) — Project creation and sharing
5. **Phase 4:** Gamification (Weeks 18-21) — Achievements and points system
6. **Phase 5:** Teacher/Parent Portals (Weeks 22-25) — Classroom and parent features
7. **Phase 6:** Polish & Launch (Weeks 26-29) — Stripe integration and deployment

## Key Business Requirements

- **Target Audience:** Children ages 7+ (requires reading ability)
- **Learning Approach:** Visual block-based programming progressing to text-based code
- **Curriculum:** Sequencing → Loops → Events → Conditionals → Variables → Functions
- **User Roles:** Students, Teachers, Parents, Admins
- **COPPA Compliance:** Must handle children's data safely and legally

## Database Schema (Planned)

PostgreSQL with Row-Level Security (RLS). Core entities:
- **users** — JWT authentication and roles
- **profiles** — user details and subscription info
- **courses** — learning course containers
- **lessons** — individual learning units with Blockly workspaces
- **student_progresses** — tracking completion and performance
- **projects** — student-created programs
- **achievements** — gamification badges and points
- **classrooms** — teacher-student groupings
- **subscriptions** — Stripe integration for billing

## Development Guidelines

- **Security Focus:** JWT auth, RLS policies, sandboxed code execution, COPPA compliance
- **Testing:** Vitest + React Testing Library
- **Type Safety:** Strict TypeScript (`verbatimModuleSyntax`, `import type` for type-only imports)
- **Blockly API:** Use `blockly/javascript` import with `javascriptGenerator.forBlock[...]` (Blockly v12 API)
- Mobile-responsive design required (tablet-first approach)

## Repository

- **GitHub:** https://github.com/danieleugenewilliams/coding-with-dad
- **License:** MIT — D. E. Williams and Company LLC
