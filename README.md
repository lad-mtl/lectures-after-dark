# Lectures After Dark

Event platform with a visual page builder. Admins customize pages via drag-and-drop at `/admin`.

**Stack:** React 19, TypeScript, Vite, Tailwind CSS, Convex, CraftJS

## Setup

```bash
pnpm install
pnpm dev
```

## Project Structure

```
src/
├── components/           # UI components (CraftJS-enabled)
│   ├── speakers/         # Speaker page sections
│   ├── bars/             # Bars page sections
│   ├── about/            # About page sections
│   ├── sponsors/         # Sponsors page sections
│   ├── settings/         # Shared settings panel styles
│   └── ui/               # Generic UI primitives
├── pages/                # Route pages
│   ├── Admin.tsx         # Editor interface
│   └── Home.tsx          # Public home page
├── hooks/                # Shared hooks
│   └── useEditorAwareNode.ts
├── constants/            # App constants
└── contexts/             # React contexts

convex/
└── pages.ts              # Database queries/mutations for page layouts
```

## How CraftJS Works

CraftJS provides drag-and-drop editing. The system has two contexts:

| Context | Location | Editor State | Components Are |
|---------|----------|--------------|----------------|
| Admin   | `/admin` | `enabled={true}` (default) | Draggable, editable |
| Public  | `/`, etc | `enabled={false}` | Static, read-only |

### The Editor Wrapper

Pages wrap content in `<Editor>` with a component resolver:

```tsx
// Admin.tsx - editing enabled
<Editor resolver={{ Hero, FAQ, ... }}>
  <MigratingFrame json={savedLayout}>
    <Element is="div" canvas>
      <Hero />
      <FAQ />
    </Element>
  </MigratingFrame>
</Editor>

// Home.tsx - editing disabled (public view)
<Editor enabled={false} resolver={{ Hero, FAQ, ... }}>
  ...
</Editor>
```

- **resolver**: Maps component names to implementations (required for deserialization)
- **MigratingFrame**: Loads saved JSON from Convex, merges with current component defaults
- **Element with canvas**: Creates a drop zone where components can be reordered

## Convex Persistence

Convex stores page layouts as JSON strings in a `pages` table:

```
pages: { slug: "home", layout: "{...serialized CraftJS state...}" }
```

- `getPage(slug)` - Fetch layout for a page
- `savePage(slug, layout)` - Save/update layout
- Admin saves trigger `savePage`; public pages call `getPage` on load

## Editing Existing Sections

Each component has a settings panel. To modify what's editable:

1. Find the component in `src/components/`
2. The `ComponentSettings` function defines the settings UI
3. Add/remove form fields and wire them to `setProp`

```tsx
// In the settings component
const { actions: { setProp }, title } = useNode((node) => ({
    title: node.data.props.title,
}));

// Add a new field
<input
    value={title}
    onChange={e => setProp((p: Props) => p.title = e.target.value)}
/>
```

## Adding New Sections

### 1. Create the Component

```tsx
// src/components/MySection.tsx
import { useNode } from '@craftjs/core';
import { settingsStyles } from './settings/settingsStyles';

interface MySectionProps {
    heading?: string;
}

export const MySection = ({ heading = "Default Heading" }: MySectionProps) => {
    const { connectors: { connect, drag } } = useNode();

    return (
        <section ref={(ref) => ref && connect(drag(ref))}>
            <h2>{heading}</h2>
        </section>
    );
};

// Settings panel for the admin sidebar
const MySectionSettings = () => {
    const { actions: { setProp }, heading } = useNode((node) => ({
        heading: node.data.props.heading,
    }));

    return (
        <div style={settingsStyles.field}>
            <label style={settingsStyles.label}>Heading</label>
            <input
                style={settingsStyles.input}
                value={heading}
                onChange={e => setProp((p: MySectionProps) => p.heading = e.target.value)}
            />
        </div>
    );
};

// CraftJS configuration
(MySection as any).craft = {
    props: { heading: "Default Heading" },      // Default values
    related: { settings: MySectionSettings },   // Settings panel
};
```

### 2. Register in Admin.tsx

```tsx
// Add to imports
import { MySection } from '../components/MySection';

// Add to resolver (enables serialization/deserialization)
const MAIN_RESOLVER = {
    Hero, FAQ, MySection, ...
};

// Add to page components (sets initial layout)
const PAGE_COMPONENTS = {
    home: (
        <>
            <Hero />
            <MySection />  // Add here
            <FAQ />
        </>
    ),
};
```

### 3. Register in Public Pages (if needed)

If the section appears on public pages, add it to that page's resolver:

```tsx
// src/pages/Home.tsx
<Editor enabled={false} resolver={{ Hero, FAQ, MySection, ... }}>
```

## Key Patterns

| Pattern | Purpose |
|---------|---------|
| `useNode()` | Get CraftJS connectors for drag/drop |
| `connect(drag(ref))` | Make element draggable and a drop target |
| `.craft = { props, related }` | Define defaults and settings panel |
| `useEditorAwareNode()` | Safe hook that works outside Editor context |
| `settingsStyles` | Consistent styling for settings panels |

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Dev server |
| `pnpm build` | Production build |
| `pnpm type-check` | Type checking |
| `pnpm check` | Full validation |
