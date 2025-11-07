# Admin Dashboard

A Next.js admin application with authentication, role-based access control, and a modern design system.

## Features

- 🔐 **Authentication**: Login system with role-based access
- 👥 **Role Guarding**: Protected routes that require admin role
- 🎨 **Design System**: Shared UI components with Tailwind CSS
- 📱 **Responsive Layout**: Mobile-friendly sidebar navigation
- 🏗️ **Modular Structure**: Organized component architecture

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Demo Credentials

- **Email**: admin@example.com
- **Password**: admin123

## Project Structure

```
app/
├── dashboard/              # Protected dashboard routes
│   ├── layout.tsx         # Dashboard layout wrapper
│   ├── page.tsx           # Dashboard home
│   ├── users/             # User management
│   ├── settings/          # Application settings
│   └── reports/           # System reports
├── login/                 # Authentication page
├── layout.tsx             # Root layout
└── page.tsx               # Home (redirects to dashboard)

components/
├── guards/
│   └── RoleGuard.tsx      # Route protection component
├── layout/
│   ├── Header.tsx         # Dashboard header
│   └── Sidebar.tsx        # Navigation sidebar
├── providers/
│   └── AuthProvider.tsx   # Authentication context
└── ui/                    # Shared design system
    ├── Button.tsx
    ├── Card.tsx
    └── Input.tsx
```

## Authentication Flow

1. **Unauthenticated users** are redirected to `/login`
2. **Authenticated users** can access the dashboard
3. **Role-based protection** ensures only admin users can access protected routes
4. **Session persistence** using localStorage (for demo purposes)

## Design System

The application uses a consistent design system built with:

- **Tailwind CSS** for styling
- **Custom color palette** with primary, gray, and semantic colors
- **Reusable components** for common UI patterns
- **Responsive design** that works on all screen sizes

### UI Components

- **Button**: Multiple variants (default, destructive, outline, secondary, ghost, link)
- **Card**: Container components with header, content, and title variants
- **Input**: Form inputs with labels and error states

## Protected Routes

All routes under `/dashboard` are protected by the `RoleGuard` component:

- `/dashboard` - Main dashboard
- `/dashboard/users` - User management (admin only)
- `/dashboard/settings` - Application settings (admin only)
- `/dashboard/reports` - System reports (admin only)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Protected Routes

1. Create a new page under `app/dashboard/`
2. Wrap content with `<RoleGuard>` component
3. Add navigation item to `Sidebar.tsx`

### Customizing the Design System

1. Modify `tailwind.config.js` for theme changes
2. Update components in `components/ui/` for new patterns
3. Add new color variants to the existing components

## Security Notes

This is a demo application with simplified authentication:

- Uses localStorage for session management
- Mock authentication (no real backend)
- Password is visible in code for demo purposes

For production use, implement:
- JWT tokens with secure storage
- Server-side authentication
- HTTPS and secure cookies
- Proper password hashing
- Rate limiting and CSRF protection

## Technologies Used

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **React Context** - State management for authentication