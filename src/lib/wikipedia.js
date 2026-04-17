const WIKIPEDIA_BASE_URL = 'https://en.wikipedia.org/api/rest_v1';

const fetchFromWikipedia = async (endpoint) => {
  const url = `${WIKIPEDIA_BASE_URL}${endpoint}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Wikipedia API error: ${response.status}`);
  }
  
  return response.json();
};

export const wikipediaApi = {
  getSummary: async (title) => {
    const encodedTitle = encodeURIComponent(title.replace(/ /g, '_'));
    return fetchFromWikipedia(`/page/summary/${encodedTitle}`);
  },

  getPageUrl: (title) => {
    const encodedTitle = encodeURIComponent(title.replace(/ /g, '_'));
    return `https://en.wikipedia.org/wiki/${encodedTitle}`;
  },

  search: async (query, limit = 10) => {
    const url = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=${limit}&format=json&origin=*`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Wikipedia search error: ${response.status}`);
    }
    return response.json();
  },

  getExtract: async (title, sentences = 3) => {
    const encodedTitle = encodeURIComponent(title.replace(/ /g, '_'));
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodedTitle}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return {
      title: data.title,
      extract: data.extract,
      description: data.description,
      thumbnail: data.thumbnail?.source,
      pageUrl: data.content_urls?.desktop?.page,
    };
  },
};

export const searchWikipediaForMovie = async (movieTitle, year = null) => {
  try {
    const searchQuery = year ? `${movieTitle} ${year} film` : `${movieTitle} film`;
    const results = await wikipediaApi.search(searchQuery, 5);
    
    if (results && results[1] && results[1].length > 0) {
      const topResult = results[1][0];
      const summary = await wikipediaApi.getSummary(topResult);
      return {
        title: summary.title,
        extract: summary.extract,
        description: summary.description,
        thumbnail: summary.thumbnail?.source,
        url: summary.content_urls?.desktop?.page,
      };
    }
    return null;
  } catch (error) {
    console.error('Wikipedia search failed:', error);
    return null;
  }
};

export const searchWikipediaForPerson = async (personName) => {
  try {
    const results = await wikipediaApi.search(`${personName} Indian film`, 5);
    
    if (results && results[1] && results[1].length > 0) {
      const topResult = results[1][0];
      const summary = await wikipediaApi.getSummary(topResult);
      return {
        title: summary.title,
        extract: summary.extract,
        description: summary.description,
        thumbnail: summary.thumbnail?.source,
        url: summary.content_urls?.desktop?.page,
      };
    }
    return null;
  } catch (error) {
    console.error('Wikipedia search failed:', error);
    return null;
  }
};
