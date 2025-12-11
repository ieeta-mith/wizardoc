# Frontend Structure Comparison

This document compares the frontend architecture from the [project-template](https://github.com/v1centebarros/project-template/) with the current implementation in the Risk Assessment Tool.

---

## Framework & Technology Stack

| Aspect | Template (v1centebarros) | Current Implementation | Status |
|--------|--------------------------|------------------------|--------|
| **Core Framework** | Vite + React 19 | Next.js 16 + React 19 | ⚠️ Different |
| **Routing** | TanStack Router (file-based) | Next.js App Router | ⚠️ Different |
| **Build Tool** | Vite | Next.js/Turbopack | ⚠️ Different |
| **State Management** | TanStack Query | Custom hooks with planned migration | ⚠️ Partial |
| **Forms** | react-hook-form + Zod | react-hook-form + Zod | ✅ Aligned |
| **Styling** | Tailwind CSS v4 + Radix UI | Tailwind CSS v4 + Radix UI | ✅ Aligned |
| **TypeScript** | TypeScript | TypeScript | ✅ Aligned |
| **UI Components** | shadcn/ui (Radix-based) | shadcn/ui (Radix-based) | ✅ Aligned |

---

## Directory Structure Comparison

### Template Structure (`web/src/`)
```
web/
├── src/
│   ├── main.tsx              # Application entry point
│   ├── globals.css           # Global styles
│   ├── routeTree.gen.ts      # Auto-generated routes
│   ├── components/
│   │   ├── ui/              # Reusable UI primitives (Radix)
│   │   ├── navbar.tsx
│   │   ├── productForm.tsx
│   │   └── products-table.tsx
│   ├── hooks/               # Custom React hooks
│   │   └── use-product.ts
│   ├── lib/
│   │   ├── api-client.ts    # API integration (TanStack Query)
│   │   ├── providers.tsx    # Context providers
│   │   ├── types.ts         # TypeScript definitions
│   │   └── utils.ts         # Helper functions
│   └── routes/              # File-based routing pages
│       ├── __root.tsx       # Root layout
│       ├── index.tsx        # Home page
│       └── new-product.tsx
├── public/                  # Static assets
├── index.html               # HTML entry
├── vite.config.ts
├── components.json
└── package.json
```

### Current Structure (Next.js)
```
risk-tool/
├── app/                     # Next.js App Router
│   ├── layout.tsx           # Root layout
│   ├── error.tsx            # Error boundary
│   ├── loading.tsx          # Loading states
│   ├── globals.css          # Global styles
│   ├── assessment/
│   │   ├── new/
│   │   │   ├── page.tsx
│   │   │   └── loading.tsx
│   │   └── [id]/wizard/
│   │       └── page.tsx
│   ├── my-studies/
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   └── [id]/page.tsx
│   ├── question-pool/
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   └── [id]/
│   │       ├── page.tsx
│   │       └── pool-detail-client.tsx
│   ├── study/new/page.tsx
│   └── export/page.tsx
├── components/
│   ├── ui/                  # Reusable UI primitives (Radix)
│   ├── navigation.tsx
│   └── results-display.tsx
├── hooks/                   # Custom React hooks
│   ├── use-studies.ts
│   ├── use-assessment.ts
│   ├── use-question-pools.ts
│   └── use-persisted-state.ts
├── lib/
│   ├── constants/           # Enums and constants
│   │   ├── assessment.ts
│   │   ├── navigation.ts
│   │   ├── risk.ts
│   │   └── study.ts
│   ├── schemas/             # Zod validation
│   │   ├── study-schema.ts
│   │   └── question-schema.ts
│   ├── services/            # Data access layer
│   │   ├── study-service.ts
│   │   ├── assessment-service.ts
│   │   └── question-pool-service.ts
│   ├── utils/
│   │   └── logger.ts        # Centralized logging
│   ├── data.ts              # Mock data
│   ├── pdf-generator.tsx
│   ├── types.ts
│   └── utils.ts
├── public/                  # Static assets
├── middleware.ts            # Edge middleware
├── next.config.ts
├── components.json
└── package.json
```

---

## Detailed Comparison

### 1. Entry Point & Routing

| Feature | Template | Current | Analysis |
|---------|----------|---------|----------|
| **Entry point** | `src/main.tsx` (Vite) | `app/layout.tsx` (Next.js) | Different frameworks |
| **Routing system** | TanStack Router (client-side) | Next.js App Router (server/client hybrid) | Different but both file-based |
| **Route definition** | `routes/*.tsx` with `createFileRoute()` | `app/**/page.tsx` convention | Similar patterns, different implementation |
| **Layouts** | `__root.tsx` | `layout.tsx` | Same concept, different naming |
| **Dynamic routes** | `$id.tsx` | `[id]/page.tsx` | Different syntax |

**Impact**: Major architectural difference. Template is SPA-focused, Current supports SSR/SSG.

### 2. Component Organization

| Feature | Template | Current | Status |
|---------|----------|---------|--------|
| **UI primitives location** | `components/ui/` | `components/ui/` | ✅ Aligned |
| **Feature components location** | `components/` | `components/` | ✅ Aligned |
| **Naming convention** | kebab-case | kebab-case | ✅ Aligned |
| **Component hierarchy** | 2-tier (ui/ and feature) | 2-tier (ui/ and feature) | ✅ Aligned |

**Status**: ✅ **Well aligned** - Both follow shadcn/ui conventions

### 3. Hooks Organization

| Feature | Template | Current | Status |
|---------|----------|---------|--------|
| **Location** | `hooks/` | `hooks/` | ✅ Aligned |
| **Naming** | `use-*.ts` prefix | `use-*.ts` prefix | ✅ Aligned |
| **Purpose** | Data fetching with TanStack Query | Data fetching + state persistence | ✅ Aligned |
| **Examples** | `use-product.ts` | `use-studies.ts`, `use-assessment.ts` | ✅ Similar pattern |

**Custom additions in Current**:
- ✅ `use-persisted-state.ts` - localStorage persistence (good addition)

**Status**: ✅ **Well aligned** with valuable additions

### 4. Library/Utilities Organization

| Directory | Template | Current | Status |
|-----------|----------|---------|--------|
| **lib/** | ✅ Present | ✅ Present | ✅ Aligned |
| **lib/types.ts** | ✅ Present | ✅ Present | ✅ Aligned |
| **lib/utils.ts** | ✅ Present | ✅ Present | ✅ Aligned |
| **lib/api-client.ts** | ✅ Present (TanStack Query) | ⚠️ Missing (uses services) | ⚠️ Different approach |
| **lib/providers.tsx** | ✅ Present | ⚠️ Not visible | ⚠️ May be missing |
| **lib/constants/** | ❌ Not in template | ✅ Present | ✅ Good addition |
| **lib/schemas/** | ❌ Not explicitly shown | ✅ Present | ✅ Good addition |
| **lib/services/** | ❌ Not in template | ✅ Present | ✅ Good addition |
| **lib/utils/logger.ts** | ❌ Not in template | ✅ Present | ✅ Good addition |

**Current has valuable additions**:
- ✅ `constants/` - Type-safe enums and constants
- ✅ `schemas/` - Centralized Zod schemas
- ✅ `services/` - Data access layer (mock → API migration path)
- ✅ `utils/logger.ts` - Production-ready logging

**Status**: ⚠️ **Different but enhanced** - Current implementation is more structured

### 5. State Management & Data Fetching

| Aspect | Template | Current | Analysis |
|--------|----------|---------|----------|
| **Server state** | TanStack Query | Custom hooks + Services | Different approach |
| **API client** | Centralized `api-client.ts` | Service layer pattern | Different architecture |
| **Caching** | TanStack Query built-in | Manual with hooks | Less sophisticated |
| **Form state** | TanStack Form + Zod | react-hook-form + Zod | Similar |
| **Local state** | React hooks | React hooks + persisted state | Current has persistence |

**Gap Analysis**:
- ⚠️ Template uses TanStack Query for automatic caching/refetching
- ⚠️ Current uses service layer but could benefit from TanStack Query
- ✅ Current has state persistence (advantage)

### 6. File Naming Conventions

| Type | Template | Current | Status |
|------|----------|---------|--------|
| **Components** | kebab-case.tsx | kebab-case.tsx | ✅ Aligned |
| **Hooks** | use-*.ts | use-*.ts | ✅ Aligned |
| **Types** | types.ts | types.ts | ✅ Aligned |
| **Utils** | utils.ts | utils.ts | ✅ Aligned |
| **Routes** | kebab-case.tsx | page.tsx | ⚠️ Framework difference |
| **Schemas** | Not specified | *-schema.ts | ✅ Good convention |

**Status**: ✅ **Well aligned** (framework differences expected)

### 7. Styling & UI

| Feature | Template | Current | Status |
|---------|----------|---------|--------|
| **CSS Framework** | Tailwind CSS v4 | Tailwind CSS v4 | ✅ Aligned |
| **Component Library** | Radix UI (via shadcn) | Radix UI (via shadcn) | ✅ Aligned |
| **Utility merge** | tailwind-merge | tailwind-merge | ✅ Aligned |
| **Class helpers** | cn() utility | cn() utility | ✅ Aligned |
| **Global styles** | globals.css | globals.css | ✅ Aligned |
| **Dark mode** | next-themes | next-themes | ✅ Aligned |

**Status**: ✅ **Perfectly aligned**

### 8. Configuration Files

| File | Template | Current | Notes |
|------|----------|---------|-------|
| **tsconfig.json** | ✅ | ✅ | Both use path aliases |
| **components.json** | ✅ | ✅ | shadcn/ui config |
| **Build config** | vite.config.ts | next.config.ts | Framework difference |
| **.env** | ✅ | ⚠️ Not visible | Should exist |
| **eslint config** | eslint.config.js | eslint.config.mjs | ✅ Present |

---

## Key Architectural Differences

### 1. **Framework Choice**
- **Template**: Vite + React (SPA-focused, client-side)
- **Current**: Next.js (Full-stack, SSR/SSG capable)

**Impact**:
- Template is lighter and faster for dev
- Current has better SEO, server capabilities
- Current has built-in API routes (not visible yet)

### 2. **Routing Strategy**
- **Template**: TanStack Router (client-side, type-safe)
- **Current**: Next.js App Router (hybrid, file convention)

**Impact**:
- Both are file-based
- Template has explicit route exports
- Current uses folder conventions

### 3. **Data Fetching Architecture**
- **Template**: TanStack Query (sophisticated caching)
- **Current**: Service layer + Custom hooks (manual)

**Gap**: Current could benefit from TanStack Query integration

---

## Alignment Summary

### ✅ Well Aligned (90%+)
1. **Component organization** - Perfect match
2. **Hooks pattern** - Well aligned with enhancements
3. **Styling approach** - Perfect match
4. **Type safety** - Both use TypeScript + Zod
5. **UI components** - Same library (shadcn/ui)
6. **Naming conventions** - Consistent

### ⚠️ Partially Aligned (50-90%)
1. **lib/ organization** - Similar but Current has more structure
2. **Data fetching** - Different approach but functional
3. **State management** - Current has extra features

### ❌ Not Aligned (<50%)
1. **Framework** - Completely different (Vite vs Next.js)
2. **Routing implementation** - Different routers
3. **Build system** - Different tools

---

## Recommendations

### High Priority

1. **Consider TanStack Query Integration**
   - Would align with template's data fetching pattern
   - Provides automatic caching, refetching, error handling
   - Could complement existing service layer
   - Location: `lib/api-client.ts`

2. **Add Providers Setup**
   - Template has `lib/providers.tsx` for context
   - Current might benefit from centralized provider setup
   - Good for theme, query client, etc.

3. **Environment Configuration**
   - Ensure `.env` and `.env.example` exist
   - Document required environment variables

### Medium Priority

4. **Consider API Routes**
   - Current uses Next.js but no API routes visible
   - Template separates frontend/backend
   - Current could use Next.js API routes or separate backend

5. **Add Route Definitions**
   - Template has `routeTree.gen.ts` for type-safe routing
   - Current could benefit from route constants file
   - Similar to `lib/constants/navigation.ts` but more comprehensive

### Low Priority

6. **Documentation**
   - Add `README.md` in root with architecture overview
   - Document deviations from template and reasoning
   - Create component documentation

7. **Testing Setup**
   - Template likely has test infrastructure
   - Add Vitest + React Testing Library
   - Follow template's testing patterns

---

## Current Implementation Strengths

Your implementation has several **advantages** over the template:

1. ✅ **More organized lib/ structure**
   - Separated constants, schemas, services
   - Clear separation of concerns

2. ✅ **Service layer pattern**
   - Clean abstraction for data access
   - Easy migration path to real API

3. ✅ **State persistence**
   - `use-persisted-state.ts` hook
   - Better UX for forms

4. ✅ **Centralized logging**
   - Production-ready logger utility
   - Better than console.log

5. ✅ **Constants & enums**
   - Type-safe constants
   - Eliminates magic strings

6. ✅ **Loading & error states**
   - Dedicated loading.tsx files
   - Error boundaries

7. ✅ **Next.js advantages**
   - SSR/SSG capabilities
   - API routes (if needed)
   - Better SEO
   - Middleware support

---

## Conclusion

**Overall Alignment: ~70%**

Your current implementation follows the **spirit and best practices** of the template while adapting to Next.js architecture. The core patterns (component organization, hooks, styling, type safety) are well aligned. The main differences are framework-specific, which is expected.

**Key Takeaways**:
- ✅ Component architecture is excellently aligned
- ✅ Your additions (constants, services, logger) are valuable
- ⚠️ Consider integrating TanStack Query for data fetching
- ⚠️ Framework difference (Vite vs Next.js) is intentional and valid
- ✅ Overall structure is maintainable and follows React best practices

The current implementation is **production-ready** and follows modern React/Next.js patterns, even if not a 1:1 match with the template.