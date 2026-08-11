# Gippo.uz - Production-Ready Health-Tech Marketplace Backend

![Gippo Backend](https://img.shields.io/badge/NestJS-10-red.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)
![Prisma](https://img.shields.io/badge/Prisma-5.9-green.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-cyan.svg)

**Gippo.uz** is a production-grade health-tech marketplace backend that connects Patients with Verified Doctors, manages paid tele-consultations, calculates immutable 95%/5% financial ledger splits, and provides a Free AI Medical Assistant proxy with safety guardrails.

---

## 🌟 Key Features & Architectural Highlights

### 1. Role-Based Access Control (RBAC)
- **Roles**: `PATIENT`, `DOCTOR`, `ADMIN`, `SUPER_ADMIN`.
- **Security**: Public self-registration as `ADMIN` is strictly disabled. Admin creation requires a server-side `ADMIN_REGISTRATION_SECRET` token (`AdminInviteGuard`).

### 2. Doctor Approval State Machine
- `PENDING` -> `APPROVED` / `REJECTED` / `SUSPENDED`.
- Only `APPROVED` doctors appear in the public search directory, take appointment bookings, host consultations, or earn balance.
- Sensitive medical license documents are kept private and excluded from public API responses.

### 3. Double-Booking & Concurrency Protection
- Atomic database transactions with slot overlap checks `[startTime, endTime)` prevent race conditions and double bookings.
- Booking past time slots or out-of-schedule slots is rejected.

### 4. 95% Doctor / 5% Platform Financial Split & Immutable Ledger
- All currency calculations use `Decimal(18,2)` math (no floating point errors).
- **Split**: 95% to Doctor, 5% to Gippo Platform.
- Abstract `PaymentProvider` interface supporting Click, Payme, Stripe, and Mock with HMAC signature validation.
- Earnings held in `pendingBalance` until Doctor completes consultation, then credited to `availableBalance`.

### 5. Verified Doctor Ratings (1 Appointment = 1 Review)
- Strict DB constraint: Unique index on `Review(appointmentId)`.
- Reviews allowed ONLY for `COMPLETED` appointments where `patientId` matches.
- Doctor average ratings recalculated strictly on backend.

### 6. AI Medical Assistant (Free Backend Proxy)
- External LLM API key stays hidden on backend (`process.env.AI_API_KEY`).
- Enforces strict safety prompt: No doctor claims, no definitive diagnosis, emergency keyword detection (103 call instruction), and mandatory medical disclaimers.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18 or higher
- **PostgreSQL**: v14 or higher (or Docker)
- **npm** or **pnpm**

### 1. Environment Configuration
Copy `.env.example` to `.env` and fill in required secrets:
```bash
cp .env.example .env
```

### 2. Database Migration & Prisma Generation
```bash
# Generate Prisma Client
npm run prisma:generate

# Run Database Migrations
npm run prisma:migrate

# Seed Initial System Data (Admin, Sample Approved Doctor, Specialties)
npm run prisma:seed
```

### 3. Run Development Server
```bash
npm run start:dev
```
Access the application at `http://localhost:3000/api/v1`.

### 4. Interactive Swagger API Documentation
Open your browser and navigate to:
```
http://localhost:3000/api/v1/docs
```

---

## 🐳 Docker Support

Run full stack (PostgreSQL + NestJS Backend) in containerized environment:
```bash
docker-compose up -d --build
```

---

## 🧪 Testing

Execute test suite:
```bash
# Unit & Integration Tests
npm test

# Test Coverage Report
npm run test:cov
```

---

## 📁 Repository Module Structure

```
src/
├── app.module.ts
├── main.ts
├── common/
│   ├── decorators/          # @CurrentUser(), @Roles(), @Public()
│   ├── filters/             # AllExceptionsFilter (Standardized error response)
│   ├── guards/              # JwtAuthGuard, RolesGuard, AdminInviteGuard
│   ├── interceptors/        # TransformInterceptor ({ success, data, message, code })
│   ├── interfaces/          # PaymentProvider, VideoProvider, NotificationProvider
│   └── utils/               # CurrencyUtil (Decimal math), PasswordUtil (Argon2id)
├── database/                # PrismaService & PrismaModule
└── modules/
    ├── auth/                # Patient reg, Admin invite reg, JWT + Argon2 + Token Rotation
    ├── users/               # User profiles
    ├── doctors/             # Public directory & Admin verification state machine
    ├── specialties/         # Medical specialties
    ├── availability/        # Doctor weekly schedules
    ├── appointments/        # Booking engine with atomic concurrency locking
    ├── consultations/       # Video room access token generator
    ├── payments/            # Abstract gateway, webhooks, 95/5 accounting
    ├── ledger/              # Doctor earnings, balance breakdown & withdrawals
    ├── reviews/             # Rating engine (1 appointment = 1 review)
    ├── ai/                  # AI Assistant backend proxy & emergency detection
    ├── notifications/       # Multi-channel notification pipeline
    ├── admin/               # Platform analytics, audit logs & revenue stats
    └── audit-logs/          # Immutable security event logger
```

---

## 🔐 API Endpoint Summary

| Module | Method | Endpoint | Description |
|---|---|---|---|
| **Auth** | POST | `/api/v1/auth/register` | Patient registration |
| **Auth** | POST | `/api/v1/auth/register-admin` | Admin registration (Requires secret code) |
| **Auth** | POST | `/api/v1/auth/login` | Authenticate & issue tokens |
| **Auth** | POST | `/api/v1/auth/refresh` | Rotate Refresh Token |
| **Doctors** | POST | `/api/v1/doctors/register` | Submit Doctor Application (`status=PENDING`) |
| **Doctors** | GET | `/api/v1/doctors` | List verified/APPROVED doctors |
| **Doctors** | POST | `/api/v1/doctors/admin/:id/review` | Admin Approve/Reject/Suspend Doctor |
| **Appointments** | POST | `/api/v1/appointments` | Book appointment (Atomic overlap check) |
| **Appointments** | POST | `/api/v1/appointments/:id/complete`| Doctor marks consultation completed |
| **Payments** | POST | `/api/v1/payments/create` | Create payment session |
| **Payments** | POST | `/api/v1/payments/webhook` | Gateway Webhook callback (95/5 credit) |
| **Reviews** | POST | `/api/v1/reviews` | Submit review for completed appointment |
| **AI** | POST | `/api/v1/ai/chat` | Send message to AI Assistant |
| **Admin** | GET | `/api/v1/admin/analytics` | Revenue, user & platform metrics |
| **Admin** | GET | `/api/v1/admin/audit-logs` | Security audit trail history |

---

## 📜 License
This project is proprietary software for Gippo.uz. All rights reserved.
