# Styling

Tailwind CSS configuration and patterns.

---

## Configuration

Located at `tailwind.config.js`:

```javascript
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
```

---

## Class Patterns

### Responsive Design

```html
<!-- Mobile-first approach -->
<div class="
  grid
  grid-cols-1
  md:grid-cols-2
  lg:grid-cols-3
  gap-4
">
```

### Dark Mode

```html
<div class="
  bg-white dark:bg-gray-800
  text-gray-900 dark:text-white
">
```

### Glass Morphism

```html
<div class="
  bg-white/10
  backdrop-blur-md
  border border-white/20
  rounded-xl
">
```

---

## Component Styling

### Button Variants

```tsx
const buttonVariants = {
  primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
  outline: 'border border-indigo-600 text-indigo-600 hover:bg-indigo-50',
  ghost: 'hover:bg-gray-100 text-gray-600',
};
```

### Card Styles

```tsx
<div className="
  bg-white dark:bg-gray-800
  rounded-xl
  shadow-lg
  p-6
  transition-transform hover:scale-105
">
```

---

## Animations

### Framer Motion Integration

```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
```

### CSS Animations

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

---

## Utility Classes

Using `clsx` and `tailwind-merge`:

```typescript
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage
<button className={cn(
  'px-4 py-2 rounded',
  isActive && 'bg-indigo-600',
  className
)} />
```

---

## Icons

Using Lucide React:

```tsx
import { Home, User, Settings, LogOut } from 'lucide-react';

<Home className="w-5 h-5" />
```
