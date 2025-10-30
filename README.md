# Super Golf Advising

Premium golf advising web application built with Next.js, Tailwind CSS, and NextAuth.

## Features

- Next.js App Router with API routes for backend
- Tailwind CSS responsive UI and premium color scheme
- Authentication (credentials + optional Google OAuth)
- Personalized Dashboard with 4-step onboarding wizard
- API integration for user data and recommendations
- Performance optimizations (lazy loading, dynamic imports, optimized images)
- Accessibility (WCAG 2.1 AA minded semantics and keyboard support)
- Jest unit tests for key utilities

## Getting Started

1. Install dependencies

   ```bash
   npm install

   ```

2. Initialize Prisma and generate client

   ```bash
   npx prisma migrate dev --name init

   ```

3. Set environment variables

   ```bash
   cp .env.example .env.local

   ```

   - Set `NEXTAUTH_SECRET` to a strong random string.
   - Optionally set Google OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.

4. Run the dev server

   ```bash
   npm run dev

   ```

5. Open `http://localhost:3000` in your browser.

## Testing

```bash
npm run test

```

## Notes

- This project uses SQLite for local development via Prisma.
- Adjust the Tailwind theme in `tailwind.config.ts` to refine style.
