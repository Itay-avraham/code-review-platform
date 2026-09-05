# Automated Code Review Platform

A full-stack SaaS application that provides automated code quality and security analysis. Users can submit code snippets to be evaluated for SOLID principles, clean code patterns, and OWASP vulnerabilities (such as SQL injection or XSS).
The system utilizes a resilient dual-provider AI architecture, relying on Google Gemini as the primary analysis engine with an automatic failover to Groq (`openai/gpt-oss-20b`) to maintain high availability during rate limits or serverless timeouts. Scanned reports are safely sanitized for the frontend, persisted in a PostgreSQL database, and managed via a secure user dashboard featuring filtering, pinning, and deletion capabilities.

## Tech Stack

* **Framework:** Next.js (App Router), React, Tailwind CSS
* **Authentication:** Clerk
* **Database:** Supabase (PostgreSQL), Prisma ORM
* **AI Providers:** Google Gemini API, Groq API
* **Testing:** Playwright

## Local Run Instructions

### 1. Clone and Install

```bash
git clone https://github.com/Itay-avraham/code-review-platform
cd code-review-platform
npm install

```

### 2. Environment Variables

Create a `.env` file in the root directory and add the following required keys:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
DATABASE_URL=
DIRECT_URL=
GEMINI_API_KEY=
GROQ_API_KEY=

```

### 3. Start the Development Server

```bash
npm run dev

```

Open `http://localhost:3000` in your browser to view the application.

### 4. Running Tests

End-to-end tests are written in Playwright. The testing suite uses an `isTest` flag to bypass external LLM calls for isolated database integration testing. To prevent database race conditions and connection contention, the test suite must be run sequentially using a single worker:

```bash
npx playwright test --workers=1

```