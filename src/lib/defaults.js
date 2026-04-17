export default {
  id: null,
  tmdb_id: null,
  title: '',
  original_title: '',
  overview: '',
  poster_path: '',
  backdrop_path: '',
  release_date: '',
  runtime: null,
  language: '',
  industry_id: null,
  wiki_summary: '',
  wiki_url: '',
  tmdb_rating: null,
  tmdb_vote_count: 0,
  genres: [],
};

export const personDefault = {
  id: null,
  tmdb_id: null,
  name: '',
  profile_path: '',
  bio: '',
  birthday: '',
  deathday: null,
  place_of_birth: '',
  wiki_summary: '',
  wiki_url: '',
  known_for_department: '',
  popularity: 0,
};

export const moviePersonDefault = {
  id: null,
  movie_id: null,
  person_id: null,
  role_id: null,
  character_name: '',
  job: '',
  order_index: 0,
};

export const awardDefault = {
  id: null,
  name: '',
  type: '',
  country: '',
};

export const movieAwardDefault = {
  id: null,
  movie_id: null,
  award_id: null,
  person_id: null,
  year: new Date().getFullYear(),
  category: '',
  result: 'nominated',
};

export const industryDefault = {
  id: null,
  name: '',
  slug: '',
};

export const roleDefault = {
  id: null,
  name: '',
  department: '',
};
