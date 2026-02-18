# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Kids Coding Education Platform** project designed to teach children ages 7+ programming through visual block-based coding (Blockly). The project is planned as a subscription-based platform ($75-$125/month) with a goal of $250k revenue within 24 months.

## Architecture & Technology Stack

**Planned Technology Stack:**
- **Frontend:** Rails 7+ with Hotwire (Turbo + Stimulus)
- **Backend:** Ruby on Rails 7+ with PostgreSQL
- **Block Editor:** Blockly (Google's visual programming library)
- **UI:** Tailwind CSS
- **Authentication:** Devise
- **Payment:** Stripe integration
- **Hosting:** Render or Fly.io

## Development Phases

The project follows a structured development approach:

1. **Phase 0:** Blockly Prototype & Validation (Weeks 1-3) - Build standalone HTML/JS prototype
2. **Phase 1:** Rails Foundation (Weeks 4-7) - Basic Rails app with authentication
3. **Phase 2:** Core Learning Experience (Weeks 8-13) - Lesson player and progress tracking
4. **Phase 3:** Studio & Projects (Weeks 14-17) - Project creation and sharing
5. **Phase 4:** Gamification (Weeks 18-21) - Achievements and points system
6. **Phase 5:** Teacher/Parent Portals (Weeks 22-25) - Classroom and parent features
7. **Phase 6:** Polish & Launch (Weeks 26-29) - Stripe integration and deployment

## Key Business Requirements

- **Target Audience:** Children ages 7+ (requires reading ability)
- **Learning Approach:** Visual block-based programming progressing to text-based code
- **Curriculum:** Sequencing → Loops → Events → Conditionals → Variables → Functions
- **User Roles:** Students, Teachers, Parents, Admins
- **COPPA Compliance:** Must handle children's data safely and legally

## Database Schema (Planned)

Core entities include:
- **users** (via Devise) - authentication and roles
- **profiles** - user details and subscription info
- **courses** - learning course containers
- **lessons** - individual learning units with Blockly workspaces
- **student_progresses** - tracking completion and performance
- **projects** - student-created programs
- **achievements** - gamification badges and points
- **classrooms** - teacher-student groupings
- **subscriptions** - Stripe integration for billing

## Development Guidelines

- **Start with Phase 0:** Build a working Blockly prototype before Rails development
- **User Testing First:** Validate learning experience with actual children before building infrastructure
- **Security Focus:** Implement strong authentication, sandboxed code execution, and COPPA compliance
- **Rails Best Practices:** Use strong parameters, parameterized queries, CSRF protection
- **Testing:** Comprehensive RSpec test suite required

## Important Notes

- No existing code yet - project is in specification phase
- Must validate Blockly learning experience with kids before full development
- Payment integration with Stripe is critical for business model
- Mobile-responsive design required (tablet-first approach)
- Performance optimization important for real-time block execution

## Getting Started

1. Review the complete technical specification in `docs/spec.md`
2. Begin with Phase 0: Create standalone Blockly prototype
3. Test prototype with children before proceeding to Rails development
4. Follow the structured development phases for systematic progress