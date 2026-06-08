# Co-operative Housing Society Management System 🚀

This is a production-grade, highly scalable, multi-tenant Co-operative Housing Society Management System structured as a Node.js workspace monorepo. It supports single-building and multi-building complex societies, offering powerful billing engines, resident management channels, auditing ledgers, complaint ticketing, facilities scheduling, and other crucial administrative workflows.

---

## 📂 Phase 1 Monorepo Folder Structure

The project is organized as a performant workspaces monorepo:

```
society-management-app/
├── apps/
│   ├── api/                   # NestJS REST API (PostgreSQL database + Prisma ORM)
│   │   ├── prisma/            # Prisma Database Schemas and Migration Files
│   │   │   └── schema.prisma  # Full application model definitions
│   │   ├── src/               # NestJS controllers, services, blocks, modules
│   │   │   └── main.ts        # Backend Entry Point (Swagger Bootstrap)
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── web/                   # Next.js Front-End (Tailwind CSS + shadcn/ui)
│   │   ├── src/app/           # Next.js App Router Pages
│   │   │   └── page.tsx       # Web Dashboard Landing Screen
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── mobile/                # React Native Expo App (Android & iOS)
│       ├── App.tsx            # Main Native Visual Viewport
│       └── package.json
│
├── packages/
│   └── shared/                # Shared package for types & zod validators
│       ├── src/
│       │   ├── index.ts       # Central re-exports entry point
│       │   └── types/         # System structural DTOs, Enums, Zod rules
│       │       └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── docker-compose.yml         # Container definitions (PostgreSQL + Minio)
├── .env.example               # Developer system configurations and tokens
├── package.json               # Monorepo Workspace settings
└── README.md                  # This setup documentation
```

---

## 🛠️ Developer Setup & Execution Guide

### 1. Step-by-Step Installation Commands

Initialize dependencies for all packages within the monorepo workspace concurrently:

```bash
# Navigate to the monorepo directory
cd society-management-app

# Install all workspace dependencies recursively (linked shared package automatically)
npm install
```

### 2. Configure Environment Files

Create your live environment configuration from the blueprint:

```bash
cp .env.example .env
```

### 3. Initialize Docker Containers (Database & Storage)

Spin up the local containerized PostgreSQL database and S3-compatible Minio storage server:

```bash
docker-compose up -d
```

*This spins up:*
- **PostgreSQL** at `localhost:5432` with database `society_db`.
- **Minio (S3 Compatible)** console at `localhost:9001` (user: `minioadmin` / pass: `minioadminpassword`).

### 4. Database Setup & Schema Compilation

Push the complete schema (35+ tables representing societies, structures, financial ledgers, bills, and complaints) into the active PostgreSQL instance:

```bash
# Generate Prisma Client and create database tables
npm run prisma:generate --workspace=society-api
npm run prisma:migrate --workspace=society-api
```

### 5. Running the Complete Stack

Run all components in live watch/hot-reload mode with a single command under npm workspaces:

```bash
npm run dev
```

#### Individual Package Entrypoints:
- **NestJS API Backend:** `http://localhost:3000/api/v1`
- **Swagger Documentation:** `http://localhost:3000/docs`
- **Next.js Web Admin Console:** `http://localhost:3001`
- **React Native Expo Client:** Run `npm run android` or `npm run ios` inside `apps/mobile` directory.

---

## 📋 Comprehensive Database Schema & Tables Map
The complete database contains the following relational entities defined securely inside `/apps/api/prisma/schema.prisma`:
1. `User`, `Role`, `Permission`, `RolePermission`, `UserSession`
2. `Society`, `Building`, `Wing`, `Flat`
3. `Owner`, `Tenant`, `FamilyMember`, `Vehicle`, `ParkingSlot`
4. `MaintenanceHead`, `MaintenanceRule`, `MaintenancePeriod`, `MaintenanceBill`, `MaintenanceBillItem`
5. `Payment`, `Receipt`, `Ledger`, `LedgerEntry`
6. `IncomeCategory`, `Income`, `ExpenseCategory`, `Expense`, `Vendor`, `Staff`
7. `Complaint`, `ComplaintComment`, `ComplaintAttachment`
8. `Notice`, `NoticeRead`, `Document`, `Meeting`, `MeetingAttendee`, `MeetingMinutes`
9. `Facility`, `FacilityBooking`, `Visitor`, `Poll`, `PollOption`, `PollVote`
10. `Notification` & `AuditLog`

---

## 🎯 Current Status

✔ **Phase 1 Complete:** Monorepo Workspace scaffolding, Shared models, full Prisma definitions, App bootstrap files, and environment descriptors are set up and structured.

👉 **Waiting for Prompts to launch Phase 2 (Authentication endpoints, secure JWT generation, bcrypt credentials, and role guards).**
