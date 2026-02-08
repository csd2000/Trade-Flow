# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CryptoFlow Pro is a comprehensive DeFi and trading strategy education platform that combines traditional markets, cryptocurrency, DeFi, and options trading. The platform features AI-powered trading tools, quantitative analysis, time series predictions, and interactive calculators for systematic trading education.

## Development Commands

### Running the Application
```bash
npm run dev          # Start development server with HMR (http://localhost:5000)
npm run build        # Build frontend (Vite) and backend (esbuild)
npm start           # Start production server
```

### Type Checking and Database
```bash
npm run check        # TypeScript type checking
npm run db:push     # Push database schema changes to Neon PostgreSQL
```

### Testing
```bash
# End-to-end tests with Playwright
npx playwright test --project=chromium                    # Run all tests
npx playwright test tests/central-scanner.spec.ts         # Run specific test
npx playwright test --project=chromium --headed           # Run with browser UI
```

## Architecture

### Monorepo Structure
- **`client/`** - React frontend with TypeScript
- **`server/`** - Express.js backend with TypeScript (ES modules)
- **`shared/`** - Shared code (schema definitions, types)
- **`python_agent/`** - Autonomous Python agents (CCXT-based liquidity sweep detection)
- **`tests/`** - Playwright E2E tests
- **`data/`** - Static seed data (JSON files)

### Frontend (Client)
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight router, not React Router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS (v3) with custom crypto theme, glassmorphism cards, and professional animations
- **UI Components**: Radix UI primitives + shadcn/ui pattern
- **Build Tool**: Vite with custom path aliases:
  - `@/` → `client/src/`
  - `@shared/` → `shared/`
  - `@assets/` → `attached_assets/`

### Backend (Server)
- **Runtime**: Node.js with Express.js
- **Type System**: TypeScript with ES modules (`"type": "module"` in package.json)
- **Database**: PostgreSQL via Neon Database (serverless)
- **ORM**: Drizzle ORM with Drizzle Kit for migrations
- **Schema Location**: `shared/schema.ts` (shared between client and server)
- **API Pattern**: RESTful with `/api` prefix
- **Session Management**: express-session for admin authentication
- **Development**: Vite middleware provides HMR for both frontend and backend

### Database Layer
- **Schema Definition**: `shared/schema.ts` contains all table definitions using Drizzle ORM
- **Validation**: Zod schemas generated from Drizzle tables via `drizzle-zod`
- **Configuration**: `drizzle.config.ts` points to Neon Database via `DATABASE_URL` env var
- **Migrations**: Output to `./migrations` directory
- **Seeding**: `server/seed.ts` runs on startup with retry logic for cold starts
- **Key Tables**: users, portfolios, strategies, tradingAcademy, strategyModules, userProgress, customAlerts, aiProfitScans

### Route Organization Pattern
Backend routes are organized in separate files and registered in `server/routes.ts`:
- Each feature has its own route file (e.g., `ai-profit-studio-routes.ts`, `central-scanner-routes.ts`)
- Routes are mounted with feature-specific prefixes (e.g., `/api/ai-profit`, `/api/confluence`)
- Admin routes are registered separately in `server/admin-routes.ts`

## Key Features & Technical Implementation

### AI Integration
- **Provider**: Anthropic Claude API via `@anthropic-ai/sdk`
- **Use Cases**:
  - Trading signal generation (`server/quant-service.ts`)
  - Sentiment analysis (`server/reversal-detection-service.ts`)
  - Strategy analysis from Pine Script/MT4 (`server/central-scanner-service.ts`)
  - Personalized strategy recommendations (`server/ai-trading-assistant-routes.ts`)

### Market Data Sources
Multiple data providers with fallback logic:
- **Primary**: Yahoo Finance (`yahoo-finance2`)
- **Fallbacks**: Finnhub API, Tiingo API, Alpha Vantage API
- **Crypto**: CoinGecko API, CCXT (for Binance)
- **Real-time**: WebSocket connections for streaming data (`server/realtime-market-service.ts`)
- **Fear & Greed Index**: alternative.me API

### Trading Systems
1. **Quantitative AI System** (`server/quant-service.ts`): Multi-factor signal generation with RSI, MACD, Bollinger Bands, volume analysis, and AI sentiment
2. **7-Gate Sequential Trading Engine** (`server/seven-gate-trading-bot.ts`): Multi-stage trade validation with kill-switch logic and dynamic probability scoring
3. **Liquidity Sweep Agent** (`python_agent/liquidity_sweep_agent.py`): Autonomous Python/CCXT agent for real-time market monitoring (5-minute cycles)
4. **High-Frequency Scalping** (`server/scalping-service.ts`): Real-time scalping based on Momentum, Structure, Volatility, and Sentiment
5. **Central Scanner Strategy Analyzer** (`server/central-scanner-service.ts`): AI-powered parsing of trading rules from YouTube/Pine Script with TradingView-style charts
6. **AI Profit Indicator Studio** (`server/ai-profit-studio-routes.ts`): Scans 8,639+ stocks/ETFs daily for high-confidence setups

