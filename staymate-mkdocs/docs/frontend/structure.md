# Frontend Structure

Directory organization of the Next.js frontend.

---

## Directory Tree

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Landing page (/)
│   │   ├── login/page.tsx      # /login
│   │   ├── register/page.tsx   # /register
│   │   ├── dashboard/          # /dashboard/*
│   │   │   ├── page.tsx        # Dashboard home
│   │   │   ├── layout.tsx      # Dashboard layout
│   │   │   └── admin/          # Admin pages
│   │   ├── search/page.tsx     # Property search
│   │   ├── roommates/page.tsx  # Roommate listings
│   │   ├── messages/page.tsx   # Messaging
│   │   ├── notifications/      # Notifications
│   │   ├── profile/page.tsx    # User profile
│   │   └── settings/page.tsx   # Settings
│   │
│   ├── components/             # Reusable components
│   │   ├── Navbar.tsx          # Navigation bar
│   │   ├── Sidebar.tsx         # Dashboard sidebar
│   │   ├── DashboardLayout.tsx # Dashboard wrapper
│   │   ├── auth/               # Auth components
│   │   │   └── AuthGuard.tsx   # Route protection
│   │   ├── admin/              # Admin components
│   │   ├── landing/            # Landing page sections
│   │   ├── roommates/          # Roommate components
│   │   └── search/             # Search components
│   │
│   ├── context/                # React contexts
│   │   ├── AuthContext.tsx     # Authentication state
│   │   └── ThemeContext.tsx    # Theme (dark/light)
│   │
│   ├── lib/                    # Utilities
│   │   ├── api.ts              # Axios client
│   │   └── socket.ts           # WebSocket client
│   │
│   └── types/                  # TypeScript types
│       └── auth.ts             # Auth types
│
├── public/                     # Static assets
├── package.json                # Dependencies
├── next.config.js              # Next.js config
├── tailwind.config.js          # Tailwind config
└── tsconfig.json               # TypeScript config
```

---

## Key Files

### Root Layout (`src/app/layout.tsx`)

Wraps all pages with providers:

```tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          <ThemeProvider>
            <Navbar />
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

### API Client (`src/lib/api.ts`)

Configured Axios with interceptors:

```typescript
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor adds JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## Statistics

| Category | Count |
|----------|-------|
| Pages (app/) | 28 |
| Components | 54 |
| Total TSX/TS | 82 |
