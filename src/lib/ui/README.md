# UI Standards and Design System

## Overview
This directory contains the centralized design system and UI standards for the LMS platform. All components should follow these standards to ensure consistency, accessibility, and maintainability.

## Files

### `ui-standards.ts`
Centralized design system with:
- WCAG AA compliant color definitions
- Spacing, border radius, and shadow systems
- Typography standards
- Button variants and sizes
- Interactive state definitions
- Accessibility standards
- Utility functions

## Quick Reference

### Colors

#### Text Colors (WCAG Compliant)
```typescript
import { colors } from '@/lib/ui/ui-standards'

// Primary text - AAA compliant (16.1:1)
colors.text.primary // #111827

// Secondary text - AA compliant (7.1:1)
colors.text.secondary // #4b5563

// Tertiary text - AA compliant for large text (4.6:1)
colors.text.tertiary // #6b7280

// White text
colors.text.white // #ffffff

// Disabled text
colors.text.disabled // #9ca3af
```

#### Background Colors
```typescript
colors.background.white    // #ffffff
colors.background.light    // #f9fafb
colors.background.primary  // #eff6ff
colors.background.success  // #f0fdf4
colors.background.warning  // #fffbeb
colors.background.error    // #fef2f2
```

#### Status Colors
```typescript
// Success
colors.success[500] // #22c55e
colors.success[600] // #16a34a
colors.success[700] // #15803d (for text)

// Warning
colors.warning[500] // #f59e0b
colors.warning[600] // #d97706
colors.warning[700] // #b45309 (for text)

// Error
colors.error[500] // #ef4444
colors.error[600] // #dc2626
colors.error[700] // #b91c1c (for text)
```

### Spacing

```typescript
import { spacing } from '@/lib/ui/ui-standards'

spacing.xs   // 0.25rem (4px)
spacing.sm   // 0.5rem (8px)
spacing.md   // 1rem (16px)
spacing.lg   // 1.5rem (24px)
spacing.xl   // 2rem (32px)
spacing['2xl'] // 3rem (48px)
spacing['3xl'] // 4rem (64px)
spacing['4xl'] // 6rem (96px)
```

### Border Radius

```typescript
import { borderRadius } from '@/lib/ui/ui-standards'

borderRadius.sm   // 0.5rem (8px) - inputs, small cards
borderRadius.md   // 0.75rem (12px) - buttons, cards
borderRadius.lg   // 1rem (16px) - large cards
borderRadius.xl   // 1.5rem (24px) - hero sections
borderRadius.full // 9999px - fully rounded
```

### Shadows

```typescript
import { shadows } from '@/lib/ui/ui-standards'

shadows.sm   // Subtle shadow
shadows.md   // Medium shadow
shadows.lg   // Large shadow
shadows.xl   // Extra large shadow
shadows['2xl'] // Maximum shadow
```

### Typography

```typescript
import { typography } from '@/lib/ui/ui-standards'

// Font families
typography.fontFamily.arabic  // 'Cairo', 'Noto Kufi Arabic', sans-serif
typography.fontFamily.english // 'Inter', system-ui, -apple-system, sans-serif

// Font sizes
typography.fontSize.xs   // 0.75rem (12px)
typography.fontSize.sm   // 0.875rem (14px)
typography.fontSize.base // 1rem (16px)
typography.fontSize.lg   // 1.125rem (18px)
typography.fontSize.xl   // 1.25rem (20px)
typography.fontSize['2xl'] // 1.5rem (24px)

// Font weights
typography.fontWeight.light     // 300
typography.fontWeight.normal    // 400
typography.fontWeight.medium    // 500
typography.fontWeight.semibold  // 600
typography.fontWeight.bold      // 700
typography.fontWeight.extrabold // 800

// Line heights
typography.lineHeight.tight   // 1.25
typography.lineHeight.normal  // 1.5
typography.lineHeight.relaxed // 1.75
typography.lineHeight.arabic  // 1.8 (optimized for Arabic)
```

## Button Usage

### Variants

```tsx
import { Button } from '@/components/ui/button'

// Primary - main actions
<Button variant="primary">Save</Button>

// Secondary - success actions
<Button variant="secondary">Confirm</Button>

// Outline - secondary actions
<Button variant="outline">Cancel</Button>

// Danger - destructive actions
<Button variant="danger">Delete</Button>

// Ghost - subtle actions
<Button variant="ghost">Skip</Button>

// WhatsApp - brand specific
<Button variant="whatsapp">Contact on WhatsApp</Button>
```

### Sizes

```tsx
// Small - 36px height
<Button size="sm">Small</Button>

// Medium - 44px height (default, WCAG compliant)
<Button size="md">Medium</Button>

// Large - 48px height
<Button size="lg">Large</Button>

// Full width
<Button size="full">Full Width</Button>
```

