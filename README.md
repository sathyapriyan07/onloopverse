# OnloopVerse - Regional Cinema Knowledge Platform

A modern, full-stack movie discovery platform focused on regional Indian cinema (Tamil, Telugu, Malayalam, Hindi) with deep contextual data from Wikipedia.

![OnloopVerse Screenshot](https://via.placeholder.com/1200x600?text=CineVerse+Cinema+Platform)

## Features

### Public Features
- **Hero Banner**: Featured movies with backdrop images
- **Trending Movies**: Horizontal scroll sections by industry
- **Movie Discovery**: Grid layout with filters (Industry, Year, Genre)
- **Movie Details**: 
  - Hero backdrop with poster
  - Cast & Crew sections
  - Wikipedia context integration
  - Trailer embed (YouTube)
- **Person Profiles**: Filmography, biography, Wikipedia data
- **Smart Search**: Multi-type search (movies + people) with suggestions
- **Discover Page**: Explore by industry or theme

### Admin Dashboard
- **Import Movies**: Fetch from TMDb by ID with auto-enrichment
- **Wikipedia Integration**: Auto-fetch context for movies and people
- **CRUD Operations**: Movies, People, Awards management
- **Role Assignment**: Assign actors, directors, composers, etc.

## Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS
- React Router v6
- Zustand (state management)
- Lucide React (icons)

### Backend
- Supabase (Database + Auth + Storage)
- No Edge Functions required

### APIs
- [TMDb API](https://www.themoviedb.org/documentation/api) - Movies, TV, Cast, Images
- [Wikipedia REST API](https://en.wikipedia.org/api/rest_v1/) - Summaries, Extracts

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- TMDb API key ([Get one here](https://www.themoviedb.org/settings/api))
- Supabase account ([Create one here](https://supabase.com))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd onloopverse
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
VITE_TMDB_API_KEY=your_tmdb_api_key_here
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up Supabase database:
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Create a new project
   - Run the SQL schema from `supabase/schema.sql`
   - Add your admin user email to `admin_users` table

5. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Database Schema

### Tables
- `movies` - Movie information with TMDb & Wikipedia data
- `people` - Actors, directors, composers, etc.
- `industries` - Tamil, Telugu, Malayalam, Hindi, etc.
- `roles` - Actor, Director, Composer, etc.
- `movie_people` - Junction table for movie-person relationships
- `awards` - National Film Awards, Filmfare, etc.
- `movie_awards` - Movie-award relationships
- `admin_users` - Admin access control

## Project Structure

```
src/
├── components/
│   ├── admin/          # Admin dashboard components
│   ├── layout/          # Navbar, Footer, Layout
│   ├── movie/           # Movie-related components
│   ├── person/          # Person-related components
│   └── ui/              # Reusable UI components
├── lib/
│   ├── constants.js     # Image URLs, sizes
│   ├── helpers.js       # Utility functions
│   ├── supabase.js      # Supabase client
│   ├── tmdb.js          # TMDb API integration
│   ├── utils.js         # Formatting utilities
│   └── wikipedia.js     # Wikipedia API integration
├── pages/
│   ├── admin/           # Admin pages
│   ├── Home.jsx
│   ├── Movies.jsx
│   ├── MovieDetail.jsx
│   ├── PersonDetail.jsx
│   ├── Search.jsx
│   ├── Discover.jsx
│   └── Login.jsx
├── store/
│   ├── app.js           # Auth & UI state
│   └── database.js      # Data fetching stores
├── App.jsx
├── main.jsx
└── index.css
```

## Design System

### Colors
- Primary: `#bf9b30` (Gold accent)
- Background: `#0a0a0f` (Dark)
- Card: `#141419`
- Text: `#f5f5f7`
- Secondary: `#86868b`

### Typography
- Font: Inter (Google Fonts)
- Weights: 300, 400, 500, 600, 700

### Components
- Glass morphism cards
- Smooth hover animations
- Horizontal scroll rows
- Skeleton loaders
- Responsive design (mobile-first)

## API Usage

### TMDb Integration
All TMDb data is fetched client-side from the frontend using the TMDb API key. No server-side proxy is needed.

### Wikipedia Integration
Wikipedia summaries are fetched and cached in Supabase for performance and to respect rate limits.

## Admin Usage

1. Sign in at `/login` with your admin credentials
2. Go to `/admin/import` to import movies from TMDb
3. The import will automatically fetch:
   - Movie details
   - Cast & crew
   - Wikipedia summary
4. Manage all data from the admin dashboard

## Performance Optimizations
- Lazy loading images
- Debounced search
- Skeleton loaders
- Cached Wikipedia data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- [The Movie Database (TMDb)](https://www.themoviedb.org/)
- [Wikipedia](https://www.wikipedia.org/)
- [Supabase](https://supabase.com/)
