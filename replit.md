# CryptoFlow Pro - DeFi Strategy Management Platform

## Overview

CryptoFlow Pro is a comprehensive trading education platform offering professional strategies across traditional markets, cryptocurrency, DeFi, options trading, and advanced investment strategies. It aims to transform beginners into professionals through step-by-step implementations of legitimate trading systems. Key capabilities include advanced AI-powered trading tools like the AI Profit Indicator Studio, quantitative analysis, time series predictions, and specialized strategies such as Auction Market Theory and Scalping. The platform also features interactive trading calculators, a customizable alert system, and a 7-Gate Sequential Trading Decision Engine with an autonomous liquidity sweep agent.

## User Preferences

Preferred communication style: Simple, everyday language.
Project Goal: Create the ultimate systematic trading education platform with step-by-step processes and professional guidance.
Branding Policy: All personal names and company branding removed from trading strategies to maintain professional, generic educational content.
Content Requirements: Every training module must contain substantial 300+ word content with detailed step-by-step instructions visible in the UI.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with a custom crypto-themed design system, enhanced animations, professional hover effects, and glassmorphism cards.
- **UI Components**: Radix UI primitives with shadcn/ui.
- **Routing**: Wouter.
- **State Management**: TanStack React Query for server state.
- **Build Tool**: Vite.
- **UI Design System**: Clean, professional design with white backgrounds, proper text contrast, and responsive desktop/mobile optimization.

### Backend Architecture
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript with ES modules.
- **API Design**: RESTful API with `/api` prefix.
- **Development**: Hot Module Replacement (HMR) via Vite middleware.

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM.
- **Database Provider**: Neon Database (serverless PostgreSQL).
- **Schema Management**: Drizzle Kit for migrations and schema management.

### Key Features & Technical Implementations
- **Quantitative AI Trading System**: Integrates technical indicators (RSI, MACD, Bollinger Bands), volume analysis, Fear & Greed Index, and AI sentiment analysis (Anthropic Claude) to generate multi-factor signals with weighted scoring and automated trade calculations.
- **Time Series AI Predictions**: AI-powered forecasting for multiple industries using statistical models, Alpha Vantage data, and AI-enhanced analysis via Anthropic Claude.
- **High-Frequency Scalping Strategist**: Real-time scalping system using Yahoo Finance data, based on four entry conditions (Momentum, Structure, Volatility, Sentiment) and predefined exit rules.
- **Reversal Detection AI**: Divergence-based system leveraging RSI/MACD, AI sentiment analysis, and Fear & Greed Index for trade setup generation.
- **AI Profit Indicator Studio**: Advanced stock scanning system analyzing 8,639+ stocks/ETFs daily based on confidence, timeframe, and profit/risk ratio, providing real-time analysis and a professional dashboard.
- **Unified Strategy Platform**: Comprehensive educational content covering diverse trading domains, presented generically without personal branding.
- **Overnight Income Strategy**: A systematic options trading strategy designed for consistent overnight income.
- **AI Trading Assistant**: Personalized strategy recommendations based on a 3-step risk profile questionnaire and AI matching (Anthropic Claude).
- **Finnhub & Tiingo Fallback Data Systems**: Robust backup data sources for continuous market data availability.
- **Comprehensive Training Content**: 232 modules across 29 strategies, each with rich content (2,800-4,300 characters) structured into five sections.
- **Interactive Trading Calculators**: Integrated tools for position sizing, risk/reward, profit targeting, and compound growth.
- **Text-to-Speech "Read for Me"**: Accessibility feature using Web Speech API for reading module content.
- **Mobile-First Design**: Fully responsive interface with optimized mobile UI and wallet integration.
- **7-Gate Sequential Trading Decision Engine**: A multi-stage trade validation system with kill-switch logic, dynamic probability scoring, and an autonomous Python/CCXT-based liquidity sweep agent for real-time market monitoring.
- **Customizable Alert System**: Full-featured alert center for price levels and technical indicators with in-app, email (SendGrid), and push notifications.
- **Rule Based Scanner Strategy Analyzer**: AI-powered strategy analysis that parses trading rules from YouTube videos, Pine Script, or MetaTrader 4 scripts. Displays entry, exit, stop-loss, and take-profit levels on a TradingView-style candlestick chart with risk/reward metrics.
- **Signal Fusion AI**: Multi-source intelligence system that fuses specialized analysis streams (Technical, Sentiment, On-Chain, News) into unified market insights. Uses RAG with Anthropic Claude for contextual analysis, weighted scoring across streams, and provides unified actionable recommendations integrated into all scanners.
- **Hedge Fund & Market Maker Scanner**: Institutional-grade market scanner analyzing 100+ stocks for trading opportunities using multi-factor scoring (dark pool activity detection, smart money flow analysis, options flow sentiment, momentum scoring, institutional accumulation patterns, liquidity sweep detection). Features tabbed views (Top Setups, Dark Pool, Smart Money, Options Flow, Momentum, Sweeps), real-time Yahoo Finance data, trade execution plans with entry/stop/3 targets, A+ through C grade categorization, and individual ticker deep-dive analysis. Route: `/hedge-fund-scanner`, API: `/api/hedge-fund/*`.

## Testing

- **End-to-End Testing**: Playwright test suite with 15 tests covering Rule Based Scanner functionality
- **Test Location**: `tests/central-scanner.spec.ts`
- **Run Tests**: `npx playwright test --project=chromium`

## External Dependencies

- **Database**: Neon Database (for PostgreSQL)
- **Crypto Price Data**: CoinGecko API
- **Stock Price Data**: Alpha Vantage API, Yahoo Finance, Finnhub API, Tiingo API
- **AI Analysis**: Anthropic Claude API
- **Email Notifications**: SendGrid
- **Market Data**: alternative.me (Fear & Greed Index), CCXT (for Binance)
- **ORM**: Drizzle ORM
- **UI Libraries**: Radix UI, shadcn/ui
- **State Management**: TanStack React Query
- **Styling**: Tailwind CSS
- **Date Handling**: date-fns
- **Validation**: Zod
- **Build Tools**: Vite, esbuild
- **TypeScript Runtime**: tsx