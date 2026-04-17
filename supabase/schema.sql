-- CineVerse Database Schema
-- Regional Cinema Knowledge Platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Industries table (Tamil, Telugu, Malayalam, Hindi, etc.)
CREATE TABLE industries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Movies table
CREATE TABLE movies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tmdb_id INTEGER UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    original_title VARCHAR(500),
    overview TEXT,
    poster_path VARCHAR(500),
    backdrop_path VARCHAR(500),
    release_date DATE,
    runtime INTEGER,
    language VARCHAR(10),
    industry_id UUID REFERENCES industries(id) ON DELETE SET NULL,
    wiki_summary TEXT,
    wiki_url VARCHAR(500),
    tmdb_rating DECIMAL(3,1),
    tmdb_vote_count INTEGER DEFAULT 0,
    genres JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- People table (Actors, Directors, Composers, etc.)
CREATE TABLE people (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tmdb_id INTEGER UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    profile_path VARCHAR(500),
    bio TEXT,
    birthday DATE,
    deathday DATE,
    place_of_birth VARCHAR(255),
    wiki_summary TEXT,
    wiki_url VARCHAR(500),
    known_for_department VARCHAR(100),
    popularity DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Roles table (Actor, Director, Composer, Lyricist, Singer, etc.)
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    department VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Movie-People junction table
CREATE TABLE movie_people (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
    person_id UUID REFERENCES people(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    character_name VARCHAR(255),
    job VARCHAR(100),
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(movie_id, person_id, role_id)
);

-- Awards table
CREATE TABLE awards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    country VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Movie Awards junction table
CREATE TABLE movie_awards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
    award_id UUID REFERENCES awards(id) ON DELETE CASCADE,
    person_id UUID REFERENCES people(id) ON DELETE SET NULL,
    year INTEGER,
    category VARCHAR(255),
    result VARCHAR(50) CHECK (result IN ('won', 'nominated', 'selected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin users table
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_movies_industry ON movies(industry_id);
CREATE INDEX idx_movies_release_date ON movies(release_date DESC);
CREATE INDEX idx_movies_language ON movies(language);
CREATE INDEX idx_movie_people_movie ON movie_people(movie_id);
CREATE INDEX idx_movie_people_person ON movie_people(person_id);
CREATE INDEX idx_movie_awards_movie ON movie_awards(movie_id);
CREATE INDEX idx_people_tmdb ON people(tmdb_id);

-- Full text search index
CREATE INDEX idx_movies_search ON movies USING GIN (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(original_title, '') || ' ' || coalesce(overview, ''))
);

-- Insert default roles
INSERT INTO roles (name, department) VALUES
    ('Actor', 'Acting'),
    ('Actress', 'Acting'),
    ('Director', 'Directing'),
    ('Producer', 'Production'),
    ('Composer', 'Sound'),
    ('Lyricist', 'Sound'),
    ('Singer', 'Sound'),
    ('Cinematographer', 'Camera'),
    ('Editor', 'Editing'),
    ('Writer', 'Writing'),
    ('Art Director', 'Art'),
    ('Costume Designer', 'Costume & Make-Up');

-- Insert default industries
INSERT INTO industries (name, slug) VALUES
    ('Tamil', 'tamil'),
    ('Telugu', 'telugu'),
    ('Malayalam', 'malayalam'),
    ('Hindi', 'hindi'),
    ('Kannada', 'kannada'),
    ('Bengali', 'bengali'),
    ('Marathi', 'marathi');

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE movie_people ENABLE ROW LEVEL SECURITY;
ALTER TABLE awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE movie_awards ENABLE ROW LEVEL SECURITY;

-- Public read access for all content tables
CREATE POLICY "Public read access" ON movies FOR SELECT USING (true);
CREATE POLICY "Public read access" ON people FOR SELECT USING (true);
CREATE POLICY "Public read access" ON industries FOR SELECT USING (true);
CREATE POLICY "Public read access" ON roles FOR SELECT USING (true);
CREATE POLICY "Public read access" ON movie_people FOR SELECT USING (true);
CREATE POLICY "Public read access" ON awards FOR SELECT USING (true);
CREATE POLICY "Public read access" ON movie_awards FOR SELECT USING (true);

-- Admin write access policies (checked via service role)
CREATE POLICY "Admin write access movies" ON movies FOR ALL USING (true);
CREATE POLICY "Admin write access people" ON people FOR ALL USING (true);
CREATE POLICY "Admin write access industries" ON industries FOR ALL USING (true);
CREATE POLICY "Admin write access roles" ON roles FOR ALL USING (true);
CREATE POLICY "Admin write access movie_people" ON movie_people FOR ALL USING (true);
CREATE POLICY "Admin write access awards" ON awards FOR ALL USING (true);
CREATE POLICY "Admin write access movie_awards" ON movie_awards FOR ALL USING (true);
