# AI Crop Advisory Platform - Agent Guidelines

## Commands
- Development: `npm run dev` (frontend), `npm run dev:backend` (server), `npm run dev:all` (both)
- Production: `npm run build` (build), `npm start` (start server)
- Lint: `npm run lint` (ESLint)
- Preview: `npm run preview`

## Architecture
Full-stack React/Node.js app with MongoDB Atlas database
- **Frontend**: Vite + React + TypeScript + Tailwind CSS + shadcn/ui components
- **Backend**: Express.js server with JWT auth, rate limiting, security middleware
- **Database**: MongoDB with Mongoose ODM
- **Key directories**: `src/components/` (React components), `src/server/` (Express API), `src/types/` (TypeScript definitions)

## Code Style
- TypeScript everywhere (.tsx for React, .js for server modules)
- ES modules with `import/export`
- Path aliases: `@/*` (src), `@components/*`, `@lib/*`
- React functional components with hooks
- Tailwind CSS for styling with shadcn/ui component library
- Security: helmet, CORS, rate limiting, input sanitization (xss-clean, mongo-sanitize)
- Error handling: winston logger, structured error responses
- No test framework detected - check before adding tests
