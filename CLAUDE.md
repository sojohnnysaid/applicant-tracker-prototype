# CLAUDE.md - Agent Guidelines

## Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run serve` - Preview production build

## Code Style Guidelines
- **Components**: PascalCase for Svelte components (e.g., `NavBar.svelte`)
- **Functions/Variables**: camelCase
- **Imports**: Use named imports, group by source
- **Formatting**: 2-space indentation
- **Error Handling**: Use try/catch with console.error for debugging
- **State Management**: Utilize Svelte stores for global state
- **Styling**: Use component-scoped styles with Sakura CSS as base
- **Comments**: Add descriptive comments above complex logic
- **API Mocking**: Use MSW (Mock Service Worker) for API simulation

## Project Structure
- `src/components/` - Reusable UI components
- `src/routes/` - Page components for different views
- `src/stores/` - Svelte stores for state management
- `src/mock/` - MSW handlers for API mocking

## Application Overview
This is a prototype for an applicant tracking system for the GRFP (Graduate Research Fellowship Program).
The application uses:
- Svelte as the frontend framework
- Mock Service Worker (MSW) for API simulation
- Sakura CSS for minimal styling
- Role-based UI (Screener, Manager, Program Officer)

## Development Principles
- Follow DRY principles, extract reusable components
- Use component composition for complex UIs
- Maintain role-based views using Svelte stores
- Keep MSW handlers organized by feature
- Focus on core user flows per the milestone documentation