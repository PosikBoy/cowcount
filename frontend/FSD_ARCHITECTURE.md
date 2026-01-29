# Feature-Sliced Design Architecture

This project follows the Feature-Sliced Design (FSD) methodology for better code organization and maintainability.

## Directory Structure

```
src/
├── app/                    # Application layer (pages, routing, global providers)
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.scss
│   ├── theme.ts
│   └── [routes]/
│
├── widgets/                # Composite blocks (page sections)
│   ├── RecognitionForm/
│   ├── RecognitionHistory/
│   └── RecognitionDetail/
│
├── features/               # User interactions (business features)
│   ├── upload-image/
│   ├── select-cow/
│   └── delete-recognition/
│
├── entities/               # Business entities
│   └── recognition/
│       ├── ui/
│       ├── model/
│       └── lib/
│
└── shared/                 # Reusable infrastructure code
    ├── api/
    ├── types/
    ├── lib/
    └── ui/
```

## Layers (from bottom to top)

### 1. Shared Layer

Reusable code without business logic:

- **api/** - API configuration and clients
- **types/** - TypeScript types and interfaces
- **lib/** - Utility functions
- **ui/** - Generic UI components (Header, Footer, Button, etc.)

### 2. Entities Layer

Business entities of the application:

- **recognition/** - Recognition entity with its UI components and logic

### 3. Features Layer

User interactions and business features:

- **upload-image/** - Image upload functionality
- **select-cow/** - Cow selection interaction
- **delete-recognition/** - Delete recognition feature

### 4. Widgets Layer

Composite blocks combining features and entities:

- **RecognitionForm/** - Complete recognition form with upload
- **RecognitionHistory/** - History list with all interactions
- **RecognitionDetail/** - Detail view with image and cow selection

### 5. App Layer

Application initialization, routing, and global providers

## Import Rules

Each layer can only import from layers below it:

- `app` → `widgets`, `features`, `entities`, `shared`
- `widgets` → `features`, `entities`, `shared`
- `features` → `entities`, `shared`
- `entities` → `shared`
- `shared` → nothing (self-contained)

## Benefits

1. **Clear structure** - Easy to navigate and understand
2. **Scalability** - Easy to add new features
3. **Maintainability** - Changes are isolated
4. **Reusability** - Shared code is properly organized
5. **Team collaboration** - Clear boundaries between modules
