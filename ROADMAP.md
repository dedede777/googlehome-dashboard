# Roadmap

This roadmap tracks small, practical improvements for making GoogleHome Dashboard easier to use, maintain, and extend.

## Planned Improvements

### Layout Import and Export

Add JSON export/import for dashboard layouts and widget settings so users can back up a local-first dashboard and move it between browsers or machines.

### Keyboard and Accessibility Polish

Improve keyboard navigation, focus states, labels, and screen-reader support for widget controls, modals, and dashboard layout actions.

### Calendar Parsing Tests

Add focused tests for natural-language calendar event parsing, including timezone handling, invalid-event responses, and provider fallback behavior.

### API Widget Empty States

Add clearer empty, loading, and missing-credential states for widgets that depend on Google Calendar, Gemini, Groq, YouTube, or external feeds.

### User Guide Screenshots

Expand the README with screenshots and short usage examples for adding widgets, locking layouts, connecting Calendar, and using learning widgets.

## Maintenance Notes

- Keep local secrets and `.env*` files out of Git.
- Keep generated dashboard data local unless explicit export/import is added.
- Prefer small widget-level improvements over large rewrites.
