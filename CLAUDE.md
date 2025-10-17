# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack application for Google Sign-In integration, consisting of:

- **Frontend**: React + Vite application (`react_front/`)
- **Backend**: Express.js server (`express_back/`)

The project uses pnpm for package management and is configured for development with hot module replacement on the frontend.

## Architecture

### Monorepo Structure

The codebase is organized as a monorepo with two independent applications:

- `react_front/`: React frontend with Vite bundler and Rolldown (faster Vite alternative)
- `express_back/`: Express backend API server with dotenv configuration

Both applications have separate `package.json` files and run independently.

### Frontend Architecture

- Built with React 19.1.1 and react-router 7.9.4
- Uses Vite (specifically rolldown-vite@7.1.14) for fast builds and HMR
- Entry point: `react_front/src/main.jsx`
- Main component: `react_front/src/App.jsx`

### Backend Architecture

- Express.js server serving static files from `express_back/public/`
- Environment variables configured via dotenv (`.env` file)
- Server port configured via `WEB_PORT` environment variable (defaults to 3002)
- Middleware setup for JSON and URL-encoded body parsing
- Main file: `express_back/index.js`

## Development Commands

### Frontend (react_front/)

```bash
cd react_front
pnpm install        # Install dependencies
pnpm dev            # Start development server with HMR
pnpm build          # Build for production
pnpm lint           # Run ESLint
pnpm preview        # Preview production build
```

### Backend (express_back/)

```bash
cd express_back
pnpm install        # Install dependencies
node index.js       # Start Express server
# Or use nodemon for development (installed as devDependency):
npx nodemon index.js
```

## Configuration Notes

### Frontend

- Uses Rolldown variant of Vite (pnpm override configured) for improved build performance
- ESLint configured with React hooks and React refresh plugins
- Vite config located at `react_front/vite.config.js`

### Backend

- Environment variables stored in `express_back/.env`
- Default port: 3001 (via WEB_PORT environment variable)
- Static file serving enabled from `public/` directory
- Express middleware configured for JSON and URL-encoded bodies

## Package Manager

This project uses **pnpm**. The frontend has specific pnpm overrides to use rolldown-vite instead of standard Vite.
