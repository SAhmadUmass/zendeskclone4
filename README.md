# Support Desk Application

A modern support desk application built with Next.js, Supabase, and Tailwind CSS.

## Features

- User authentication (sign up, sign in, sign out)
- Role-based access control
- Modern UI with Tailwind CSS
- Dark mode support
- Responsive design

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account and project

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd support-desk
```

2. Install dependencies:
```bash
npm install
# or
yarn
# or
pnpm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Setup

1. Create a new Supabase project
2. Set up the following tables:
   - profiles (id, email, full_name, role)
   - tickets (to be implemented)

## Development

- `src/` - Contains the main application code
- `app/` - Next.js app router pages
- `utils/` - Utility functions and configurations
- `components/` - Reusable UI components

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
