export const ROLE_DEPARTMENTS = {
  Acting: ['Actor', 'Actress'],
  Directing: ['Director'],
  Production: ['Producer', 'Executive Producer'],
  Sound: ['Composer', 'Lyricist', 'Singer'],
  Camera: ['Cinematographer', 'Director of Photography'],
  Editing: ['Editor'],
  Writing: ['Screenplay', 'Story', 'Writer', 'Dialogue'],
  Art: ['Art Director', 'Production Designer'],
  Costume: ['Costume Designer'],
};

export const INDUSTRY_MAPPING = {
  ta: 'Tamil',
  te: 'Telugu',
  ml: 'Malayalam',
  hi: 'Hindi',
  kn: 'Kannada',
  bn: 'Bengali',
  mr: 'Marathi',
};

export const TMDB_DEPARTMENT_TO_ROLE = {
  Acting: 'Actor',
  Directing: 'Director',
  Production: 'Producer',
  Sound: 'Composer',
  Camera: 'Cinematographer',
  Editing: 'Editor',
  Writing: 'Writer',
  Art: 'Art Director',
  'Costume & Make-Up': 'Costume Designer',
};

export const normalizeRoleName = (department, job = null) => {
  if (job && ROLE_DEPARTMENTS.Sound.includes(job)) {
    return job;
  }
  return TMDB_DEPARTMENT_TO_ROLE[department] || department;
};

export const formatRuntime = (minutes) => {
  if (!minutes) return null;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

export const formatDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatYear = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString).getFullYear();
};

export const truncateText = (text, maxLength = 150) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

export const getTmdbImageUrl = (path, size = 'w500') => {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export const searchTmdbParams = (industry, year, genre) => {
  const params = {};
  
  if (industry && industry !== 'all') {
    params.with_original_language = industry;
  }
  if (year) {
    params.primary_release_year = year;
  }
  if (genre) {
    params.with_genres = genre;
  }
  
  return params;
};
