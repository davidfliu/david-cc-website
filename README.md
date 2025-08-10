# David's Credit Card Recommendations

A Next.js application that provides personalized credit card recommendations through a mobile-first wizard interface.

## Features

- **3-Step Wizard**: Quick questionnaire to determine user preferences
- **Personalized Recommendations**: AI-powered scoring algorithm
- **Mobile-First Design**: Responsive Tailwind CSS interface
- **Click Tracking**: Analytics for referral link interactions
- **Shareable Results**: URL-encoded preferences for sharing
- **JSON-Driven Catalog**: Easy card data management

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

This app is optimized for deployment on Vercel:

```bash
npm run build
```

## Project Structure

```
/app
  /api
    /cards/route.ts    # Cards API endpoint
    /click/route.ts    # Click tracking endpoint
  page.tsx             # Main application page
  layout.tsx           # Root layout
  globals.css          # Global styles
/data
  cards.json           # Card catalog data
```

## Card Data Management

Edit `/data/cards.json` to update the card catalog. Each card includes:

- Basic info (name, issuer, headline)
- Annual fee band ($, $$, $$$, $$$$)
- Recommended categories
- Simplicity rating (1-4)
- Referral URL