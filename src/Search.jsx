import { useParams, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import Pagination from './Pagination';
import Items from './Items';
import { PORT } from './Port';

export default function Search() {
  const { search } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(() => {
    return +searchParams.get('page') || 1;
  });
  const [movieResults, setMovieResults] = useState([]);
  const [tvResults, setTvResults] = useState([]);
  const [collectionResults, setCollectionResults] = useState([]);
  const [results, setResults] = useState(
    +sessionStorage.getItem('searchTabValue') || 1
  );
  useEffect(() => {
    async function fetchContent() {
      const cachedMovieResults = sessionStorage.getItem(
        `search-movie-results-${search}-page-${page}`
      );
      const cachedTvResults = sessionStorage.getItem(
        `search-tv-results-${search}-page-${page}`
      );
      const cachedCollectionResults = sessionStorage.getItem(
        `search-collection-results-${search}-page-${page}`
      );
      if (cachedMovieResults && cachedTvResults && cachedCollectionResults) {
        setMovieResults(JSON.parse(cachedMovieResults));
        setTvResults(JSON.parse(cachedTvResults));
        setCollectionResults(JSON.parse(cachedCollectionResults));
      } else {
        try {
          const [movieResponse, tvResponse, collectionResponse] =
            await Promise.all([
              fetch(`${PORT}/search/movie/${search}?page=${page}`),
              fetch(`${PORT}/search/tv/${search}?page=${page}`),
              fetch(`${PORT}/search/collections/${search}?page=${page}`),
            ]);

          const movieData = await movieResponse.json();
          const tvData = await tvResponse.json();
          const collectionsData = await collectionResponse.json();

          sessionStorage.setItem(
            `search-movie-results-${search}-page-${page}`,
            JSON.stringify(movieData)
          );
          sessionStorage.setItem(
            `search-tv-results-${search}-page-${page}`,
            JSON.stringify(tvData)
          );
          sessionStorage.setItem(
            `search-collection-results-${search}-page-${page}`,
            JSON.stringify(collectionsData)
          );

          setMovieResults(movieData);
          setTvResults(tvData);
          setCollectionResults(collectionsData);
        } catch (error) {
          console.error('Error fetching content:', error);
          if (error.name === 'QuotaExceededError') {
            console.warn('SessionStorage is full. Clearing sessionStorage...');
            sessionStorage.clear(); // Clear sessionStorage
            return fetchContent(); // Retry fetching data
          }
        }
      }
    }
    fetchContent(); // Fetches content whenever `search` changes
  }, [search, page]);

  function showResults(value) {
    sessionStorage.setItem('searchTabValue', value);
    setResults(value);
    setPage(1);
    setSearchParams({ page: 1 });
  }
  return (
    <div className="search-container">
      <HelmetProvider>
        <Helmet>
          <title>{`${search} | CinemaNest`}</title>
          <meta name="description" content="filler" />
        </Helmet>
      </HelmetProvider>
      <div className="search">
        <div className="search-type">
          <h2>Results</h2>
          <div>
            <button
              className={results === 1 ? 'active' : ''}
              onClick={() => showResults(1)}
              disabled={movieResults.total_results === 0}
            >
              <h3>
                Movies
                <span>{movieResults.total_results || '0'}</span>
              </h3>
            </button>
            <button
              className={results === 2 ? 'active' : ''}
              onClick={() => showResults(2)}
              disabled={tvResults.total_results === 0}
            >
              <h3>
                Tv Shows
                <span>{tvResults.total_results || '0'}</span>
              </h3>
            </button>
            <button
              className={results === 3 ? 'active' : ''}
              onClick={() => showResults(3)}
              disabled={collectionResults.total_results === 0}
            >
              <h3>
                Collections
                <span>{collectionResults.total_results || '0'}</span>
              </h3>
            </button>
          </div>
        </div>
        <div className="section-container">
          {results === 1 && (
            <>
              <Items items={movieResults.results} media_type={'movie'}></Items>
              {movieResults.results && (
                <Pagination
                  total_pages={movieResults.total_pages}
                  page={page}
                  setPage={setPage}
                  setSearchParams={setSearchParams}
                />
              )}
            </>
          )}
          {results === 2 && (
            <>
              <Items items={tvResults.results} media_type={'tv'}></Items>
              {tvResults.results && (
                <Pagination
                  total_pages={tvResults.total_pages}
                  page={page}
                  setPage={setPage}
                  setSearchParams={setSearchParams}
                />
              )}
            </>
          )}
          {results === 3 && (
            <>
              <Items
                items={collectionResults.results}
                media_type={'collection'}
              ></Items>
              {collectionResults.results && (
                <Pagination
                  total_pages={collectionResults.total_pages}
                  page={page}
                  setPage={setPage}
                  setSearchParams={setSearchParams}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
