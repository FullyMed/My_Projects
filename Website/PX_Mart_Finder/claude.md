# CLAUDE.md

# PX Mart Finder

## 1. Project Overview

### What This Project Is
PX Mart Finder is a retail product discovery and in-store navigation prototype designed for PX Mart (全聯福利中心) in Taiwan.

The project helps users:
- Search products quickly
- Browse by categories/subcategories
- View aisle and shelf locations
- Find products inside a physical PX Mart branch

This is a frontend-focused prototype intended primarily for:
- Portfolio demonstration
- UX/UI experimentation
- Retail product discovery concepts
- Prototype pitching/demo purposes

---

### Current Product Positioning
This project is intentionally positioned as a:

> Single-Branch Prototype System

The primary supported branch is:
- PX Mart Wufeng (Taichung, Taiwan)

Other stores are demo placeholders only and are NOT intended to represent real production coverage.

---

### Goals
- Demonstrate retail search UX
- Simulate real supermarket product finding
- Showcase modern frontend engineering skills
- Build a clean and realistic portfolio project
- Potentially pitch as a prototype/demo concept to PX Mart

---

### Target Audience
Primary audience:
- Portfolio reviewers
- Recruiters
- University evaluators
- PX Mart stakeholders (prototype/demo context)

Secondary audience:
- Customers trying to locate products inside a store

---

# 2. Tech Stack

## Core Stack
- React
- TypeScript
- Vite
- Tailwind CSS

## UI / Styling
- shadcn/ui
- Tailwind utilities
- Lucide React icons

## Routing
- wouter

## Search / Filtering
- Fuse.js (fuzzy search)

## State & Utilities
- React Hooks
- use-debounce

## Build / Tooling
- npm
- Vite build system
- TypeScript compiler

## Important Technical Decision
The project previously used react-window, but virtualization was removed because:
- Dataset size is currently small
- It introduced dependency/API compatibility issues
- Simpler rendering is more stable and maintainable for the prototype scope

The project now uses standard .map() rendering for product lists.

---

# 3. Project Structure

## Root Structure

client/
server/
shared/
dist/

## client/
Frontend React application.

### Important folders

### client/src/components/
Reusable UI components.

Examples:
- ProductCard
- Header
- Navigation UI
- Category components

### client/src/pages/
Page-level views.

Important pages:
- home.tsx
- search-results.tsx
- category-detail.tsx
- product-detail.tsx
- favorites.tsx
- store-map.tsx

### client/src/lib/
Core app logic and shared frontend utilities.

Contains:
- data.ts
- i18n.ts
- normalize.ts
- validation utilities

### client/src/data/
Static mock data for:
- products
- categories
- stores

This project currently relies on local mock/static data.

## server/
Minimal Express backend scaffold.

Currently NOT heavily used.

Mostly exists for:
- future extensibility
- deployment structure compatibility

## shared/
Shared types/utilities between frontend and backend.

## dist/
Production build output.
Should NOT be manually edited.

---

# 4. Coding Style & Conventions

## General Philosophy
Code should prioritize:
- readability
- maintainability
- stability
- simplicity over unnecessary complexity

## Naming Conventions

### Variables
Use camelCase

Examples:
- selectedStore
- searchParams
- expandedTerms

### Components
Use PascalCase

Examples:
- ProductCard
- SearchResults
- CategoryDetail

### File Names
Use kebab-case

Examples:
- search-results.tsx
- product-detail.tsx
- store-map.tsx

## TypeScript Rules

### Avoid any
Use proper typing whenever possible.

Preferred:
type Product = typeof PRODUCTS[number];

Avoid:
any

unless absolutely necessary.

## Formatting Rules

### Indentation
- 2 spaces OR consistent editor formatting
- Keep formatting consistent throughout the file

### React Rules
- Prefer functional components
- Use hooks instead of class components
- Keep components focused and modular

## Comment Style

Use comments for:
- business logic explanation
- architectural decisions
- non-obvious logic

Avoid:
- redundant comments
- obvious comments

---

