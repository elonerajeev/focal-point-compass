# 🎯 Focal Point Compass - Complete Project Overview

**Last Updated:** April 1, 2026  
**Status:** ✅ Fully Operational - Backend & Frontend Running  
**Environment:** Development

---

## 📋 Table of Contents

1. [Project Summary](#project-summary)
2. [Architecture Overview](#architecture-overview)
3. [Current Database State](#current-database-state)
4. [Technology Stack](#technology-stack)
5. [Project Structure](#project-structure)
6. [API Endpoints](#api-endpoints)
7. [Authentication & Authorization](#authentication--authorization)
8. [Development Workflow](#development-workflow)
9. [Key Features](#key-features)
10. [Next Steps](#next-steps)

---

## 🎯 Project Summary

**Focal Point Compass** is a comprehensive internal CRM system designed for managing clients, projects, tasks, team members, invoices, hiring, and more. It's a full-stack TypeScript application with a React frontend and Express.js backend, using PostgreSQL as the database.

### Current Status
- ✅ **Backend:** Fully implemented with 40+ API endpoints
- ✅ **Frontend:** 85% complete with all major pages
- ✅ **Database:** PostgreSQL with 13 models, seeded with sample data
- ✅ **Authentication:** JWT-based auth with refresh tokens
- ✅ **RBAC:** 4 roles (admin, manager, employee, client)
- ✅ **Running:** Both services operational on ports 3000 (backend) and 8080 (frontend)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
│  Port: 8080 | Vite + TypeScript + Tailwind + shadcn/ui    │
│  • Dashboard, Clients, Projects, Tasks, Team, etc.         │
│  • TanStack Query for data fetching                        │
│  • React Router for navigation                             │
│  • Framer Motion for animations                            │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Express.js)                     │
│  Port: 3000 | Node.js + TypeScript + Prisma ORM           │
│  • JWT Authentication with refresh tokens                  │
│  • Role-based access control (RBAC)                        │
│  • Zod validation on all endpoints                         │
│  • Winston logging + Morgan HTTP logs                      │
│  • Helmet security + CORS + Rate limiting                  │
└─────────────────────────────────────────────────────────────┘
                            ↕ Prisma ORM
┌─────────────────────────────────────────────────────────────┐
│                DATABASE (PostgreSQL)                        │
│  • 13 models with soft deletes                             │
│  • Proper indexing for performance                         │
│  • Audit trails (createdAt, updatedAt, deletedAt)         │
└─────────────────────────────────────────────────────────────┘
```

---

## 💾 Current Database State

### Summary
| Table | Records | Description |
|-------|---------|-------------|
| **Users** | 4 | System users with authentication |
| **Clients** | 8 | Customer/client records |
| **Projects** | 6 | Active and completed projects |
| **Tasks** | 12 | Kanban-style tasks (5 todo, 4 in-progress, 3 done) |
| **Team Members** | 8 | Employee/team member records |
| **Invoices** | 8 | Billing and invoice records |
| **Notes** | 6 | Personal notes (2 pinned) |
| **Job Postings** | 0 | Hiring job postings |
| **Candidates** | 0 | Job applicants |
| **Conversations** | 0 | Internal messaging threads |
| **Messages** | 0 | Individual messages |
| **Refresh Tokens** | 7 | Active JWT refresh tokens |
| **User Preferences** | 1 | User-specific settings |

### Sample Data Highlights

#### 👤 Users
1. **Sarah Johnson** - admin@crmpro.com (Admin)
2. **Mike Chen** - manager@crmpro.com (Manager)
3. **Emily Davis** - employee1@crmpro.com (Employee)
4. **Lisa Park** - employee2@crmpro.com (Employee)

#### 🏢 Top Clients
1. **MetaVerse Corp** - $120K revenue, 96% health score (Strategic)
2. **GlobalTech Inc** - $82K revenue, 88% health score (Strategic)
3. **CloudNine Solutions** - $55K revenue, 76% health score (Enterprise)

#### 📊 Active Projects
1. **CRM Platform v2.0** - 78% complete, $240K budget
2. **AI Concierge** - 92% complete, $95K budget
3. **Mobile App Launch** - 45% complete, $180K budget

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18 with Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **State Management:** TanStack React Query
- **Routing:** React Router v6
- **Animation:** Framer Motion
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod validation
- **UI Components:** Radix UI primitives

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js 5
- **Language:** TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** Zod schemas
- **Security:** Helmet, CORS, bcryptjs
- **Logging:** Winston + Morgan
- **Rate Limiting:** express-rate-limit

### DevOps & Tools
- **Package Manager:** npm
- **Process Manager:** Custom bash script (PM2-style dashboard)
- **Testing:** Jest (backend), Vitest (frontend), Playwright (e2e)
- **Code Quality:** ESLint, TypeScript strict mode

---

## 📁 Project Structure

```
CRM/
├── backend/
│   ├── src/
│   │   ├── config/          # Environment & Prisma config
│   │   ├── controllers/     # Request handlers (15 controllers)
│   │   ├── services/        # Business logic (15 services)
│   │   ├── routes/          # API route definitions (15 routers)
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── validators/      # Zod schemas for validation
│   │   ├── utils/           # JWT, password, logging utilities
│   │   ├── types/           # TypeScript type definitions
│   │   ├── data/            # Static data/mock data
│   │   ├── __tests__/       # Unit & integration tests
│   │   ├── app.ts           # Express app setup
│   │   └── server.ts        # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema (13 models)
│   │   └── migrations/      # Database migrations
│   ├── scripts/             # Seed scripts & smoke tests
│   ├── logs/                # Application logs
│   ├── .env                 # Environment variables
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/      # AppLayout, Navbar, Sidebars
│   │   │   ├── shared/      # Reusable components
│   │   │   ├── dashboard/   # Dashboard-specific components
│   │   │   ├── crm/         # CRM-specific components
│   │   │   └── ui/          # shadcn/ui components (70+)
│   │   ├── pages/           # Route pages (25+ pages)
│   │   ├── contexts/        # React contexts (Auth, Theme, Workspace)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API client & auth service
│   │   ├── lib/             # Utilities, API client, preferences
│   │   ├── types/           # TypeScript types
│   │   ├── data/            # Mock data
│   │   ├── test/            # Test utilities & setup
│   │   ├── App.tsx          # Main app component
│   │   ├── main.tsx         # Entry point
│   │   └── index.css        # Global styles
│   ├── public/              # Static assets
│   ├── .env                 # Environment variables
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── logs/                    # Runtime logs
│   ├── backend.log
│   └── frontend.log
├── start.sh                 # Development launcher script
├── stop.sh                  # Stop all services
└── PROJECT_OVERVIEW.md      # This file
```

---

## 🔌 API Endpoints

### Authentication (`/api/auth`)
- `POST /signup` - Register new user
- `POST /login` - Login with credentials
- `GET /me` - Get current user profile
- `PATCH /me` - Update user profile
- `POST /logout` - Logout and revoke tokens
- `POST /refresh` - Refresh access token
- `POST /switch-role` - Switch user role (admin only)

### Clients (`/api/clients`)
- `GET /clients` - List clients (with pagination, filters, search)
- `GET /clients/:id` - Get single client
- `POST /clients` - Create client (admin/manager)
- `PATCH /clients/:id` - Update client (admin/manager)
- `DELETE /clients/:id` - Delete client (admin only)
- `GET /clients/pipeline` - Get pipeline breakdown

### Projects (`/api/projects`)
- `GET /projects` - List projects
- `GET /projects/:id` - Get single project
- `POST /projects` - Create project
- `PATCH /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project

### Tasks (`/api/tasks`)
- `GET /tasks` - List tasks (grouped by column)
- `GET /tasks/:id` - Get single task
- `POST /tasks` - Create task
- `PATCH /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

### Team Members (`/api/team-members`)
- `GET /team-members` - List team members
- `GET /team-members/:id` - Get single member
- `POST /team-members` - Create member
- `PATCH /team-members/:id` - Update member
- `DELETE /team-members/:id` - Delete member

### Invoices (`/api/invoices`)
- `GET /invoices` - List invoices
- `GET /invoices/:id` - Get single invoice
- `POST /invoices` - Create invoice
- `PATCH /invoices/:id` - Update invoice
- `DELETE /invoices/:id` - Delete invoice

### Dashboard (`/api/dashboard`)
- `GET /dashboard` - Get dashboard metrics and data

### Notes (`/api/notes`)
- `GET /notes` - List notes
- `GET /notes/:id` - Get single note
- `POST /notes` - Create note
- `PATCH /notes/:id` - Update note
- `DELETE /notes/:id` - Delete note

### Hiring (`/api/hiring`)
- `GET /hiring` - List job postings
- `GET /hiring/:id` - Get single job posting
- `POST /hiring` - Create job posting
- `PATCH /hiring/:id` - Update job posting
- `DELETE /hiring/:id` - Delete job posting

### Candidates (`/api/candidates`)
- `GET /candidates` - List candidates
- `GET /candidates/:id` - Get single candidate
- `POST /candidates` - Create candidate
- `PATCH /candidates/:id` - Update candidate
- `DELETE /candidates/:id` - Delete candidate

### Communication (`/api/conversations`, `/api/messages`)
- `GET /conversations` - List conversations
- `GET /messages` - List messages
- `POST /messages` - Send message

### Attendance (`/api/attendance`)
- `GET /attendance` - Get attendance records
- `PATCH /attendance/:id` - Update attendance

### Payroll (`/api/payroll`)
- `GET /payroll` - Get payroll records
- `POST /payroll/generate` - Generate payroll

### Reports (`/api/reports`)
- `GET /reports` - Get reports
- `GET /reports/analytics` - Get analytics data

### Preferences (`/api/preferences`)
- `GET /preferences` - Get user preferences
- `PATCH /preferences` - Update preferences

### System (`/api/system`)
- `GET /system/theme-previews` - Get theme previews
- `GET /health` - Health check endpoint

---

## 🔐 Authentication & Authorization

### JWT Token System
- **Access Token:** 24-hour expiry, used for API requests
- **Refresh Token:** 30-day expiry, stored in database with hash
- **Token Storage:** localStorage (frontend), database (backend)
- **Token Rotation:** Refresh tokens are revoked after use

### User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Admin** | Full access to all features, can delete records, manage users |
| **Manager** | Can create/update clients, projects, tasks, team members |
| **Employee** | Can view and update assigned tasks, limited access |
| **Client** | External users, limited to their own data |

### Password Security
- **Hashing:** bcrypt with cost factor 10
- **Minimum Length:** 8 characters
- **Validation:** Zod schema validation on signup/login

---

## 🚀 Development Workflow

### Starting the Application

```bash
# Start both backend and frontend with live dashboard
./start.sh

# Or manually:
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Stopping the Application

```bash
./stop.sh
# Or press Ctrl+C in the start.sh terminal
```

### Environment Variables

**Backend (.env):**
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/focal_point_compass
JWT_ACCESS_SECRET=<64-char-hex-string>
JWT_REFRESH_SECRET=<64-char-hex-string>
FRONTEND_URL=http://localhost:8080
```

**Frontend (.env):**
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_ENV=development
VITE_USE_REMOTE_API=true
VITE_ENABLE_ANALYTICS=false
```

### Database Management

```bash
# Run migrations
cd backend
npx prisma migrate dev

# Seed database
npm run seed

# Open Prisma Studio (GUI)
npx prisma studio

# Reset database
npx prisma migrate reset
```

### Testing

```bash
# Backend tests
cd backend
npm test
npm run test:watch

# Frontend tests
cd frontend
npm test
npm run test:watch
npm run test:coverage

# E2E tests
npm run test:e2e
```

---

## ✨ Key Features

### 1. Dashboard
- Real-time metrics (revenue, clients, pipeline, at-risk accounts)
- Revenue series chart (6-month trend)
- Pipeline breakdown (pie chart)
- Operating cadence (radar chart)
- Activity feed with recent actions
- Personalized daily focus items
- Team collaborators list
- 28-day activity heatmap

### 2. Client Management
- Full CRUD operations
- Advanced filtering (status, tier, segment)
- Search by name, email, company
- Health score tracking
- Client tiers (Enterprise, Growth, Strategic)
- Client segments (Expansion, Renewal, New Business)
- Next action tracking
- Revenue tracking

### 3. Project Management
- Project stages (Discovery, Build, Review, Launch)
- Progress tracking (0-100%)
- Budget management
- Team assignment
- Task completion tracking
- Due date management

### 4. Task Management
- Kanban board (Todo, In Progress, Done)
- Priority levels (high, medium, low)
- Assignee tracking
- Due dates
- Tags for categorization
- Value stream tracking (Growth, Product, Support)

### 5. Team Management
- Employee profiles
- Role-based access
- Attendance tracking (present, late, remote, absent)
- Check-in/check-out times
- Workload tracking
- Salary & payroll information
- Department & team organization

### 6. Invoicing
- Invoice creation & tracking
- Status management (active, pending, completed)
- Due date tracking
- Client association
- Amount tracking

### 7. Notes
- Personal note-taking
- Color coding
- Pin important notes
- Rich text content
- Author tracking

### 8. Hiring & Recruitment
- Job posting management
- Candidate tracking
- Application stages (applied, screening, interview, offer, hired, rejected)
- Resume storage
- Interview notes

### 9. Messaging
- Internal team conversations
- Unread message tracking
- Online status
- Team-based messaging

### 10. Reports & Analytics
- Custom report generation
- Analytics dashboard
- Payroll reports
- Performance metrics

---

## 🎨 UI/UX Features

### Design System
- **Color Themes:** Light & Dark mode
- **Typography:** Inter font family
- **Spacing:** Consistent 4px grid system
- **Radius:** Rounded corners (0.5rem default)
- **Shadows:** Layered shadow system
- **Animations:** Framer Motion for smooth transitions

### Layout
- **Master Sidebar:** Icon-only navigation for top-level modules
- **Detail Sidebar:** Context-specific navigation
- **Top Navbar:** Search, role switching, theme toggle, notifications
- **Mobile Support:** Responsive design with mobile bottom nav

### Components
- 70+ shadcn/ui components
- Custom stat cards with sparklines
- Progress rings
- Status badges
- Skeleton loaders
- Error boundaries
- Network error handling

---

## 📊 Performance Optimizations

### Frontend
- Code splitting with React.lazy()
- Lazy loading for dashboard charts
- Vendor chunk splitting in Vite
- Image optimization
- Debounced search inputs
- Virtual scrolling for large lists
- React Query caching (5-minute stale time)

### Backend
- Database indexing on frequently queried fields
- Soft deletes for data recovery
- Pagination on all list endpoints
- Query optimization with Prisma
- Rate limiting (100 requests/15 minutes)
- Response compression

---

## 🔒 Security Features

### Backend Security
- **Helmet:** Security headers
- **CORS:** Configured for frontend origin only
- **Rate Limiting:** Prevents brute force attacks
- **Input Validation:** Zod schemas on all endpoints
- **SQL Injection Prevention:** Parameterized queries via Prisma
- **Password Hashing:** bcrypt with salt rounds
- **JWT Secrets:** 64+ character random strings
- **Token Expiry:** Short-lived access tokens
- **Refresh Token Rotation:** One-time use refresh tokens

### Frontend Security
- **XSS Prevention:** React's built-in escaping
- **CSRF Protection:** Token-based authentication
- **Secure Storage:** localStorage for non-sensitive data only
- **API Error Handling:** No sensitive data in error messages

---

## 🐛 Known Issues & Limitations

### Current Limitations
1. **No Email Service:** Email notifications not implemented
2. **No File Upload:** File upload for resumes/documents not implemented
3. **No Real-time Updates:** WebSocket/SSE not implemented
4. **No Advanced Search:** Full-text search not implemented
5. **No Export Features:** CSV/PDF export not implemented
6. **No Audit Logs:** User action logging not implemented
7. **No Multi-tenancy:** Single organization only

### Pending Features
- [ ] Email notifications (signup, invoice reminders, etc.)
- [ ] File upload for resumes and documents
- [ ] Real-time updates via WebSockets
- [ ] Advanced search with filters
- [ ] Export to CSV/PDF
- [ ] Audit log for user actions
- [ ] Multi-tenant support
- [ ] Two-factor authentication (2FA)
- [ ] Password reset flow
- [ ] Email verification

---

## 📈 Next Steps

### Immediate (Week 1)
1. ✅ Complete database seeding with realistic data
2. ✅ Test all API endpoints with Postman/Thunder Client
3. ✅ Verify frontend-backend integration
4. ⏳ Add missing job postings and candidates data
5. ⏳ Implement conversations and messages

### Short-term (Weeks 2-4)
1. Add email notification service
2. Implement file upload for resumes
3. Add password reset flow
4. Implement email verification
5. Add export features (CSV/PDF)
6. Improve error handling and user feedback
7. Add more comprehensive tests
8. Performance optimization and caching

### Medium-term (Months 2-3)
1. Real-time updates with WebSockets
2. Advanced search and filtering
3. Audit log system
4. Two-factor authentication
5. Mobile app (React Native)
6. API documentation (Swagger/OpenAPI)
7. Admin dashboard for system monitoring

### Long-term (Months 4-6)
1. Multi-tenant support
2. Advanced analytics and reporting
3. Integration with third-party services (Slack, Google Calendar, etc.)
4. AI-powered insights and recommendations
5. Custom workflows and automation
6. White-label support

---

## 📚 Documentation

### Available Documentation
- **Backend:**
  - `BACKEND_README.md` - Overview and quick start
  - `BACKEND_DEVELOPMENT_GUIDE.md` - Comprehensive development guide (47 KB)
  - `BACKEND_QUICK_REFERENCE.md` - Quick reference cheat sheet
  - `API_CONTRACT.md` - Complete API specification with TypeScript types

- **Frontend:**
  - `PROJECT_CONTEXT.md` - Frontend architecture and context
  - Component documentation in code comments

- **Database:**
  - `prisma/schema.prisma` - Complete database schema with comments

---

## 🤝 Contributing

### Code Style
- **TypeScript:** Strict mode enabled
- **Linting:** ESLint with recommended rules
- **Formatting:** Prettier (if configured)
- **Naming:** camelCase for variables/functions, PascalCase for components/classes

### Git Workflow
1. Create feature branch from `main`
2. Make changes with descriptive commits
3. Test thoroughly
4. Create pull request
5. Code review
6. Merge to `main`

### Commit Message Format
```
type(scope): description

Examples:
feat(auth): add password reset flow
fix(clients): resolve pagination bug
docs(api): update endpoint documentation
refactor(tasks): simplify task service logic
test(projects): add integration tests
```

---

## 📞 Support & Contact

### Getting Help
- Check documentation first
- Review error logs in `logs/` directory
- Check Prisma Studio for database issues
- Review API responses in browser DevTools

### Troubleshooting

**Backend won't start:**
```bash
# Check if port 3000 is in use
lsof -ti:3000 | xargs kill -9

# Check database connection
cd backend
npx prisma db pull
```

**Frontend won't start:**
```bash
# Check if port 8080 is in use
lsof -ti:8080 | xargs kill -9

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Database issues:**
```bash
# Reset database
cd backend
npx prisma migrate reset

# Re-run migrations
npx prisma migrate dev

# Seed data
npm run seed
```

---

## 📝 License

This project is proprietary and confidential. All rights reserved.

---

## 🎉 Acknowledgments

- **shadcn/ui** - Beautiful UI components
- **Radix UI** - Accessible component primitives
- **Tailwind CSS** - Utility-first CSS framework
- **Prisma** - Next-generation ORM
- **TanStack Query** - Powerful data synchronization

---

**Built with ❤️ by the Focal Point Compass Team**

*Last updated: April 1, 2026*
