# Technical Specification: Kids Coding Education Platform
## Project Overview

**Project Name:** Coding with Dad  
**Target Launch:** 6 months from start  
**Target Audience:** Children ages 7+ (reading level required)  
**Business Model:** Subscription-based ($75-$125/month)  
**Revenue Goal:** $250,000 within 24 months  
**Initial Scale:** 20-25 students, 20% monthly growth  
**Development Approach:** Solo development with Claude Code assistance

---

## 1. System Architecture

### 1.1 Technology Stack

**Frontend**
- **Framework:** React 19 with TypeScript
- **Build Tool:** Vite
- **UI Library:** Tailwind CSS
- **Block Editor:** Blockly 12 (Google's visual programming library)
- **State Management:** React hooks (useState, useRef, useCallback)

**Backend (Phase 1 — planned)**
- **API:** Node.js or lightweight serverless functions (Lambda)
- **Database:** PostgreSQL on AWS EC2 (self-managed, with RLS)
- **Authentication:** JWT (JSON Web Tokens)
- **File Storage:** AWS S3
- **Payment Processing:** Stripe

**Infrastructure**
- **Frontend Hosting:** AWS S3 + CloudFront (static site)
- **Database:** PostgreSQL on AWS EC2
- **CDN:** CloudFront
- **Email:** SendGrid or SES
- **Payment Processing:** Stripe

**Development Tools**
- **Code Editor:** VS Code with Claude Code integration
- **Version Control:** Git + GitHub
- **Deployment:** Custom local scripts (`scripts/deploy.sh`, `scripts/aws-setup.sh`)
- **Testing:** Vitest + React Testing Library (planned)
- **Monitoring:** Sentry or CloudWatch

### 1.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React SPA)                       │
│              Hosted on S3 + CloudFront CDN                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Student    │  │   Teacher    │  │    Parent    │      │
│  │   Portal     │  │  Dashboard   │  │   Portal     │      │
│  │  (React/TS)  │  │  (React/TS)  │  │  (React/TS)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│           │                │                 │               │
│           └────────────────┴─────────────────┘               │
│                            │ REST API (JWT auth)             │
└────────────────────────────┼─────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────┐
│                    API Layer (Phase 1)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Auth    │  │ Lessons  │  │ Projects │  │ Progress │    │
│  │  (JWT)   │  │   API    │  │   API    │  │   API    │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└────────────────────────────┼─────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────┐
│              PostgreSQL on AWS EC2 (with RLS)                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Tables  │  │  Indexes │  │  Foreign │  │   RLS    │    │
│  │          │  │          │  │   Keys   │  │ Policies │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────┐
│                   External Services                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Stripe  │  │ SendGrid │  │  Sentry  │  │  AWS S3  │    │
│  │ Payments │  │  / SES   │  │   Logs   │  │  Storage │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Database Schema

### 2.1 Core Tables (PostgreSQL with RLS)

**users**
```sql
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20) NOT NULL DEFAULT 'student'
                CHECK (role IN ('student', 'teacher', 'parent', 'admin')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**profiles**
```sql
CREATE TABLE profiles (
  id                  SERIAL PRIMARY KEY,
  user_id             INTEGER NOT NULL UNIQUE REFERENCES users(id),
  first_name          VARCHAR(255) NOT NULL,
  last_name           VARCHAR(255) NOT NULL,
  display_name        VARCHAR(255),
  date_of_birth       DATE,
  avatar_url          VARCHAR(500),
  parent_email        VARCHAR(255),
  subscription_status VARCHAR(20)
                      CHECK (subscription_status IN ('active', 'inactive', 'trial', 'cancelled')),
  subscription_tier   VARCHAR(20),
  stripe_customer_id  VARCHAR(255),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**courses**
```sql
CREATE TABLE courses (
  id               SERIAL PRIMARY KEY,
  title            VARCHAR(255) NOT NULL,
  description      TEXT,
  difficulty_level VARCHAR(20)
                   CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  age_range        VARCHAR(20),
  estimated_hours  INTEGER,
  thumbnail_url    VARCHAR(500),
  is_published     BOOLEAN NOT NULL DEFAULT FALSE,
  display_order    INTEGER,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_courses_display_order ON courses(display_order);
CREATE INDEX idx_courses_published ON courses(is_published);
```

**lessons**
```sql
CREATE TABLE lessons (
  id               SERIAL PRIMARY KEY,
  course_id        INTEGER NOT NULL REFERENCES courses(id),
  title            VARCHAR(255) NOT NULL,
  description      TEXT,
  lesson_number    INTEGER NOT NULL,
  lesson_type      VARCHAR(20)
                   CHECK (lesson_type IN ('tutorial', 'challenge', 'project', 'quiz')),
  instructions     TEXT,
  hints            JSONB DEFAULT '[]',
  starter_blocks   JSONB,
  solution_blocks  JSONB,
  success_criteria JSONB,
  estimated_minutes INTEGER,
  thumbnail_url    VARCHAR(500),
  is_published     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (course_id, lesson_number)
);

CREATE INDEX idx_lessons_type ON lessons(lesson_type);
```

**student_progresses**
```sql
CREATE TABLE student_progresses (
  id                 SERIAL PRIMARY KEY,
  student_id         INTEGER NOT NULL REFERENCES users(id),
  lesson_id          INTEGER NOT NULL REFERENCES lessons(id),
  status             VARCHAR(20) NOT NULL DEFAULT 'not_started'
                     CHECK (status IN ('not_started', 'in_progress', 'completed', 'needs_help')),
  attempts           INTEGER NOT NULL DEFAULT 0,
  current_workspace  JSONB,
  completion_time    TIMESTAMPTZ,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  hints_used         INTEGER NOT NULL DEFAULT 0,
  stars_earned       INTEGER CHECK (stars_earned >= 0 AND stars_earned <= 3),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, lesson_id)
);

CREATE INDEX idx_progress_status ON student_progresses(status);
```

**projects**
```sql
CREATE TABLE projects (
  id              SERIAL PRIMARY KEY,
  student_id      INTEGER NOT NULL REFERENCES users(id),
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  workspace       JSONB NOT NULL,
  thumbnail_url   VARCHAR(500),
  is_public       BOOLEAN NOT NULL DEFAULT FALSE,
  view_count      INTEGER NOT NULL DEFAULT 0,
  like_count      INTEGER NOT NULL DEFAULT 0,
  remix_count     INTEGER NOT NULL DEFAULT 0,
  remixed_from_id INTEGER REFERENCES projects(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_student ON projects(student_id);
CREATE INDEX idx_projects_public ON projects(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_projects_created ON projects(created_at);
```

**achievements**
```sql
CREATE TABLE achievements (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(255) NOT NULL,
  description    TEXT,
  badge_icon_url VARCHAR(500),
  criteria       JSONB,
  points         INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**student_achievements**
```sql
CREATE TABLE student_achievements (
  id             SERIAL PRIMARY KEY,
  student_id     INTEGER NOT NULL REFERENCES users(id),
  achievement_id INTEGER NOT NULL REFERENCES achievements(id),
  earned_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, achievement_id)
);
```

**classrooms**
```sql
CREATE TABLE classrooms (
  id          SERIAL PRIMARY KEY,
  teacher_id  INTEGER NOT NULL REFERENCES users(id),
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  join_code   VARCHAR(20) NOT NULL UNIQUE,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_classrooms_teacher ON classrooms(teacher_id);
```

**classroom_students** (join table)
```sql
CREATE TABLE classroom_students (
  id           SERIAL PRIMARY KEY,
  classroom_id INTEGER NOT NULL REFERENCES classrooms(id),
  student_id   INTEGER NOT NULL REFERENCES users(id),
  joined_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (classroom_id, student_id)
);
```

**subscriptions**
```sql
CREATE TABLE subscriptions (
  id                     SERIAL PRIMARY KEY,
  user_id                INTEGER NOT NULL REFERENCES users(id),
  stripe_subscription_id VARCHAR(255) NOT NULL UNIQUE,
  status                 VARCHAR(20) NOT NULL,
  plan_id                VARCHAR(255) NOT NULL,
  current_period_start   TIMESTAMPTZ,
  current_period_end     TIMESTAMPTZ,
  cancel_at_period_end   BOOLEAN NOT NULL DEFAULT FALSE,
  cancelled_at           TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

---

## 3. Feature Specifications

### 3.1 Student Portal

**Dashboard**
- Overview of current courses and progress
- Continue where you left off
- Recommended next lessons
- Recent achievements and badges
- Total points/stars earned
- Quick access to creative projects

**Lesson Player**
- Full-screen immersive learning experience
- Split view: instructions (left) and Blockly workspace (right)
- Visual game/puzzle area showing real-time code execution
- Block palette with categories (Motion, Loops, Logic, Events, etc.)
- "Run" and "Reset" buttons
- "Show Solution" button (limited uses or teacher-controlled)
- Progress indicator (current lesson in course)
- Hint system with progressive disclosure
- Auto-save functionality

**Project Studio (Sandbox)**
- Full Blockly workspace with all available blocks
- Asset library (sprites, backgrounds, sounds)
- Project settings (title, description, public/private)
- Save and load projects
- "Remix" functionality for public projects
- Share link generation
- Embedded project player

**Profile & Achievements**
- Personal stats dashboard
- Earned badges display
- Progress across all courses
- Project portfolio
- Customizable avatar

### 3.2 Teacher Dashboard

**Class Management**
- Create and manage multiple classrooms
- Generate unique join codes
- View roster with student profiles
- Bulk actions (assign lessons, send messages)

**Progress Monitoring**
- Class-wide progress overview
- Individual student drill-down
- Identify struggling students (flagged by attempts, time spent, help requests)
- Completion rates by lesson/course
- Time analytics

**Lesson Management**
- Assign specific lessons or courses to classrooms
- Set due dates and deadlines
- View student submissions
- Provide feedback and comments
- Grade projects (if applicable)

**Reporting**
- Export student progress reports
- Printable certificates
- Parent communication reports

### 3.3 Parent Portal

**Overview**
- Child's progress summary
- Recent achievements
- Time spent learning (weekly/monthly)
- Current courses and completion status

**Settings**
- Screen time limits (optional)
- Content restrictions
- Notification preferences
- Billing and subscription management

### 3.4 Block-Based Programming Environment

**Blockly Integration**
- Custom block definitions for educational concepts
- Age-appropriate block categories
- Visual feedback for block connections
- Error highlighting (red borders, warning messages)
- Block commenting for educators

**Code Generation**
- Generate JavaScript from Blockly workspace
- Optional "Show Code" toggle for advanced students
- Syntax highlighting in code view

**Execution Engine**
- Sandboxed JavaScript execution
- Visual interpreter showing step-by-step execution (optional)
- Speed controls (normal, slow, step-through)
- Breakpoint support for debugging lessons

**Built-in Blocks Categories**
1. **Motion** - moveForward(), turnRight(), etc.
2. **Looks** - say(), think(), changeSize(), etc.
3. **Sound** - playSound(), etc.
4. **Events** - whenFlagClicked(), whenKeyPressed(), etc.
5. **Control** - repeat, if/else, wait, forever loops
6. **Sensing** - touching?, keyPressed?, etc.
7. **Operators** - arithmetic, comparison, logical operators
8. **Variables** - create, set, change variables
9. **Functions** - define custom blocks

### 3.5 Curriculum System

**Course Structure**
- Courses contain 10-30 lessons
- Lessons organized by skill progression
- Mix of lesson types: tutorials, challenges, projects, quizzes

**Skill Taxonomy**
1. **Sequencing** - Understanding order of operations
2. **Loops** - Repetition concepts
3. **Events** - Event-driven programming
4. **Conditionals** - Decision-making logic
5. **Variables** - Data storage and manipulation
6. **Functions** - Code reusability and abstraction
7. **Debugging** - Problem-solving and error correction

**Difficulty Progression**
- Beginner (ages 7-9): Visual puzzles, simple sequences
- Intermediate (ages 9-12): Loops, conditionals, basic variables
- Advanced (ages 12+): Functions, complex logic, text-based code transition

### 3.6 Gamification System

**Points System**
- Lesson completion: 50-200 points based on difficulty
- First try bonus: +25%
- Speed bonus: Complete under estimated time
- Hint penalty: -10 points per hint used
- Daily streak bonus: +50 points

**Star Rating**
- 3 stars: Complete without hints, minimal attempts
- 2 stars: Complete with some help
- 1 star: Complete with significant assistance

**Achievements/Badges**
- First Lesson Complete
- Course Master (complete entire course)
- Speed Demon (complete 5 lessons in one day)
- Problem Solver (complete challenge without hints)
- Creative Mind (publish 5 projects)
- Helpful Friend (remix another student's project)
- Week Warrior (7-day learning streak)

**Leaderboards** (Optional - teacher controlled)
- Classroom leaderboards
- Course-specific rankings
- Weekly challenges

---

## 4. User Flows

### 4.1 Student Onboarding

1. Parent creates account with email/password
2. Parent enters payment information (Stripe checkout)
3. Parent creates student profile(s)
4. Student logs in with simplified credentials
5. Welcome tutorial (interactive)
6. Choose first course or take placement assessment
7. Begin first lesson

### 4.2 Lesson Completion Flow

1. Student clicks on lesson from course page
2. Lesson player loads with instructions
3. Student drags blocks to workspace
4. Student clicks "Run" to test code
5. If incorrect: Visual feedback, error message, option for hint
6. If correct: Success animation, stars awarded, points added
7. "Next Lesson" button appears
8. Progress saved automatically

### 4.3 Project Creation Flow

1. Student clicks "New Project" in studio
2. Choose template or start blank
3. Build program with blocks
4. Test project with "Run" button
5. Save project with title and description
6. Optional: Make project public
7. Optional: Generate share link
8. Project appears in student portfolio

---

## 5. API Endpoints (REST)

### 5.1 Authentication (JWT)
```
POST   /api/auth/register          # Create account
POST   /api/auth/login             # Login, returns JWT
POST   /api/auth/refresh           # Refresh JWT token
POST   /api/auth/forgot-password   # Request password reset
POST   /api/auth/reset-password    # Reset password with token
```

### 5.2 Courses & Lessons
```
GET    /api/courses                # List all courses
GET    /api/courses/:id            # Get course details
GET    /api/courses/:id/lessons    # List lessons in course
GET    /api/lessons/:id            # Get lesson details
POST   /api/lessons/:id/submit     # Submit lesson solution
POST   /api/lessons/:id/progress   # Save progress (auto-save)
```

### 5.3 Student Progress
```
GET    /api/students/me/progress          # Current user's progress
GET    /api/students/me/progress/:lessonId # Progress for specific lesson
PUT    /api/students/me/progress/:lessonId # Update progress
```

### 5.4 Projects
```
GET    /api/projects                # List user's projects
POST   /api/projects                # Create project
GET    /api/projects/:id            # Get project
PUT    /api/projects/:id            # Update project
DELETE /api/projects/:id            # Delete project
POST   /api/projects/:id/remix      # Remix a project
POST   /api/projects/:id/like       # Like a project
POST   /api/projects/:id/publish    # Publish project
GET    /api/projects/gallery         # Public gallery
```

### 5.5 Achievements
```
GET    /api/achievements             # List all achievements
GET    /api/students/me/achievements # Current user's earned achievements
```

### 5.6 Classrooms
```
GET    /api/classrooms               # List classrooms (teacher)
POST   /api/classrooms               # Create classroom
GET    /api/classrooms/:id           # Get classroom details
POST   /api/classrooms/:id/join      # Join with code (student)
GET    /api/classrooms/:id/students  # List students in classroom
GET    /api/classrooms/:id/progress  # Class progress report
```

### 5.7 Subscriptions (Stripe)
```
POST   /api/subscriptions/checkout   # Create Stripe checkout session
POST   /api/subscriptions/webhook    # Stripe webhook handler
GET    /api/subscriptions/portal     # Get Stripe portal session URL
POST   /api/subscriptions/cancel     # Cancel subscription
```

---

## 6. Security Considerations

### 6.1 Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC) enforced at API and database (RLS) levels
- PostgreSQL Row-Level Security policies per user role
- Student accounts cannot access other students' data
- Teachers can only access their assigned classrooms
- Parents can only access their children's accounts
- Input validation on all API endpoints

### 6.2 Content Security
- Sandboxed code execution (no access to DOM or external resources)
- Input sanitization for user-generated content
- API rate limiting
- CORS configuration for API endpoints
- CSP (Content Security Policy) headers on S3/CloudFront

### 6.3 Data Privacy
- COPPA compliance for children under 13
- Parental consent workflow
- Data encryption at rest (PostgreSQL pgcrypto / AWS encryption)
- SSL/TLS for all connections
- Minimal data collection
- Clear privacy policy
- Data export functionality
- Account deletion workflow with data purging

### 6.4 Payment Security
- PCI compliance via Stripe
- No credit card data stored in application
- Webhook signature verification
- Secure checkout flow with Stripe Checkout/Payment Links

### 6.5 Application Security
- Protection against SQL injection (use parameterized queries)
- XSS protection via React's default escaping + CSP headers
- API input validation and sanitization
- Secure JWT storage (httpOnly cookies or secure storage)
- Regular dependency updates (npm audit)

---

## 7. Development Phases

### Phase 0: Blockly Prototype & Validation (Weeks 1-3) — COMPLETE ✅
**Goal:** Build a working Blockly prototype to validate the core learning experience before investing in full application development.

**Outcome:** Prototype built and validated. Two versions created:
1. Standalone HTML/JS/CSS prototype (archived to `docs/archive/prototype/`)
2. React/TypeScript/Vite prototype (promoted to main app)

**Delivered:**
- ✅ React SPA with Blockly 12 workspace integration
- ✅ 5 lesson definitions progressing from basic movement to nested loops
- ✅ Game engine with canvas rendering, robot movement, goal detection
- ✅ Run, Step (record-and-replay), and Reset controls
- ✅ Lesson navigation (prev/next)
- ✅ Hint system with progressive disclosure
- ✅ Code generation view (Show Code toggle)
- ✅ Tailwind CSS styling with responsive layout

**Decision:** Proceeding with React + TypeScript + Vite stack (not Rails). Frontend will be hosted on S3 with CloudFront. Backend API and PostgreSQL on AWS.

---

### Phase 1: Application Foundation (Weeks 4-7)
**Note:** Phase 0 validated successfully. Proceeding with React/TypeScript stack.

**Deliverables:**
- AWS infrastructure set up (S3, CloudFront, EC2 for PostgreSQL)
- PostgreSQL database with schema and RLS policies
- JWT authentication system
- REST API for core entities
- CI/CD pipeline (GitHub Actions → S3 deploy)

**Tasks:**
- Set up AWS infrastructure via `scripts/aws-setup.sh` (S3, CloudFront, ACM, DNS)
- Create deployment script `scripts/deploy.sh` (build, S3 sync, CloudFront invalidation)
- Set up PostgreSQL on AWS EC2 with RLS enabled
- Implement database schema (users, profiles, courses, lessons, progress)
- Build JWT authentication (register, login, refresh, password reset)
- Create REST API endpoints for courses and lessons
- Connect React frontend to API
- Implement user registration and login flows

### Phase 2: Core Learning Experience (Weeks 8-13)
**Deliverables:**
- Full lesson player with integrated Blockly
- Course and lesson browsing
- Student progress tracking
- First complete course (10-15 lessons)
- Hint and help system

**Tasks:**
- Build lesson player with course/lesson data from API
- Enhance block execution engine (from prototype)
- Create success criteria evaluation system
- Build course browsing interface
- Develop student progress tracking (API + database)
- Implement auto-save via API
- Enhance hint system
- Write and test first full course content
- Polish UI/UX based on prototype learnings

### Phase 3: Studio & Projects (Weeks 14-17)
**Deliverables:**
- Project creation studio
- Project saving and loading
- Public project gallery
- Project remix functionality

**Tasks:**
- Build full Blockly workspace environment
- Implement project CRUD operations via API
- Create project gallery UI
- Add sharing and remix features
- Implement project storage (S3)
- Add asset library

### Phase 4: Engagement & Gamification (Weeks 18-21)
**Deliverables:**
- Achievement system
- Points and stars
- Student dashboard with stats
- Badges and milestones

**Tasks:**
- Implement Achievement model and logic
- Build achievement notification system
- Create badge design assets
- Develop student stats dashboard
- Add optional leaderboard

### Phase 5: Teacher & Parent Portals (Weeks 22-25)
**Deliverables:**
- Teacher dashboard
- Classroom management
- Parent portal
- Progress reporting

**Tasks:**
- Build teacher dashboard views in React
- Implement classroom CRUD via API
- Create progress monitoring views
- Build parent portal
- Develop reporting system

### Phase 6: Polish & Launch Prep (Weeks 26-29)
**Deliverables:**
- Stripe subscription integration
- Complete testing and QA
- Documentation
- Marketing site
- Beta launch!

**Tasks:**
- Integrate Stripe with API
- Implement subscription management
- Comprehensive test suite (Vitest + React Testing Library)
- Performance optimization (caching, lazy loading)
- Create help documentation
- Build landing page
- Create onboarding tutorials
- Beta testing with 10-15 users
- Launch preparation

---

## 8. Content Development Plan

### 8.1 Initial Course Catalog (MVP)

**Course 1: Introduction to Sequencing (Ages 7-9)**
- 12 lessons, ~2 weeks at 3 lessons/week
- Topics: Moving characters, basic commands, order of operations
- Theme: Adventure quest

**Course 2: Loops & Patterns (Ages 8-10)**
- 15 lessons, ~3 weeks
- Topics: Repeat blocks, patterns, efficiency
- Theme: Musical instruments / art creation

**Course 3: Events & Interaction (Ages 9-11)**
- 15 lessons, ~3 weeks
- Topics: User input, button clicks, keyboard controls
- Theme: Interactive games

**Course 4: Conditionals & Logic (Ages 10-12)**
- 18 lessons, ~4 weeks
- Topics: If/else, boolean logic, comparison operators
- Theme: Puzzle solving / maze navigation

**Course 5: Variables & Data (Ages 11-13)**
- 20 lessons, ~4-5 weeks
- Topics: Variable creation, score keeping, data manipulation
- Theme: Game development

### 8.2 Content Creation Timeline
- Weeks 1-10: Develop Courses 1-2 (27 lessons)
- Weeks 11-18: Develop Courses 3-4 (33 lessons)
- Weeks 19-24: Develop Course 5 (20 lessons)
- Ongoing: Additional courses, seasonal content

### 8.3 Content Format
Each lesson includes:
- Title and learning objectives
- Step-by-step instructions
- Starter workspace configuration
- Success criteria (programmatic checks)
- 2-3 progressive hints
- Solution workspace
- Extension activities for advanced students

---

## 9. Monetization Strategy

### 9.1 Pricing Tiers

**Basic Plan - $75/month**
- Access to all core courses
- Project studio with 10 project slots
- Basic progress tracking
- Parent portal access
- 1 student account

**Premium Plan - $125/month**
- All Basic features
- Early access to new courses
- Unlimited project slots
- Advanced analytics
- Teacher/classroom features
- Up to 3 student accounts
- Private tutoring session (1/month)

**Family Add-on - +$40/month per additional student**
- For families with multiple children

### 9.2 Revenue Projections

**Assumptions:**
- Starting cohort: 25 students
- Monthly growth rate: 20%
- Average revenue per user: $85/month (mix of Basic/Premium)
- Churn rate: 5% monthly

**24-Month Projection:**

| Month | Students | Monthly Revenue | Cumulative Revenue |
|-------|----------|-----------------|-------------------|
| 1     | 25       | $2,125          | $2,125            |
| 3     | 36       | $3,060          | $7,633            |
| 6     | 62       | $5,270          | $25,158           |
| 12    | 154      | $13,090         | $92,341           |
| 18    | 382      | $32,470         | $263,118          |
| 24    | 948      | $80,580         | $621,443          |

**Target Achievement:** Month 21-22 (~$250k cumulative revenue)

### 9.3 Free Trial Strategy
- 7-day free trial (no credit card required)
- First 2 lessons of each course accessible for free
- 1 project creation allowed during trial
- Conversion optimization: in-app prompts, parent emails

---

## 10. Marketing & Growth Strategy

### 10.1 Launch Strategy
- Beta launch with 5-10 founding families (free for 3 months)
- Testimonials and case studies
- Local community outreach (schools, libraries, after-school programs)
- Social media presence (Instagram, Facebook parent groups)
- SEO-optimized blog content

### 10.2 Customer Acquisition Channels
- **Organic Search:** Blog content, SEO optimization
- **Paid Ads:** Facebook/Instagram ads targeting parents
- **Partnerships:** Schools, homeschool co-ops, libraries
- **Referral Program:** Give 1 month free, get 1 month free
- **Content Marketing:** YouTube tutorials, TikTok demos
- **Community Building:** Discord server for parents/kids

### 10.3 Retention Strategy
- Weekly progress emails to parents
- Achievement notifications
- New content releases (monthly)
- Seasonal challenges and events
- Community showcases (student project features)
- Excellent customer support

---

## 11. Analytics & Metrics

### 11.1 Key Performance Indicators (KPIs)

**Business Metrics:**
- Monthly Recurring Revenue (MRR)
- Customer Lifetime Value (CLV)
- Churn Rate
- Customer Acquisition Cost (CAC)
- Net Promoter Score (NPS)

**Product Metrics:**
- Daily/Weekly Active Users (DAU/WAU)
- Average session duration
- Lessons completed per user per week
- Course completion rate
- Time to complete first lesson
- Feature adoption (studio usage, project creation)

**Learning Metrics:**
- Average attempts per lesson
- Hint usage rate
- Success rate by lesson
- Learning velocity (lessons per week)
- Skill progression tracking

### 11.2 Analytics Implementation
- CloudWatch or Plausible for web vitals
- Custom events tracked in database
- Weekly automated reports
- Teacher dashboards with real-time data
- Cohort analysis tools

---

## 12. Technical Debt & Future Considerations

### 12.1 Known Limitations (MVP)
- Limited mobile responsiveness (tablet-first design)
- No native mobile apps (web-only)
- Single language support (English)
- Limited accessibility features
- No live teacher support (async only)

### 12.2 Post-Launch Roadmap

**Phase 7: Mobile Optimization (Months 7-9)**
- Responsive design improvements
- Touch-friendly Blockly interface
- Progressive Web App (PWA) functionality

**Phase 8: Advanced Features (Months 10-12)**
- Live coding sessions with teachers
- Student-to-student project collaboration
- Text-based code editor (Python/JavaScript)
- Advanced debugging tools
- AI-powered hint system

**Phase 9: Scale & Expansion (Year 2)**
- Spanish language support
- Native mobile apps (iOS/Android)
- School district licensing
- Advanced accessibility features (screen readers, high contrast)
- API for third-party integrations

### 12.3 Technical Debt Management
- Code reviews using Claude Code
- Automated testing suite
- Regular dependency updates
- Performance monitoring and optimization
- Security audits

---

## 13. Risk Assessment & Mitigation

### 13.1 Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Blockly performance issues with complex projects | High | Medium | Implement workspace size limits, optimization |
| Database scaling challenges | Medium | Low | Optimize queries, add read replicas on AWS if needed |
| Security vulnerability | High | Low | Regular security audits, penetration testing |
| Browser compatibility issues | Medium | Medium | Extensive cross-browser testing |

### 13.2 Business Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Slow customer acquisition | High | Medium | Diversify marketing channels, referral program |
| High churn rate | High | Medium | Focus on engagement, quality content |
| Strong competitor entry | Medium | Low | Build strong community, unique IP |
| COPPA compliance issues | High | Low | Legal consultation, strict compliance |

### 13.3 Operational Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Content development bottleneck | Medium | High | Hire contract curriculum developers |
| Customer support overload | Medium | Medium | FAQ system, community forums, chatbot |
| Payment processing issues | High | Low | Stripe testing, backup payment processor |

---

## 14. Success Criteria

### 14.1 Launch Success (Month 1)
- ✅ 25+ active paying students
- ✅ <2% bug report rate
- ✅ 85%+ lesson completion rate
- ✅ Average session duration >15 minutes
- ✅ No security incidents

### 14.2 6-Month Milestones
- ✅ 60+ active students
- ✅ 5+ complete courses available
- ✅ 90%+ customer satisfaction
- ✅ <5% monthly churn
- ✅ $5,000+ MRR

### 14.3 12-Month Milestones
- ✅ 150+ active students
- ✅ 8+ complete courses
- ✅ 1,000+ student projects created
- ✅ First school partnership
- ✅ $12,000+ MRR

### 14.4 24-Month Milestones
- ✅ $250,000+ cumulative revenue
- ✅ 500+ active students
- ✅ 10+ complete courses
- ✅ 95%+ NPS score
- ✅ Break-even or profitable

---

## 15. Support & Documentation

### 15.1 User Documentation
- Getting started guide
- Parent handbook
- Teacher manual
- Troubleshooting guides
- Video tutorials
- FAQ section

### 15.2 Developer Documentation
- API documentation
- Database schema reference
- Deployment guides
- Contributing guidelines
- Security best practices

### 15.3 Customer Support
- Email support (support@codingwithdad.TBD)
- In-app help center
- Community forum (optional)
- Monthly office hours (Zoom)
- Detailed help articles

---

## Appendices

### Appendix A: Glossary
- **Blockly:** Google's visual programming editor
- **RLS:** Row-Level Security — PostgreSQL feature that restricts which rows a user can access based on policies
- **JWT:** JSON Web Token — stateless authentication token used for API access
- **Workspace:** The area where students drag and connect blocks
- **Remix:** Creating a new project based on an existing one
- **SPA:** Single-Page Application — frontend architecture used by this project (React)

### Appendix B: Resources
- **Blockly Documentation:** https://developers.google.com/blockly
- **React Documentation:** https://react.dev
- **Vite Documentation:** https://vite.dev
- **TypeScript Documentation:** https://www.typescriptlang.org/docs
- **Tailwind CSS:** https://tailwindcss.com
- **PostgreSQL RLS:** https://www.postgresql.org/docs/current/ddl-rowsecurity.html
- **JWT Introduction:** https://jwt.io/introduction
- **Stripe API:** https://stripe.com/docs/api
- **AWS S3 Static Hosting:** https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html
- **Code.org Open Source:** https://github.com/code-dot-org

### Appendix C: Design System
- Primary Color: Teal (#14B8A6)
- Secondary Color: Orange (#FB923C)
- Success: Green (#22C55E)
- Warning: Yellow (#FACC15)
- Error: Red (#EF4444)
- Font: Inter (UI), Nunito (Kid-friendly content)
- Design inspiration: Code.org, Scratch, Khan Academy Kids

---

## Next Steps

### Phase 0 Complete — Proceeding to Phase 1

**Domain:**
- `codingwithdad.com` is taken (registered 2015, GoDaddy)
- Available alternatives: `code-with-dad.com`, `codingwithdad.dev`, `codingwithdad.io`, `codingwithdad.app`, `codingwithdad.co`
- **Action:** Register preferred domain

### Immediate Actions (Phase 1 Kickoff):

1. **Register domain** and configure DNS
2. **Set up AWS infrastructure**
   - S3 bucket + CloudFront for frontend hosting
   - EC2 instance with PostgreSQL
   - IAM roles and security groups
3. **Set up deployment scripts**
   - `scripts/aws-setup.sh`: one-time infrastructure provisioning
   - `scripts/deploy.sh`: build + S3 sync + CloudFront invalidation
4. **Design and implement database schema**
   - Create tables with RLS policies
   - Seed initial course/lesson data
5. **Build JWT authentication API**
   - Register, login, refresh, password reset endpoints
6. **Connect React frontend to API**
   - Auth flows (login/register screens)
   - Lesson data loading from API

### Repository:
- **GitHub:** https://github.com/danieleugenewilliams/coding-with-dad
- **Stack:** React 19 + TypeScript + Vite + Tailwind CSS
- **Directory:** App source in `src/`, docs in `docs/`, archived prototype in `docs/archive/`

**Estimated Remaining Timeline:**
- Phase 1 (Foundation): 4 weeks
- Phases 2-6 (Features): 22 weeks
- **Total remaining: ~26 weeks (~6 months)**

---

*This is a living document. Update as requirements change and new insights emerge during development.*