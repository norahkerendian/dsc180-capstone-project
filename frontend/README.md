# DataLingo - Gamified Python & Data Science Learning Platform

A fun, Duolingo-inspired web application for learning Python and Data Science through bite-sized lessons and gamified challenges.

![DataLingo Landing Page](https://via.placeholder.com/800x400?text=DataLingo+Landing+Page)

## 🚀 Features

- 📊 Interactive learning dashboard
- 🎮 Gamified MCQ quizzes
- 🏆 Progress tracking with XP and achievements
- 🔥 Streak counter to maintain learning momentum
- 🐍 Python basics to advanced data science concepts
- 🎨 Beautiful, responsive UI inspired by Duolingo

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your machine:

- **Node.js** (v18.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download here](https://git-scm.com/)
- **Supabase Account** (for authentication and database) - [Sign up here](https://supabase.com/)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd capstone-frontend
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 16.0.1
- React 19
- Tailwind CSS 4.1.16
- @tailwindcss/postcss
- Supabase client
- TypeScript

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
touch .env.local
```

Add your Supabase credentials (get these from your Supabase project dashboard):

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**To get your Supabase credentials:**
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Create a new project or select an existing one
3. Go to Settings > API
4. Copy your `Project URL` and `anon/public` key

### 4. Verify Tailwind CSS Setup

The project uses Tailwind CSS v4. Ensure your configuration files are correct:

**`postcss.config.js`:**
```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

**`tailwind.config.ts`:**
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./public/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: { extend: {} },
  plugins: []
};

export default config;
```

**`app/globals.css`** (first line should be):
```css
@import "tailwindcss";
```

### 5. Set Up Supabase Database (Optional but Recommended)

If you're using the authentication features, set up your Supabase database:

1. In your Supabase dashboard, go to the SQL Editor
2. Create necessary tables for user progress, lessons, quizzes, etc.
3. Set up Row Level Security (RLS) policies for data protection

## 🎯 Running the Project

### Development Mode

Start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Production Build

To create an optimized production build:

```bash
npm run build
npm start
```

### Linting

Run the linter to check for code issues:

```bash
npm run lint
```

## 📁 Project Structure

```
capstone-frontend/
├── app/
│   ├── api/              # API routes
│   ├── components/       # Reusable React components
│   │   └── TopBar.tsx    # Navigation bar
│   ├── curriculum/       # Curriculum/lessons pages
│   ├── data/            # Data management
│   ├── lessons/         # Individual lesson pages
│   ├── levels/          # Level selection page
│   ├── login/           # Authentication pages
│   │   └── page.tsx     # Login/signup page
│   ├── quiz/            # Quiz pages
│   ├── ClientShell.tsx  # Client-side wrapper component
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Landing page
├── lib/
│   └── supabaseClient.ts # Supabase configuration
├── public/              # Static assets
├── .env.local          # Environment variables (create this)
├── next.config.ts      # Next.js configuration
├── package.json        # Project dependencies
├── postcss.config.js   # PostCSS configuration
├── tailwind.config.ts  # Tailwind CSS configuration
└── tsconfig.json       # TypeScript configuration
```

## 🔧 Key Technologies

- **Framework:** Next.js 16.0.1 (React 19)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Authentication:** Supabase Auth
- **Database:** Supabase PostgreSQL
- **Deployment:** Vercel (recommended)

## 🎨 Design System

The application uses a bright, gamified design inspired by Duolingo:

- **Primary Color:** Green (#22c55e)
- **Secondary Colors:** Blue, Purple, Yellow
- **Font:** Geist Sans & Geist Mono
- **Design Philosophy:** Fun, engaging, and motivating

## 🐛 Troubleshooting

### Issue: Tailwind styles not applying

**Solution:**
1. Stop the dev server (Ctrl+C)
2. Delete the `.next` folder: `rm -rf .next`
3. Run `npm run dev` again

### Issue: Build errors related to PostCSS/Tailwind

**Solution:**
1. Ensure `@tailwindcss/postcss` is installed: `npm install -D @tailwindcss/postcss`
2. Check that `postcss.config.js` uses `"@tailwindcss/postcss": {}`
3. Verify `globals.css` starts with `@import "tailwindcss";`

### Issue: Supabase authentication not working

**Solution:**
1. Verify your `.env.local` file has correct credentials
2. Check that the Supabase client is properly configured in `lib/supabaseClient.ts`
3. Ensure your Supabase project is active and not paused

### Issue: TopBar showing on landing/login pages

**Solution:**
Check that `ClientShell.tsx` properly hides the TopBar on `/` and `/login` routes

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com/)
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Deploy!

Vercel will automatically detect Next.js and configure the build settings.

## 📝 Development Notes

- The landing page (`/`) and login page (`/login`) do not show the TopBar
- All other pages include the TopBar with user stats and navigation
- Authentication is handled through Supabase
- User progress and lesson data are stored in Supabase

## 🤝 Contributing

This is a capstone project. If you'd like to contribute or have suggestions, please reach out to the development team.

## 📄 License

This project is part of a capstone course project.

## 👥 Team

Developed by the DataLingo Team as part of a Data Science Capstone project.

---

**Happy Learning! 🎓🚀**

For questions or issues, please open an issue in the repository or contact the development team.