# 5. Key Features

## Product Search
- Fuzzy search using Fuse.js
- Search by:
  - product name
  - category
  - subcategory
  - brand
  - keywords

## Category Browsing
- Category pages
- Subcategory filtering

## Product Detail Pages
Displays:
- product image
- category
- aisle
- shelf
- store location information

## Store-Based Product Locations
Products contain:
- aisle data
- shelf data
- location references by store

## Favorites System
Users can:
- save favorite products
- store favorites in localStorage

## Search Suggestions
If no exact results:
- recommendation suggestions appear

## Sorting
Supported sorting:
- relevance
- product name
- aisle order

## Localization
Supports:
- English
- Traditional Chinese (繁體中文)

## Responsive UI
Designed for:
- desktop
- tablet
- mobile

---

# 6. Current Progress

## Completed

### Core Features
- Search system
- Product cards
- Product detail pages
- Category browsing
- Favorites
- Sorting/filtering
- Store selection
- Responsive layout

### UI/UX
- Dark mode support
- Modern retail-style UI
- Sticky search/filter header
- Improved spacing/layout consistency

### Technical Cleanup
- Product IDs fixed
- Image URLs fixed
- Build issues resolved
- react-window removed
- Build now succeeds successfully

### Build Status
Current status:
npm run build

SUCCESSFUL

## Pending / Future Improvements

### README.md
A proper public-facing README still needs improvement.

### Data Expansion
Current dataset is intentionally limited.

Possible future work:
- more products
- richer category coverage
- real branch data

### Backend Expansion
Current backend is minimal.

Possible future work:
- APIs
- real database
- authentication
- admin dashboard

### Real PX Mart Integration
Currently NOT integrated with real PX Mart systems.

All data is prototype/demo data.

---

# 7. Important Rules for Claude Code

## Claude MUST ALWAYS

### Respect Project Scope
This is a single-branch retail prototype.

Do NOT over-engineer the system.

### Prioritize Stability
Prefer:
- stable code
- readable code
- maintainable code

over:
- unnecessary optimization
- unnecessary abstraction

### Preserve Existing UX Direction
The project aims for:
- clean
- modern
- minimal
- retail-oriented UI

Do not redesign everything unnecessarily.

### Keep Traditional Chinese Support
Traditional Chinese support is important.

Avoid removing or breaking localization support.

### Keep Data Consistent
Always ensure:
- product IDs are unique
- image paths are valid
- store location data remains consistent

### Maintain Build Stability
Always ensure:
npm run build

continues working.

## Claude MUST NEVER

### Do NOT Reintroduce react-window
The project intentionally removed virtualization.

### Do NOT Add Enterprise Complexity
Avoid:
- microservice-style architecture
- unnecessary backend layers
- premature optimization
- complex state management libraries

### Do NOT Pretend This Is Production Scale
This is intentionally:
- prototype scale
- single-branch focused

### Do NOT Break Existing Data Structure
Avoid unnecessary schema rewrites unless required.

---

# 8. Known Issues / Notes

## Known Console Noise
There are currently some non-critical console errors related to:
- /writing
- /site_integration
- permission errors

These appear to originate from environment/tooling integrations rather than the core PX Mart Finder functionality.

Current verdict:
- not considered blocking issues
- can be ignored unless functionality breaks

## Dependency Notes

### Previous Issue
The project previously encountered:
- react-window API mismatch
- dependency drift after updates

This was resolved by:
- removing virtualization entirely

## Important Architectural Decision
The project intentionally favors:
- simplicity
- prototype realism
- maintainability

over:
- artificial complexity
- enterprise-scale simulation

## Build Expectations

The project should successfully pass:

npm install
npm run build

before major changes are considered complete.

---

# Final Philosophy

This project is intentionally designed as:

A clean, realistic, single-branch retail product finder prototype

NOT:
- a massive enterprise retail platform
- a production-scale nationwide system
- a hyper-optimized architecture experiment

The focus is:
- strong UX
- believable prototype quality
- stable frontend engineering
- clear portfolio value