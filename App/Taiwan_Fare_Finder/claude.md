# CLAUDE.md

## 1. Project Overview

### Project Name
**Taiwan Fare Finder**

### Project Description
Taiwan Fare Finder is a multilingual mobile application built with Flutter that helps users estimate and compare transportation fares across Taiwan.

The app supports:
- TRA
- HSR
- MRT
- Bus
- YouBike

The current version is a polished offline-first mock/demo system with production-quality UI/UX and stable architecture.

The architecture is intentionally designed for future TDX API integration.

---

## Purpose & Goals

### Current Goals (v1)
- Portfolio-ready transportation app
- Strong Flutter engineering showcase
- Multilingual UX
- Offline-first architecture
- Final Project usage
- API-ready structure

### Future Goals (v1.1+)
- TDX API integration
- Real fare retrieval
- Expanded transport coverage
- Investor/startup demonstration

---

## Target Audience
- Taiwan commuters
- Tourists
- International students
- Portfolio reviewers
- Final Project evaluators

---

# 2. Tech Stack

## Languages
- Dart
- JSON

## Framework
- Flutter

## State Management
- Provider

## Navigation
- go_router

## Main Dependencies
- provider
- go_router
- package_info_plus

## Planned APIs
- Taiwan TDX API Platform
- TRA API
- MRT API
- HSR API
- Bus API
- YouBike API

IMPORTANT:
Current version does NOT yet use official live API data.

---

# 3. Project Structure

## Main Architecture
The app separates:
- UI
- Controllers
- Services
- Models
- Localization
- Shared UI Components

---

## Folder Structure

### /lib/controllers
Business logic and state management.

Examples:
- fare_controller.dart
- settings_controller.dart
- favorites_controller.dart
- history_controller.dart

---

### /lib/pages
Application screens/pages.

Examples:
- search_page.dart
- compare_page.dart
- settings_page.dart
- saved_page.dart

---

### /lib/models
Data models and enums.

Examples:
- app_settings.dart
- route models
- fare models

---

### /lib/services
Data services and repositories.

Planned:
- Mock service layer
- Future API service layer

---

### /lib/ui
Reusable UI widgets.

Examples:
- tff_card.dart
- tff_page_scaffold.dart

---

### /lib/localization
Localization system.

Current system:
- Custom TffLocalizations

Supported languages:
- English
- Traditional Chinese
- Indonesian

---

# 4. Coding Style & Conventions

## Naming Conventions

### Files
Use snake_case.dart

Examples:
- settings_page.dart
- fare_controller.dart

---

### Classes
Use PascalCase

Examples:
- SettingsPage
- FareController

---

### Variables & Functions
Use camelCase

Examples:
- offlineMode
- clearCache()

---

### Private Classes
Use underscore prefix.

Example:
class _SegmentRow

---

## Formatting Rules
- Use dart format
- Keep widget trees clean
- Avoid broken bracket structures
- Preserve responsive layouts

---

## Layout Rules
Always preserve:
- LayoutBuilder
- ConstrainedBox
- crossAxisAlignment.stretch

Especially in Settings page.

---

# 5. Key Features

## Core Features
- Fare comparison
- Offline-first behavior
- Multilingual support
- Favorites
- Search history
- Theme switching
- Data source switching
- Responsive UI
- Mock fare simulation

---

## Transportation Modes
Current/planned:
- TRA
- MRT
- HSR
- Bus
- YouBike

---

# 6. Current Progress

## Completed
- Stable Provider architecture
- Responsive layouts
- Desktop/tablet/mobile support
- Settings page polish
- Stable dark mode
- Empty/error states
- Offline cache system
- Multilingual support
- Favorites/history system
- API-ready architecture

---

## Pending
### API Integration
Recommended order:
1. TRA
2. MRT
3. HSR
4. Bus
5. YouBike

IMPORTANT:
Do NOT attempt all APIs simultaneously.

---

### Store Release
Pending:
- App screenshots
- Store metadata
- Final app icons
- Native app-name localization

---

# 7. Important Rules for Claude Code

## Claude MUST ALWAYS
- Preserve existing architecture
- Preserve responsive layouts
- Keep offline fallback working
- Maintain production-quality UI
- Keep widget nesting clean
- Validate brackets carefully
- Avoid quick hacks

---

## Claude MUST NEVER
- Break localization
- Remove offline support
- Hardcode random fake fares
- Add unnecessary dependencies
- Over-engineer the project
- Attempt all transport APIs at once

---

## API Integration Rules
- Start with TRA only
- Keep mock fallback
- Use service abstraction
- Preserve DataMode switching

---

## Product Philosophy
This app is:
A polished transportation fare comparison product

NOT:
A full navigation ecosystem

Avoid feature creep.

---

# 8. Known Issues / Notes

## Current Fare System
Current fares are:
- estimated
- rule-based
- simulated

They are NOT official live fares yet.

---

## Future API Complexity
TDX integration will introduce:
- authentication
- token refresh
- network failures
- station mapping issues
- data inconsistency

---

## Localization Note
Project currently uses:
- custom localization system

Avoid mixing localization systems.

---

# Final Notes

This project prioritizes:
- stability
- clean UX
- scalable architecture
- professional presentation

over:
- excessive features
- rushed API integrations
- unnecessary complexity

Current version:
Production-quality portfolio/demo release (v1)

Future API integration:
v1.1 production expansion