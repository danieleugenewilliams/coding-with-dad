# Technical Specification: Kids Coding Education Platform
## Project Overview

**Project Name:** [Your Platform Name]  
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
- **Framework:** Rails 7+ with Hotwire (Turbo + Stimulus)
- **Language:** Ruby + JavaScript (ES6+)
- **UI Library:** Tailwind CSS
- **Block Editor:** Blockly (Google's visual programming library)
- **State Management:** Stimulus controllers
- **Animation:** CSS animations + Stimulus Animate

**Backend**
- **Framework:** Ruby on Rails 7+
- **Database:** PostgreSQL
- **Authentication:** Devise
- **File Storage:** Active Storage with S3 or Digital Ocean Spaces
- **Real-time:** Action Cable (for live progress updates)
- **Background Jobs:** Sidekiq

**Infrastructure**
- **Hosting:** Render or Fly.io (Rails app)
- **Database:** Managed PostgreSQL (Render/Fly.io/RDS)
- **CDN:** CloudFront or Cloudflare
- **Email:** SendGrid or Postmark
- **Payment Processing:** Stripe

**Development Tools**
- **Code Editor:** VS Code with Claude Code integration
- **Version Control:** Git + GitHub
- **CI/CD:** GitHub Actions + Render/Fly.io auto-deploy
- **Testing:** RSpec + Capybara (feature tests)
- **Monitoring:** Honeybadger or Sentry
- **Performance:** Bullet (N+1 queries), Rack Mini Profiler

### 1.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Student    │  │   Teacher    │  │    Parent    │      │
│  │   Portal     │  │  Dashboard   │  │   Portal     │      │
│  │  (Rails ERB/ │  │  (Rails ERB/ │  │  (Rails ERB/ │      │
│  │   Hotwire)   │  │   Hotwire)   │  │   Hotwire)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│           │                │                 │               │
│           └────────────────┴─────────────────┘               │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────┐
│                    Rails Controllers                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Users   │  │ Lessons  │  │ Projects │  │ Progress │    │
│  │Controller│  │Controller│  │Controller│  │Controller│    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                            │                                 │
│  ┌─────────────────────────┼──────────────────────────┐     │
│  │         Rails Models & Business Logic              │     │
│  └─────────────────────────┼──────────────────────────┘     │
└────────────────────────────┼─────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────┐
│                    PostgreSQL Database                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Tables  │  │  Indexes │  │  Foreign │  │ Sequences│    │
│  │          │  │          │  │   Keys   │  │          │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────┐
│                   External Services                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Stripe  │  │ SendGrid │  │Honeybadger│ │ActiveStore│   │
│  │ Payments │  │  Email   │  │   Logs   │  │(S3/Spaces)│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Database Schema

### 2.1 Core Tables (Rails/ActiveRecord format)

**users** (via Devise)
```ruby
# db/migrate/xxx_devise_create_users.rb
create_table :users do |t|
  t.string :email, null: false, default: ""
  t.string :encrypted_password, null: false, default: ""
  t.string :role, null: false, default: "student"
  # Devise trackable
  t.integer :sign_in_count, default: 0
  t.datetime :current_sign_in_at
  t.datetime :last_sign_in_at
  t.string :current_sign_in_ip
  t.string :last_sign_in_ip
  
  t.timestamps
end

add_index :users, :email, unique: true
add_check_constraint :users, "role IN ('student', 'teacher', 'parent', 'admin')", name: 'role_check'
```

**profiles**
```ruby
# db/migrate/xxx_create_profiles.rb
create_table :profiles do |t|
  t.references :user, null: false, foreign_key: true, index: { unique: true }
  t.string :first_name, null: false
  t.string :last_name, null: false
  t.string :display_name
  t.date :date_of_birth
  t.string :avatar_url
  t.string :parent_email
  t.string :subscription_status
  t.string :subscription_tier
  t.string :stripe_customer_id
  
  t.timestamps
end

add_check_constraint :profiles, 
  "subscription_status IN ('active', 'inactive', 'trial', 'cancelled')", 
  name: 'subscription_status_check'
```

**courses**
```ruby
# db/migrate/xxx_create_courses.rb
create_table :courses do |t|
  t.string :title, null: false
  t.text :description
  t.string :difficulty_level
  t.string :age_range
  t.integer :estimated_hours
  t.string :thumbnail_url
  t.boolean :is_published, default: false
  t.integer :display_order
  
  t.timestamps
end

add_check_constraint :courses, 
  "difficulty_level IN ('beginner', 'intermediate', 'advanced')", 
  name: 'difficulty_level_check'
add_index :courses, :display_order
add_index :courses, :is_published
```

**lessons**
```ruby
# db/migrate/xxx_create_lessons.rb
create_table :lessons do |t|
  t.references :course, null: false, foreign_key: true
  t.string :title, null: false
  t.text :description
  t.integer :lesson_number, null: false
  t.string :lesson_type
  t.text :instructions
  t.jsonb :hints, default: []
  t.jsonb :starter_blocks
  t.jsonb :solution_blocks
  t.jsonb :success_criteria
  t.integer :estimated_minutes
  t.string :thumbnail_url
  t.boolean :is_published, default: false
  
  t.timestamps
end

add_check_constraint :lessons, 
  "lesson_type IN ('tutorial', 'challenge', 'project', 'quiz')", 
  name: 'lesson_type_check'
add_index :lessons, [:course_id, :lesson_number], unique: true
add_index :lessons, :lesson_type
```

**student_progresses**
```ruby
# db/migrate/xxx_create_student_progresses.rb
create_table :student_progresses do |t|
  t.references :student, null: false, foreign_key: { to_table: :users }
  t.references :lesson, null: false, foreign_key: true
  t.string :status, default: 'not_started'
  t.integer :attempts, default: 0
  t.jsonb :current_workspace
  t.datetime :completion_time
  t.integer :time_spent_seconds, default: 0
  t.integer :hints_used, default: 0
  t.integer :stars_earned
  
  t.timestamps
end

add_check_constraint :student_progresses, 
  "status IN ('not_started', 'in_progress', 'completed', 'needs_help')", 
  name: 'status_check'
add_check_constraint :student_progresses, 
  "stars_earned >= 0 AND stars_earned <= 3", 
  name: 'stars_check'
add_index :student_progresses, [:student_id, :lesson_id], unique: true
add_index :student_progresses, :status
```

**projects**
```ruby
# db/migrate/xxx_create_projects.rb
create_table :projects do |t|
  t.references :student, null: false, foreign_key: { to_table: :users }
  t.string :title, null: false
  t.text :description
  t.jsonb :workspace, null: false
  t.string :thumbnail_url
  t.boolean :is_public, default: false
  t.integer :view_count, default: 0
  t.integer :like_count, default: 0
  t.integer :remix_count, default: 0
  t.references :remixed_from, foreign_key: { to_table: :projects }
  
  t.timestamps
end

add_index :projects, :student_id
add_index :projects, :is_public, where: 'is_public = true'
add_index :projects, :created_at
```

**achievements**
```ruby
# db/migrate/xxx_create_achievements.rb
create_table :achievements do |t|
  t.string :name, null: false
  t.text :description
  t.string :badge_icon_url
  t.jsonb :criteria
  t.integer :points, default: 0
  
  t.timestamps
end
```

**student_achievements**
```ruby
# db/migrate/xxx_create_student_achievements.rb
create_table :student_achievements do |t|
  t.references :student, null: false, foreign_key: { to_table: :users }
  t.references :achievement, null: false, foreign_key: true
  t.datetime :earned_at, default: -> { 'CURRENT_TIMESTAMP' }
  
  t.timestamps
end

add_index :student_achievements, [:student_id, :achievement_id], unique: true
```

**classrooms**
```ruby
# db/migrate/xxx_create_classrooms.rb
create_table :classrooms do |t|
  t.references :teacher, null: false, foreign_key: { to_table: :users }
  t.string :name, null: false
  t.text :description
  t.string :join_code, null: false
  t.boolean :is_active, default: true
  
  t.timestamps
end

add_index :classrooms, :join_code, unique: true
add_index :classrooms, :teacher_id
```

**classroom_students** (join table)
```ruby
# db/migrate/xxx_create_classroom_students.rb
create_table :classroom_students do |t|
  t.references :classroom, null: false, foreign_key: true
  t.references :student, null: false, foreign_key: { to_table: :users }
  t.datetime :joined_at, default: -> { 'CURRENT_TIMESTAMP' }
  
  t.timestamps
end

add_index :classroom_students, [:classroom_id, :student_id], unique: true
```

**subscriptions**
```ruby
# db/migrate/xxx_create_subscriptions.rb
create_table :subscriptions do |t|
  t.references :user, null: false, foreign_key: true
  t.string :stripe_subscription_id, null: false
  t.string :status, null: false
  t.string :plan_id, null: false
  t.datetime :current_period_start
  t.datetime :current_period_end
  t.boolean :cancel_at_period_end, default: false
  t.datetime :cancelled_at
  
  t.timestamps
end

add_index :subscriptions, :stripe_subscription_id, unique: true
add_index :subscriptions, :user_id
add_index :subscriptions, :status
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

## 5. API Endpoints (Rails RESTful Routes)

### 5.1 Authentication (Devise)
```ruby
# config/routes.rb
devise_for :users, controllers: {
  sessions: 'users/sessions',
  registrations: 'users/registrations',
  passwords: 'users/passwords'
}
```

### 5.2 Courses & Lessons
```ruby
resources :courses, only: [:index, :show] do
  resources :lessons, only: [:index, :show] do
    member do
      post :submit
      post :save_progress
    end
  end
end
```

### 5.3 Student Progress
```ruby
namespace :students do
  resource :progress, only: [:show]
  resources :student_progresses, only: [:index, :show, :update]
end
```

### 5.4 Projects
```ruby
resources :projects do
  member do
    post :remix
    post :like
    post :publish
  end
  collection do
    get :public_gallery
  end
end
```

### 5.5 Achievements
```ruby
resources :achievements, only: [:index, :show]
namespace :students do
  resources :achievements, only: [:index]
end
```

### 5.6 Classrooms
```ruby
resources :classrooms do
  member do
    post :join
    get :students
    get :progress_report
  end
  resources :assignments, only: [:create, :destroy]
end
```

### 5.7 Subscriptions (Stripe)
```ruby
namespace :subscriptions do
  post :create_checkout_session
  post :webhook
  get :portal_session
  post :cancel
end
```

---

## 6. Security Considerations

### 6.1 Authentication & Authorization
- Devise with strong password requirements
- CanCanCan or Pundit for authorization
- Role-based access control (RBAC)
- Student accounts cannot access other students' data
- Teachers can only access their assigned classrooms
- Parents can only access their children's accounts
- Strong parameters in controllers

### 6.2 Content Security
- Sandboxed code execution (no access to DOM or external resources)
- Rails sanitization helpers for user-generated content
- Rack::Attack for rate limiting
- CORS configuration for API endpoints
- CSP (Content Security Policy) headers

### 6.3 Data Privacy
- COPPA compliance for children under 13
- Parental consent workflow
- Data encryption at rest (Rails encrypted attributes)
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

### 6.5 Rails-Specific Security
- Protection against SQL injection (use parameterized queries)
- CSRF protection enabled (Rails default)
- XSS protection with Rails sanitization
- Mass assignment protection with strong parameters
- Secure session storage
- Regular gem updates (bundle audit)

---

## 7. Development Phases

### Phase 0: Blockly Prototype & Validation (Weeks 1-3)
**Goal:** Build a working Blockly prototype to validate the core learning experience before investing in full application development.

**Deliverables:**
- Standalone HTML page with Blockly workspace
- 3-5 sample puzzles/lessons demonstrating different concepts
- Block execution engine with visual feedback
- Success criteria validation system
- Demo-able prototype for user testing

**Tasks:**
1. **Week 1: Basic Blockly Setup**
   - Create static HTML page with Blockly
   - Configure custom block toolbox (Motion, Loops, Events)
   - Build simple 2D canvas/grid for visual output
   - Implement basic "Run" button functionality

2. **Week 2: Execution Engine & Game Logic**
   - Build JavaScript interpreter for blocks
   - Create character/sprite system
   - Implement movement and basic commands
   - Add visual feedback (animations, highlights)
   - Create 2-3 simple sequencing puzzles

3. **Week 3: Validation & User Testing**
   - Add success criteria checking
   - Build hint system
   - Create 2 more advanced puzzles (loops, conditionals)
   - Polish UI and animations
   - Test with 3-5 kids (friends/family)
   - Gather feedback and iterate

**Success Criteria:**
- ✅ Kids can complete puzzles without assistance
- ✅ Clear visual feedback on correct/incorrect solutions
- ✅ Engaging and fun experience
- ✅ Technical feasibility confirmed
- ✅ Ready to build full application

**Technology:**
- Pure HTML/CSS/JavaScript (no framework yet)
- Blockly CDN
- Canvas API or simple HTML/CSS grid
- Can be hosted on GitHub Pages for easy sharing

**Decision Point:** After Phase 0, decide whether to:
- A) Proceed with full Rails app development (if prototype validates well)
- B) Iterate more on learning mechanics
- C) Pivot to different approach

---

### Phase 1: Rails Foundation (Weeks 4-7)
**Note:** Only begin if Phase 0 validates successfully!

**Deliverables:**
- Rails 7 application scaffolded
- Database schema implemented
- Authentication system (Devise)
- Basic UI framework (Tailwind)
- Blockly integrated into Rails app

**Tasks:**
- Initialize Rails 7 project
- Set up PostgreSQL database
- Configure Devise for authentication
- Install and configure Tailwind CSS
- Create User, Profile, Course, Lesson models
- Implement database migrations
- Set up basic layout and navigation
- Port Blockly prototype into Rails views
- Create lessons controller and views

### Phase 2: Core Learning Experience (Weeks 8-13)
**Deliverables:**
- Full lesson player with integrated Blockly
- Course and lesson browsing
- Student progress tracking
- First complete course (10-15 lessons)
- Hint and help system

**Tasks:**
- Build lesson player view with Hotwire
- Implement block execution engine (ported from prototype)
- Create success criteria evaluation system
- Build course browsing interface
- Develop student progress tracking
- Implement auto-save with Action Cable
- Add hint system
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
- Implement project CRUD operations
- Create project gallery UI
- Add sharing and remix features
- Implement project storage (Active Storage)
- Add asset library

### Phase 4: Engagement & Gamification (Weeks 18-21)
**Deliverables:**
- Achievement system
- Points and stars
- Student dashboard with stats
- Badges and milestones

**Tasks:**
- Implement Achievement model and logic
- Build achievement notification system (Turbo Streams)
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
- Build teacher dashboard views
- Implement classroom CRUD
- Create progress monitoring views
- Build parent portal
- Develop reporting system with PDF exports

### Phase 6: Polish & Launch Prep (Weeks 26-29)
**Deliverables:**
- Stripe subscription integration
- Complete testing and QA
- Documentation
- Marketing site
- Beta launch!

**Tasks:**
- Integrate Stripe with Rails
- Implement subscription management
- Comprehensive RSpec test suite
- Performance optimization (N+1 queries, caching)
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
- Vercel Analytics for web vitals
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
| Database scaling challenges | Medium | Low | Use Supabase auto-scaling, optimize queries |
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
- Email support (support@yourdomain.com)
- In-app help center
- Community forum (optional)
- Monthly office hours (Zoom)
- Detailed help articles

---

## Appendices

### Appendix A: Glossary
- **Blockly:** Google's visual programming editor
- **RLS:** Row-level security (database access control)
- **Workspace:** The area where students drag and connect blocks
- **Remix:** Creating a new project based on an existing one
- **JWT:** JSON Web Token (authentication mechanism)

### Appendix B: Resources
- **Blockly Documentation:** https://developers.google.com/blockly
- **Rails Guides:** https://guides.rubyonrails.org
- **Hotwire (Turbo/Stimulus):** https://hotwired.dev
- **Devise Authentication:** https://github.com/heartcombo/devise
- **Stripe Ruby Gem:** https://github.com/stripe/stripe-ruby
- **Code.org Open Source:** https://github.com/code-dot-org
- **Tailwind CSS:** https://tailwindcss.com
- **RSpec Testing:** https://rspec.info
- **Rails Security Guide:** https://guides.rubyonrails.org/security.html

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

### Immediate Actions (This Week):

1. **Start with Phase 0: Blockly Prototype**
   - Create a simple HTML file with Blockly
   - Build 1-2 sample puzzles
   - Get something working you can show to kids

2. **User Testing Plan**
   - Identify 3-5 kids (ages 7-10) to test with
   - Prepare observation checklist
   - Schedule testing sessions

3. **Gather Feedback**
   - Watch how kids interact with blocks
   - Note confusion points
   - Measure engagement and fun factor

### After Prototype Validation:

4. **Review and refine** this technical specification based on prototype learnings
5. **Set up Rails development environment** with Claude Code
6. **Create project repository** and initialize Rails app
7. **Begin Phase 1 development** (Foundation)
8. **Schedule weekly progress reviews**
9. **Start curriculum development** in parallel with technical work

**Estimated Timeline:**
- Phase 0 (Prototype): 3 weeks
- Phases 1-6 (Full Development): 26 weeks
- **Total: 29 weeks (~6.5 months)**

**Recommended Approach:**
- Spend the first 3 weeks proving the concept works
- Don't invest in infrastructure until the learning experience is validated
- Use prototype feedback to inform all subsequent design decisions

---

*This is a living document. Update as requirements change and new insights emerge during development.*