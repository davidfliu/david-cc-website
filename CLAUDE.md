# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is David's Credit Card Recommendations website - a production-ready Next.js application that provides personalized credit card recommendations through a mobile-first wizard interface. The project is fully set up with modern tooling and deployed to GitHub with Vercel integrations.

## Architecture

**Next.js App Router Structure**:
- `/app/page.tsx` - Main application page component
- `/app/layout.tsx` - Root layout with Vercel analytics integration
- `/app/api/click/route.ts` - Click tracking API endpoint
- `/app/api/cards/route.ts` - Cards data API endpoint
- `/data/cards.json` - Card catalog data (easily editable)

**Key Components**:
- `Wizard`: 3-step questionnaire for collecting user preferences
- `CardTile`: Individual card display component with referral tracking
- `CategoryTabs`: Navigation between card categories
- `ControlsBar`: Search and filtering interface with mobile-friendly design
- Click tracking system using `navigator.sendBeacon`

**Data Flow**:
- Cards are fetched from `/api/cards` endpoint with fallback to embedded data
- User preferences are stored in URL parameters for sharing
- Scoring algorithm ranks cards based on user answers
- Local storage tracks wizard completion

## Development Commands

```bash
npm run dev    # Start development server (usually on localhost:3000)
npm run build  # Create production build
npm run start  # Start production server
npm run lint   # Run ESLint
```

**Dependencies**:
- Next.js 15.0.3 with App Router
- React 18+ with TypeScript
- Tailwind CSS for styling
- Vercel Analytics and Speed Insights for monitoring

## Project Setup

The project is fully configured with:
- ✅ Next.js with TypeScript support
- ✅ Tailwind CSS with PostCSS
- ✅ ESLint configuration
- ✅ Git repository with conventional commits
- ✅ Vercel analytics integration
- ✅ Mobile-first responsive design

## Key Features

- **Mobile-first wizard**: 3-question flow to determine user preferences
- **JSON-driven catalog**: Card data separated from UI logic for easy updates
- **Click tracking**: Analytics for referral link interactions using `navigator.sendBeacon`
- **URL sharing**: Encoded user preferences for sharing recommendations
- **Responsive design**: Tailwind-based responsive layout with mobile-optimized components
- **Fallback system**: Embedded card data if API fails
- **Search functionality**: Real-time card filtering with proper UI spacing (fixed icon overlap)
- **Vercel Analytics**: Integrated Web Analytics and Speed Insights for monitoring

## Vercel Integration

The app includes both Vercel analytics packages:
- **`@vercel/analytics`**: Tracks page views, visitors, traffic sources
- **`@vercel/speed-insights`**: Monitors Core Web Vitals and performance metrics

Both components are added to `/app/layout.tsx` and activate automatically in production.

## Card Data Structure

Cards include these key properties:
- `recommendedFor`: Array of category IDs (`one_card`, `dining_groceries`, `flights_hotels`, `everything_else`)
- `annualFee`: Fee band (`$`, `$$`, `$$$`, `$$$$`)
- `flavor`: Reward type (`points` or `cashback`)
- `simplicity`: Rating 1-4 (1=expert, 4=super simple)
- `referralUrl`: Affiliate link for applications
- `featured`: Optional boolean for highlighting cards

## Scoring Algorithm

The recommendation engine scores cards based on:
1. Category match (10 points if card matches user priority)
2. Fee comfort level (0-4 points based on preference alignment)
3. Redemption style (simplicity score or flavor match)
4. Featured status (1 point tie-breaker)

## UI/UX Improvements Made

Recent UI fixes include:
- ✅ **Search input spacing**: Added `pr-10` to prevent text overlap with search icon
- ✅ **Mobile-friendly filters**: Added `flex-wrap` to fee filter buttons
- ✅ **Enhanced focus states**: Improved accessibility with `focus:ring-offset-2`
- ✅ **Consistent button styling**: Standardized interactive element patterns

## Deployment

The project is configured for Vercel deployment:
- GitHub repository: `davidfliu/david-cc-website`
- Automatic deployments from main branch
- Next.js build optimization enabled
- Analytics tracking active in production