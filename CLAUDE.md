# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is David's Credit Card Recommendations website - a Next.js application that provides personalized credit card recommendations through a mobile-first wizard interface. The entire application is contained in a single JSX file that includes:

- React components for the recommendation wizard
- Next.js API routes for click tracking and card data
- JSON-based card catalog
- Tailwind CSS styling

## Architecture

**Single File Structure**: The project uses an unconventional approach where the entire application is contained in `Credit Card Recommendations UI.jsx`, including:
- Main Next.js page component (`/app/page.tsx`)
- API routes (`/app/api/click/route.ts` and `/app/api/cards/route.ts`) 
- Card data structure (`/data/cards.json`)

**Key Components**:
- `Wizard`: 3-step questionnaire for collecting user preferences
- `CardTile`: Individual card display component with referral tracking
- `CategoryTabs`: Navigation between card categories
- `ControlsBar`: Search and filtering interface
- Click tracking system using `navigator.sendBeacon`

**Data Flow**:
- Cards are fetched from `/api/cards` endpoint with fallback to embedded data
- User preferences are stored in URL parameters for sharing
- Scoring algorithm ranks cards based on user answers
- Local storage tracks wizard completion

## Development Commands

This project appears to be a standalone React application without standard build tooling configured. There are no package.json, build scripts, or configuration files present. The application expects:

- Next.js App Router structure
- Tailwind CSS for styling
- TypeScript support for type definitions

To work with this codebase, you would typically need to:
1. Set up a Next.js project structure
2. Install dependencies (React, Next.js, Tailwind CSS)
3. Configure TypeScript
4. Set up the proper file structure based on the embedded code

## Key Features

- **Mobile-first wizard**: 3-question flow to determine user preferences
- **JSON-driven catalog**: Card data separated from UI logic for easy updates
- **Click tracking**: Analytics for referral link interactions
- **URL sharing**: Encoded user preferences for sharing recommendations
- **Responsive design**: Tailwind-based responsive layout
- **Fallback system**: Embedded card data if API fails

## Card Data Structure

Cards include these key properties:
- `recommendedFor`: Array of category IDs (`one_card`, `dining_groceries`, `flights_hotels`, `everything_else`)
- `annualFee`: Fee band (`$`, `$$`, `$$$`, `$$$$`)
- `flavor`: Reward type (`points` or `cashback`)
- `simplicity`: Rating 1-4 (1=expert, 4=super simple)
- `referralUrl`: Affiliate link for applications

## Scoring Algorithm

The recommendation engine scores cards based on:
1. Category match (10 points if card matches user priority)
2. Fee comfort level (0-4 points based on preference alignment)
3. Redemption style (simplicity score or flavor match)
4. Featured status (1 point tie-breaker)