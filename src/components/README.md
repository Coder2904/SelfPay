# UI Components Documentation

This directory contains the base UI components and design system for the SelfPay application.

## Structure

```
src/components/
├── ui/                 # Base UI components
│   ├── Button.tsx      # Reusable button component
│   ├── Input.tsx       # Text input component
│   ├── Card.tsx        # Card container component
│   ├── LoadingSpinner.tsx    # Loading spinner component
│   ├── ErrorBoundary.tsx     # Error boundary component
│   ├── LoadingIndicator.tsx  # Loading indicator component
│   ├── EmptyState.tsx        # Empty state component
│   └── index.ts        # UI components exports
├── forms/              # Form-specific components
│   ├── FormInput.tsx   # Form input with validation
│   ├── FormButton.tsx  # Form button component
│   ├── FormContainer.tsx     # Form container with state management
│   └── index.ts        # Form components exports
├── charts/             # Chart and visualization components
│   ├── ChartCard.tsx   # Chart card placeholder
│   ├── ProgressBar.tsx # Progress bar component
│   ├── HeatmapPlaceholder.tsx # Heatmap placeholder
│   └── index.ts        # Chart components exports
└── index.ts            # Main components export
```

## Usage

### Basic UI Components

```typescript
import { Button, Input, Card, LoadingSpinner } from '@/components/ui';

// Button usage
<Button
  title="Click me"
  variant="primary"
  size="medium"
  onPress={() => console.log('Clicked')}
/>

// Input usage
<Input
  label="Email"
  placeholder="Enter email"
  error="Invalid email"
  isRequired
/>

// Card usage
<Card variant="elevated" padding="medium">
  <Text>Card content</Text>
</Card>

// Loading spinner
<LoadingSpinner message="Loading..." size="large" />
```

### Form Components

```typescript
import { FormContainer, FormInput, FormButton } from "@/components/forms";

<FormContainer
  onSubmit={(values) => console.log(values)}
  onValuesChange={(values) => setFormData(values)}
>
  <FormInput
    name="email"
    label="Email"
    validation={{ required: true, pattern: /\S+@\S+\.\S+/ }}
  />
  <FormButton type="submit" title="Submit" />
</FormContainer>;
```

### Chart Components

```typescript
import { ChartCard, ProgressBar, HeatmapPlaceholder } from '@/components/charts';

// Chart card placeholder
<ChartCard
  title="Revenue Chart"
  config={{
    type: 'line',
    data: [{ x: '1', y: 100 }, { x: '2', y: 200 }]
  }}
/>

// Progress bar
<ProgressBar
  progress={0.75}
  label="Goal Progress"
  showPercentage
/>

// Heatmap placeholder
<HeatmapPlaceholder
  title="Surge Zones"
  width={300}
  height={200}
/>
```

## Component Features

### Button Component

- Multiple variants: primary, secondary, outline, ghost
- Different sizes: small, medium, large
- Loading and disabled states
- Left and right icon support

### Input Component

- Multiple variants: default, filled, outline
- Label and helper text support
- Error state handling
- Required field indication
- Left and right icon support

### Card Component

- Multiple variants: default, elevated, outlined
- Configurable padding
- Touchable support with onPress

### Form Components

- Automatic form state management
- Built-in validation
- Error handling and display
- Keyboard avoidance

### Chart Components

- Placeholder implementations with "// TODO manual implementation" comments
- Consistent styling and error states
- Loading state support

## Design System

All components follow a consistent design system with:

- Color palette based on Tailwind CSS colors
- Typography scale (12px, 14px, 16px, 18px, 20px)
- Spacing scale (4px, 8px, 12px, 16px, 20px)
- Border radius (4px, 8px, 12px)
- Shadow system for elevation

## Error Handling

Components include comprehensive error handling:

- ErrorBoundary for catching JavaScript errors
- Graceful fallbacks for loading and error states
- User-friendly error messages
- Development-mode debug information

## Accessibility

Components are built with accessibility in mind:

- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast support

## Implementation Status

✅ **Completed:**

- Base UI components (Button, Input, Card, LoadingSpinner)
- Form components with validation (FormInput, FormButton, FormContainer)
- Chart placeholder components (ChartCard, ProgressBar, HeatmapPlaceholder)
- Error and loading state components (ErrorBoundary, LoadingIndicator, EmptyState)
- TypeScript interfaces and exports
- Comprehensive styling system

🔄 **TODO Manual Implementation:**

- Actual chart rendering (marked with comments)
- Advanced form validation rules
- Animation and transition effects
- Theme customization system