### States

```tsx
// Loading state
<Button loading>Processing...</Button>

// Disabled state
<Button disabled>Disabled</Button>

// With async action
<Button onClick={async () => await saveData()}>
  Save
</Button>
```

## Card Usage

### Variants

```tsx
import { Card } from '@/components/ui/card'

// Default - standard card
<Card variant="default">Content</Card>

// Elevated - with shadow and hover lift
<Card variant="elevated">Content</Card>

// Outlined - with primary border
<Card variant="outlined">Content</Card>

// Interactive - clickable card
<Card variant="interactive" onClick={handleClick}>
  Content
</Card>

// Ghost - transparent
<Card variant="ghost">Content</Card>
```

### Complete Example

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

<Card variant="elevated">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button variant="outline">Cancel</Button>
    <Button variant="primary">Save</Button>
  </CardFooter>
</Card>
```

## Dialog Usage

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const [open, setOpen] = useState(false)

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent dir="rtl">
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        Dialog description text
      </DialogDescription>
    </DialogHeader>
    
    <div className="p-6">
      {/* Dialog content */}
    </div>
    
    <DialogFooter>
      <Button variant="outline" onClick={() => setOpen(false)}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleConfirm}>
        Confirm
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Accessibility Guidelines

### Touch Targets
- **Desktop**: Minimum 44x44px
- **Mobile**: Minimum 48x48px
- All interactive elements must meet these minimums

### Text Contrast
- **Normal text**: Minimum 4.5:1 (WCAG AA)
- **Large text** (≥18px or ≥14px bold): Minimum 3:1 (WCAG AA)
- **UI components**: Minimum 3:1 (WCAG AA)

### Focus Indicators
- **Width**: 2px
- **Color**: Primary color (#2563eb)
- **Offset**: 2px from element
- **Style**: Solid ring

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Tab order must be logical
- Escape key should close modals
- No keyboard traps

### Screen Readers
- Use proper ARIA labels
- Use semantic HTML
- Announce state changes
- Provide meaningful descriptions

## Utility Functions

### Get Contrast Text Color

```typescript
import { getContrastText } from '@/lib/ui/ui-standards'

const textColor = getContrastText('#2563eb') // Returns white or black
```

### Check Touch Target Size

```typescript
import { meetsTouchTargetSize } from '@/lib/ui/ui-standards'

const isValid = meetsTouchTargetSize(44, 44) // Returns true
```

### Get Tailwind Classes

```typescript
import { getTextColorClass, getBgColorClass } from '@/lib/ui/ui-standards'

const textClass = getTextColorClass('primary') // 'text-text-primary'
const bgClass = getBgColorClass('success') // 'bg-success-50'
```

## Best Practices

### 1. Always Use Design System Colors
```tsx
// ✅ Good
<div className="text-text-primary bg-white">

// ❌ Bad
<div className="text-gray-900 bg-white">
```

### 2. Use Semantic Component Variants
```tsx
// ✅ Good
<Button variant="danger" onClick={handleDelete}>Delete</Button>

// ❌ Bad
<Button className="bg-red-500 text-white" onClick={handleDelete}>Delete</Button>
```

### 3. Ensure Proper Contrast
```tsx
// ✅ Good - uses WCAG compliant colors
<div className="bg-white text-text-primary">

// ❌ Bad - may not have sufficient contrast
<div className="bg-gray-100 text-gray-400">
```

### 4. Provide Clear Interactive States
```tsx
// ✅ Good - all states defined
<Button 
  variant="primary"
  disabled={isLoading}
  loading={isLoading}
  onClick={handleSubmit}
>
  Submit
</Button>

// ❌ Bad - no loading state
<Button onClick={handleSubmit}>Submit</Button>
```

### 5. Use Proper Spacing
```tsx
// ✅ Good - uses design system spacing
<div className="p-6 space-y-4">

// ❌ Bad - arbitrary spacing
<div className="p-5 space-y-3">
```

## Testing Checklist

- [ ] All text meets WCAG AA contrast requirements
- [ ] All interactive elements meet minimum touch target sizes
- [ ] All buttons have clear hover, focus, and disabled states
- [ ] All modals have proper focus management
- [ ] All components are keyboard accessible
- [ ] All components work with screen readers
- [ ] All components are responsive
- [ ] All components work in RTL mode

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Support

For questions or issues with the design system:
1. Check this documentation
2. Review the `ui-standards.ts` file
3. Check the component implementation
4. Refer to WCAG guidelines
5. Ask the development team

## Changelog

### 2025-11-22
- Initial creation of UI standards system
- WCAG AA compliant color definitions
- Button, Card, and Dialog component enhancements
- Comprehensive documentation
