# GreAgents Frontend

A modern React application with GitHub OAuth authentication, built with Vite, TailwindCSS, and shadcn/ui.

## Features

- 🔐 GitHub OAuth authentication
- 📝 User onboarding flow
- 🎨 Beautiful UI with shadcn/ui components
- 🚀 Fast development with Vite
- 📱 Responsive design with TailwindCSS
- 🔄 Data fetching with React Query
- 🌐 HTTP client with ky

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **shadcn/ui** - UI components
- **React Router** - Routing
- **TanStack Query** - Data fetching
- **TanStack Form** - Form management
- **ky** - HTTP client
- **Bun** - Package manager

## Getting Started

### Prerequisites

- Bun installed
- GitHub OAuth App credentials

### Setup

1. Clone the repository

2. Install dependencies:
```bash
bun install
```

3. Create a GitHub OAuth App:
   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Click "New OAuth App"
   - Set Authorization callback URL to: `http://localhost:5173/auth/callback`
   - Copy the Client ID

4. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your GitHub Client ID:
```
VITE_GITHUB_CLIENT_ID=your_github_client_id_here
VITE_GITHUB_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_API_BASE_URL=http://localhost:3000/api
```

5. Start the development server:
```bash
bun run dev
```

6. Open http://localhost:5173

## Project Structure

```
src/
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── AppSidebar.tsx     # Main sidebar navigation
│   └── DashboardLayout.tsx # Layout wrapper with sidebar
├── lib/
│   ├── api.ts             # ky HTTP client setup
│   ├── auth.ts            # Authentication utilities
│   └── utils.ts           # Utility functions
├── pages/
│   ├── Login.tsx          # Login landing page
│   ├── AuthCallback.tsx   # GitHub OAuth callback handler
│   ├── Onboarding.tsx     # User onboarding form
│   ├── Home.tsx           # Dashboard home page
│   ├── Settings.tsx       # Settings page
│   └── agents/
│       ├── Coder.tsx      # Coder agent page
│       └── Reviewer.tsx   # Reviewer agent page
├── App.tsx          # App routes and providers
└── main.tsx         # App entry point
```

## Authentication Flow

1. User clicks "Continue with GitHub" on the login page
2. User is redirected to GitHub for authorization
3. GitHub redirects to backend `/auth/github/callback` with a code
4. Backend processes auth and redirects to frontend `/auth/callback` with token in query params
5. Frontend extracts and stores token in localStorage
6. User is redirected to `/onboarding`
7. After completing onboarding, user is redirected to `/` (home dashboard)

## Routes

- `/login` - Login page (public)
- `/auth/callback` - OAuth callback handler
- `/onboarding` - User onboarding form (protected)
- `/` - Home dashboard (protected)
- `/agents/coder` - Coder agent page (protected)
- `/agents/reviewer` - Reviewer agent page (protected)
- `/settings` - Settings page (protected)

## Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run preview` - Preview production build
- `bun run lint` - Run ESLint

## Adding shadcn/ui Components

```bash
bunx shadcn@latest add [component-name]
```

## License

MIT
