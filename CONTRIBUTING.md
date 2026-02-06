# Contributing to ANES

## Git Flow

We follow a simplified Git Flow branching model.

```
main       ← production releases (protected)
 └── develop   ← integration branch (protected)
      └── feature/xyz   ← your work
```

### Creating a Feature Branch

```bash
git checkout develop && git pull
git checkout -b feature/<short-description>
# e.g. feature/workout-player, fix/sync-queue-overflow
```

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(workout): add exercise timer component
fix(sync): handle offline queue overflow
test(workout): add player integration tests
docs(readme): update quick start section
refactor(auth): extract token service
chore(deps): bump vite to 7.4
```

**Scopes**: `auth`, `onboarding`, `dashboard`, `workout`, `nutrition`, `ai`, `sync`, `db`, `deps`, `ci`

### Pull Request Process

1. Push your feature branch
2. Open a PR targeting `develop`
3. Fill out the PR template checklist
4. Ensure CI passes (lint, tests, format)
5. Request review from at least 1 team member
6. Squash-merge after approval

**Never push directly to `main` or `develop`.**

## Development Workflow

### Screen-Based Implementation

We implement one SRS screen at a time. Each screen spec in `docs/` defines the acceptance criteria.

### TDD Cycle (Mandatory)

1. **Red** — Write a failing test first
2. **Green** — Implement minimal code to pass
3. **Refactor** — Improve code quality
4. Run the full test suite before committing

### Testing Commands

```bash
# Frontend (Vitest)
cd client
pnpm test              # Run all unit tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # With coverage report

# Backend (JUnit 5)
cd server
./mvnw test                                    # All tests
./mvnw test -Dtest=WorkoutServiceTest          # Single class

# E2E (Playwright)
cd client
pnpm test:e2e
```

## Code Style

### TypeScript

- Strict mode (`noUncheckedIndexedAccess`, no `any`)
- Use the `Result<T, E>` pattern for error handling (see `shared/types/result.ts`)
- Custom hooks (`useLogic.ts`) for ALL business logic — components are pure UI
- One component per file, functional components only
- Props interface: `{ComponentName}Props`

### Java

- Java 21 features encouraged: Records, Pattern Matching, Virtual Threads
- Controllers are thin — delegate to services
- DTOs are Records
- Validation via `jakarta.validation` annotations

### Database

- **Schema First**: Define RxDB schema + SQL migration before coding
- **Soft Deletes Only**: `deleted: boolean` flag, never remove rows/docs
- **Timestamps**: Always include `createdAt`, `updatedAt` for sync

## Project Structure

Follow [Feature-Sliced Design](https://feature-sliced.design/):

```
src/features/<feature-name>/
├── components/     # Feature-specific UI (PascalCase.tsx)
├── hooks/          # useLogic.ts for all business logic
├── api/            # API calls via TanStack Query
├── types/          # Feature-specific TypeScript types
└── index.ts        # Public exports (barrel file)
```