### Custom Alert System
- **Location**: `server/custom-alert-routes.ts`, `server/custom-alert-service.ts`
- **Monitoring**: `server/alert-monitor-service.ts` runs background checks
- **Notifications**: In-app + Email (SendGrid via `@sendgrid/mail`)
- **Alert Types**: Price levels, technical indicators (RSI, MACD, volume)

### Training & Education System
- **Content Storage**: PostgreSQL tables (`strategyModules`, `userProgress`)
- **Module Structure**: 232 modules across 29 strategies, each with 2,800-4,300 characters
- **Accessibility**: Text-to-Speech via Web Speech API ("Read for Me" feature)
- **Calculators**: Position sizing, risk/reward, profit targeting, compound growth

### WebSocket Architecture
- **Server**: `server/websocket-market-hub.ts` - central hub for real-time market data
- **Library**: `ws` package
- **Use Cases**: Live price updates, trade signals, alert notifications

## Important Development Notes

### Environment Variables
- `DATABASE_URL`: Required for Neon PostgreSQL connection (checked in `drizzle.config.ts`)
- `PORT`: Server port (defaults to 5000, must be 5000 for Replit firewall)
- `SESSION_SECRET`: Express session secret (defaults to dev value)
- External API keys: Anthropic, SendGrid, Alpha Vantage, Finnhub, Tiingo

### Build Output
- Frontend: `dist/public/` (via Vite)
- Backend: `dist/index.js` (via esbuild, ES module format)

### Code Style
- **ES Modules**: All TypeScript uses ES module syntax (import/export, not require)
- **Async/Await**: Preferred over promise chains
- **Path Aliases**: Use `@/` for client code, `@shared/` for shared schema

### Session Management
- Admin routes use express-session middleware
- Session configured in `server/index.ts` before routes
- Cookie settings: 24-hour expiry, httpOnly, secure in production

### Database Cold Starts
The application handles Neon Database cold starts with retry logic in `server/index.ts`:
```typescript
const maxRetries = 3;
for (let i = 0; i < maxRetries; i++) {
  try {
    await seedDatabase();
    break;
  } catch (error: any) {
    if (error?.code === 'XX000' && i < maxRetries - 1) {
      // Wait and retry
    }
  }
}
```

### Testing Strategy
- **Framework**: Playwright with Chromium
- **Configuration**: `playwright.config.ts` - 60s timeout, sequential execution (workers: 1)
- **Test Files**: `tests/*.spec.ts` (central-scanner.spec.ts, daily-checklist.spec.ts)
- **Web Server**: Playwright auto-starts dev server via `npm run dev`

## Python Integration

The `python_agent/liquidity_sweep_agent.py` is an autonomous agent that:
- Runs independently via `#!/usr/bin/env python3` shebang
- Uses CCXT (Kraken exchange) for market data
- Detects liquidity sweeps every 5 minutes
- Outputs JSON results for Node.js consumption
- Dependencies managed via `pyproject.toml` and `uv.lock`

## UI Design System

### Color Scheme
- Professional white backgrounds for readability
- High contrast text (dark on light)
- Crypto-themed accent colors with glassmorphism effects

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimizations
- Separate mobile components in `client/src/components/mobile/`

### Component Libraries
- **Radix UI**: Accessible primitives (Dialog, Dropdown, Tooltip, etc.)
- **shadcn/ui**: Component patterns (configured via `components.json`)
- **Lucide React**: Icon library
- **Recharts**: Chart visualizations
- **Framer Motion**: Animations

## Common Patterns

### Adding a New Trading Strategy
1. Create service file in `server/` (e.g., `new-strategy-service.ts`)
2. Create route file in `server/` (e.g., `new-strategy-routes.ts`)
3. Register routes in `server/routes.ts` with unique `/api/` prefix
4. Add database tables to `shared/schema.ts` if needed
5. Run `npm run db:push` to update database
6. Create frontend page in `client/src/pages/`
7. Add route to `client/src/App.tsx`

### Adding API Endpoints
```typescript
// server/my-feature-routes.ts
import { Router } from 'express';
const router = Router();

router.get('/endpoint', async (req, res) => {
  // Implementation
  res.json({ data });
});

export default router;
```

```typescript
// server/routes.ts
import myFeatureRoutes from './my-feature-routes';
app.use('/api/my-feature', myFeatureRoutes);
```

### Database Schema Changes
1. Modify `shared/schema.ts`
2. Run `npm run db:push` to sync with Neon Database
3. Update seed data in `server/seed.ts` if needed
4. Generate Zod schemas with `createInsertSchema()` from `drizzle-zod`

## Branding Policy

All personal names and company branding must be removed from trading strategies to maintain professional, generic educational content. Training modules should contain substantial content (300+ words) with detailed step-by-step instructions.
